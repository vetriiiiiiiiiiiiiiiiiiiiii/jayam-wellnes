const prisma = require('../config/prisma');
const { getStripe } = require('../config/stripe');
const { CARRIERS } = require('../utils/orderLinks');
const { sendShippingNotification, sendDeliveryNotification } = require('../services/orderEmails');
const { releaseOrderStock } = require('../services/orderPayments');
const { addProductImages, deleteStoredImage, removeQuietly, storeImage } = require('../services/mediaService');
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

exports.getDashboardStats = async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const paid = { paymentStatus: 'PAID' };
    // One query at a time: quick enough, and gentle on small database plans
    const queries = [
      prisma.order.aggregate({ where: paid, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { ...paid, paidAt: { gte: since } }, _sum: { total: true } }),
      prisma.order.count({ where: { ...paid, paidAt: { gte: since } } }),
      prisma.order.count({ where: { ...paid, status: 'PROCESSING' } }),
      prisma.order.count({ where: { paymentStatus: 'PENDING', status: 'PENDING', createdAt: { gte: since } } }),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.product.count(),
      prisma.product.findMany({
        where: { isPublished: true, stockQuantity: { lt: 10 } },
        select: { id: true, name: true, slug: true, stockQuantity: true },
        orderBy: { stockQuantity: 'asc' },
        take: 6,
      }),
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.orderItem.groupBy({
        by: ['name'],
        where: { order: paid },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ];
    // Prisma queries only run when awaited, so this runs them in turn
    const answers = [];
    for (const query of queries) answers.push(await query);
    const [
      revenueAll, revenue30, orders30, toShip, awaitingPayment, newEnquiries,
      customers, totalProducts, lowStock, recentOrders, topItems,
    ] = answers;

    res.json({
      totalRevenue: revenueAll._sum.total || 0,
      paidOrders: revenueAll._count || 0,
      revenue30: revenue30._sum.total || 0,
      orders30,
      toShip,
      awaitingPayment,
      newEnquiries,
      customers,
      totalProducts,
      lowStock,
      topProducts: topItems.map((item) => ({ name: item.name, quantity: item._sum.quantity || 0 })),
      recentOrders: recentOrders.map(serializeOrder),
    });
  } catch (error) {
    console.error('[Admin] Dashboard failed:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
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
    const users = await prisma.user.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users.map(({ _count, googleId, ...user }) => ({
      ...serializeUser(user),
      orderCount: _count.orders,
      signIn: googleId ? (user.password ? 'Google + email' : 'Google') : 'Email',
    })));
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
    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'You can’t remove your own admin access' });
    }

    const { count } = await prisma.user.updateMany({ where: { id: req.params.id }, data: { role } });
    if (count === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'You can’t delete your own account here' });
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

// ---------- Product editing ----------
// The admin form sends multipart data: plain fields, JSON for lists
// (highlights, specs, keepImageIds) and the new image files under "images".

const TEXT_FIELDS = ['name', 'tagline', 'shortDescription', 'description', 'ingredients', 'usageInstructions', 'warnings', 'disclaimer', 'category', 'productType'];
const PRODUCT_TYPES = ['SUPPLEMENT', 'SKINCARE', 'BUNDLE'];

const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const cleanText = (value, max = 20000) => (typeof value === 'string' ? value.trim().slice(0, max) : value);

// Turn the form body into Prisma data; returns { data, specs, error }
const productDataFrom = (body, { creating }) => {
  const data = {};
  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) data[field] = cleanText(body[field]) || null;
  }
  if (creating && !data.name) return { error: 'Product name is required' };
  if (data.name === null) return { error: 'Product name cannot be empty' };
  if (data.productType && !PRODUCT_TYPES.includes(data.productType)) return { error: 'Choose a valid product type' };

  if (body.price !== undefined || creating) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return { error: 'Enter a valid price' };
    data.price = Math.round(price * 100) / 100;
  }
  if (body.compareAtPrice !== undefined) {
    const compare = body.compareAtPrice === '' ? null : Number(body.compareAtPrice);
    if (compare !== null && (!Number.isFinite(compare) || compare < 0)) return { error: 'Enter a valid compare-at price' };
    data.compareAtPrice = compare === null ? null : Math.round(compare * 100) / 100;
  }
  if (body.stockQuantity !== undefined) {
    const stock = Number.parseInt(body.stockQuantity || '0', 10);
    if (!Number.isFinite(stock) || stock < 0) return { error: 'Stock must be zero or more' };
    data.stockQuantity = stock;
  }
  if (body.isPublished !== undefined) data.isPublished = toBool(body.isPublished);
  if (body.addToHomeScreen !== undefined) data.addToHomeScreen = toBool(body.addToHomeScreen);

  if (body.highlights !== undefined) {
    const highlights = parseJson(body.highlights, []);
    if (!Array.isArray(highlights)) return { error: 'Highlights must be a list' };
    data.highlights = highlights
      .map((item) => ({ title: cleanText(String(item?.title || ''), 200), body: cleanText(String(item?.body || ''), 2000) }))
      .filter((item) => item.title || item.body);
  }

  let specs;
  if (body.specs !== undefined) {
    const list = parseJson(body.specs, []);
    if (!Array.isArray(list)) return { error: 'Specifications must be a list' };
    specs = list
      .map((item, position) => ({ name: cleanText(String(item?.name || ''), 120), value: cleanText(String(item?.value || ''), 500), position }))
      .filter((item) => item.name && item.value);
  }
  return { data, specs };
};

exports.createProduct = async (req, res) => {
  const files = req.files || [];
  try {
    const { data, specs, error } = productDataFrom(req.body, { creating: true });
    if (error) {
      files.forEach((file) => removeQuietly(file.path));
      return res.status(400).json({ message: error });
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: await uniqueSlug(data.name),
        ...(specs?.length && { specs: { create: specs } }),
      },
    });
    await addProductImages(product.id, files);

    const full = await prisma.product.findUnique({ where: { id: product.id }, include: productInclude });
    res.status(201).json({ success: true, product: serializeProduct(full) });
  } catch (error) {
    files.forEach((file) => removeQuietly(file.path));
    console.error('Create Product Error:', error);
    res.status(500).json({ message: error.message?.startsWith('Please upload') || error.message?.startsWith('Images must') ? error.message : 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  const files = req.files || [];
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!existing) {
      files.forEach((file) => removeQuietly(file.path));
      return res.status(404).json({ message: 'Product not found' });
    }

    const { data, specs, error } = productDataFrom(req.body, { creating: false });
    if (error) {
      files.forEach((file) => removeQuietly(file.path));
      return res.status(400).json({ message: error });
    }
    if (data.name && data.name !== existing.name) data.slug = await uniqueSlug(data.name, id);

    // Images: keep the listed ones in the given order, delete the rest
    const keepIds = parseJson(req.body.keepImageIds, null);
    const removed = Array.isArray(keepIds) ? existing.images.filter((image) => !keepIds.includes(image.id)) : [];

    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (specs) {
        await tx.productSpec.deleteMany({ where: { productId: id } });
        if (specs.length) await tx.productSpec.createMany({ data: specs.map((spec) => ({ ...spec, productId: id })) });
      }
      if (Array.isArray(keepIds)) {
        if (removed.length) await tx.productImage.deleteMany({ where: { id: { in: removed.map((image) => image.id) } } });
        for (const [position, imageId] of keepIds.entries()) {
          await tx.productImage.updateMany({ where: { id: imageId, productId: id }, data: { position } });
        }
      }
    });
    removed.forEach((image) => deleteStoredImage(image.url));
    await addProductImages(id, files);

    const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
    res.json({ success: true, product: serializeProduct(product) });
  } catch (err) {
    files.forEach((file) => removeQuietly(file.path));
    console.error('Update Product Error:', err);
    res.status(500).json({ message: err.message?.startsWith('Please upload') || err.message?.startsWith('Images must') ? err.message : 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: { images: true, orderItems: { select: { id: true }, take: 1 } } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Products that appear in orders are unpublished instead, so order history stays intact
    if (product.orderItems.length) {
      await prisma.product.update({ where: { id: product.id }, data: { isPublished: false } });
      return res.json({ success: true, archived: true, message: 'This product has orders, so it was unpublished instead of deleted' });
    }
    await prisma.product.delete({ where: { id: product.id } });
    product.images.forEach((image) => deleteStoredImage(image.url));
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// One image for site content (e.g. the Our difference cards); returns its public URL
exports.uploadContentImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload' });
  try {
    const url = await storeImage(req.file, 'content', 'site');
    res.status(201).json({ success: true, url });
  } catch (error) {
    removeQuietly(req.file.path);
    res.status(400).json({ message: error.message || 'Upload failed' });
  }
};
