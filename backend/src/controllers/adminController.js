const prisma = require('../config/prisma');
const { getStripe } = require('../config/stripe');
const { CARRIERS } = require('../utils/orderLinks');
const { sendShippingNotification, sendDeliveryNotification } = require('../services/orderEmails');
const { releaseOrderStock } = require('../services/orderPayments');
const { mediaQueue } = require('../services/queue');
const { productInclude, serializeOrder, serializeProduct, serializeUser } = require('../utils/serialize');

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ROLES = ['user', 'admin', 'staff'];

const toBool = (value) => value === 'true' || value === true;
const slugify = (name) => name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

// Append a short random suffix when another product already uses the slug
const uniqueSlug = async (name, excludeId) => {
  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!existing || existing.id === excludeId) return slug;
  return `${slug}-${Math.random().toString(36).substring(2, 7)}`;
};

// Queue background image processing for uploaded product images
const queueProductImages = async (productId, files) => {
  for (const file of files || []) {
    await mediaQueue.add('process-image', {
      fileId: productId,
      filePath: file.path,
      mimeType: file.mimetype,
      outputDir: 'uploads/products',
      modelName: 'Product',
      fieldName: 'images',
      operation: 'push'
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, recentOrders, revenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.order.aggregate({ _sum: { total: true } })
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: revenue._sum.total || 0,
      recentOrders: recentOrders.map(serializeOrder)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
    res.json({
      success: true,
      data: orders.map(serializeOrder)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const carrier = req.body.carrier ? String(req.body.carrier).toUpperCase() : undefined;
    const trackingNumber = req.body.trackingNumber ? String(req.body.trackingNumber).replace(/\s+/g, '').toUpperCase() : undefined;

    if (status && !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    if (carrier && !CARRIERS[carrier]) {
      return res.status(400).json({ message: 'Carrier must be USPS or UPS' });
    }
    if (trackingNumber && !/^[A-Z0-9]{8,40}$/.test(trackingNumber)) {
      return res.status(400).json({ message: 'Enter a valid tracking number' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const nextCarrier = carrier || existing.carrier;
    const nextTracking = trackingNumber || existing.trackingNumber;
    const trackingChanged = Boolean(trackingNumber || carrier) &&
      (nextTracking !== existing.trackingNumber || nextCarrier !== existing.carrier);
    if (trackingChanged && (!nextCarrier || !nextTracking)) {
      return res.status(400).json({ message: 'Add both a carrier and a tracking number' });
    }
    if ((trackingChanged || status === 'SHIPPED' || status === 'DELIVERED') && existing.paymentStatus !== 'PAID') {
      return res.status(400).json({ message: 'Only paid orders can be shipped' });
    }

    // Adding tracking ships the order unless the admin chose a later status
    const nextStatus = status || (trackingChanged && ['PENDING', 'PROCESSING'].includes(existing.status) ? 'SHIPPED' : undefined);
    const now = new Date();
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(nextStatus && { status: nextStatus }),
        ...(trackingChanged && { carrier: nextCarrier, trackingNumber: nextTracking }),
        ...(nextStatus === 'SHIPPED' && !existing.shippedAt && { shippedAt: now }),
        ...(nextStatus === 'DELIVERED' && !existing.deliveredAt && { deliveredAt: now, shippedAt: existing.shippedAt || now }),
      },
      include: { items: true }
    });

    let emailQueued = null;
    if (trackingChanged) {
      emailQueued = await sendShippingNotification(order);
    } else if (nextStatus === 'DELIVERED' && existing.status !== 'DELIVERED') {
      emailQueued = await sendDeliveryNotification(order);
    }

    res.json({ success: true, message: 'Order updated successfully', emailQueued, order: serializeOrder(order) });
  } catch (error) {
    console.error('[Admin] Order update failed:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// ==========================================
// ORDER REFUNDS
// ==========================================
exports.refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    const stripe = getStripe();
    const refund = order.paymentStatus === 'PAID' && order.stripePaymentIntentId;
    if (refund && !stripe) {
      return res.status(500).json({ message: 'Stripe keys missing on server' });
    }

    // Cancel in the database first so the payment_intent.canceled webhook is a no-op
    const { count } = await prisma.order.updateMany({
      where: { id, status: { not: 'CANCELLED' } },
      data: { status: 'CANCELLED', ...(refund && { paymentStatus: 'REFUNDED' }) }
    });
    if (count === 0) {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }
    await releaseOrderStock(order.id);

    if (refund) {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId }, { idempotencyKey: `refund-${order.id}` });
      console.log(`[Admin] Refund issued for order ${order.orderNumber}`);
    } else if (stripe && order.stripePaymentIntentId) {
      await stripe.paymentIntents.cancel(order.stripePaymentIntentId).catch((error) =>
        console.error(`[Admin] Could not cancel PaymentIntent for ${order.orderNumber}:`, error.message));
    }

    res.json({ success: true, message: refund ? 'Order cancelled and refunded successfully' : 'Order cancelled' });
  } catch (error) {
    console.error('[Admin] Refund Error:', error);
    res.status(500).json({ message: 'Failed to process cancellation and refund' });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { addresses: true }, orderBy: { createdAt: 'desc' } });
    res.json(users.map(serializeUser));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { addresses: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(serializeUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const { count } = await prisma.user.updateMany({ where: { id: req.params.id }, data: { role } });
    if (count === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.deleteMany({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// ==========================================
// PRODUCT MANAGEMENT
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: productInclude, orderBy: { createdAt: 'desc' } });
    res.json(products.map(serializeProduct));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isPublished, stockQuantity, addToHomeScreen } = req.body;
    if (!name || price === undefined || Number.isNaN(Number(price))) {
      return res.status(400).json({ error: 'Name and a valid price are required' });
    }

    const result = await prisma.product.create({
      data: {
        name,
        slug: await uniqueSlug(name),
        description,
        price: Number(price),
        isPublished: toBool(isPublished),
        addToHomeScreen: toBool(addToHomeScreen),
        stockQuantity: Number(stockQuantity || 0),
        images: imageUrl ? { create: [{ url: imageUrl, position: 0 }] } : undefined
      },
      include: productInclude
    });

    // Add media queue jobs for each uploaded file
    await queueProductImages(result.id, req.files);

    res.status(201).json(serializeProduct(result));
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    const data = {};
    for (const field of ['name', 'description', 'shortDescription', 'ingredients', 'usageInstructions', 'productType']) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.name) data.slug = await uniqueSlug(body.name, id);
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.compareAtPrice !== undefined) data.compareAtPrice = body.compareAtPrice === '' ? null : Number(body.compareAtPrice);
    if (body.stockQuantity !== undefined) data.stockQuantity = Number(body.stockQuantity || 0);
    if (body.isPublished !== undefined) data.isPublished = toBool(body.isPublished);
    if (body.addToHomeScreen !== undefined) data.addToHomeScreen = toBool(body.addToHomeScreen);

    // Handle image update simplistically for now
    if (body.imageUrl) {
      data.images = { deleteMany: {}, create: [{ url: body.imageUrl, position: 0 }] };
    }

    const product = await prisma.product.update({ where: { id }, data, include: productInclude });

    // Add media queue jobs for each uploaded file
    await queueProductImages(product.id, req.files);

    res.json({ success: true, product: serializeProduct(product) });
  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.deleteMany({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
