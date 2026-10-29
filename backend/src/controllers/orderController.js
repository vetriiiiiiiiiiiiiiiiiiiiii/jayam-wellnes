const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { serializeOrder } = require('../utils/serialize');
const { CURRENCY, US_STATES, ZIP_PATTERN, roundMoney, shippingFor } = require('../config/store');
const { getStripe } = require('../config/stripe');
const { markOrderPaid, releaseOrderStock, toCents } = require('../services/orderPayments');
const { publicOrder } = require('../utils/orderLinks');
const { escapeHtml, money } = require('../services/orderEmails');

class StockError extends Error {}

// Put reserved stock back (used when an order cannot be completed).
// Entries with a sku are variant stock; the rest are product-level stock.
const releaseStock = (reserved) =>
  prisma.$transaction(reserved.map(({ productId, sku, quantity }) => (sku
    ? prisma.productVariant.updateMany({ where: { productId, sku }, data: { stock: { increment: quantity } } })
    : prisma.product.updateMany({ where: { id: productId }, data: { stockQuantity: { increment: quantity } } }))));

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(serializeOrder)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // ensure order belongs to user
    if (order.userId && order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ success: true, order: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId && order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'This order is already paid. Please contact us to cancel it and get a refund.' });
    }

    const { count } = await prisma.order.updateMany({
      where: { id: order.id, status: { in: ['PENDING', 'PROCESSING'] }, paymentStatus: { not: 'PAID' } },
      data: { status: 'CANCELLED' }
    });
    if (count === 0) {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }
    await releaseOrderStock(order.id);
    const stripe = getStripe();
    if (stripe && order.stripePaymentIntentId) {
      await stripe.paymentIntents.cancel(order.stripePaymentIntentId).catch((error) =>
        console.error(`Could not cancel PaymentIntent for ${order.orderNumber}:`, error.message));
    }

    res.json({ success: true, message: 'Order cancelled successfully', status: 'CANCELLED' });
  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed' });
  }
};

exports.createOrder = async (req, res) => {
  let reservedVariants = [];
  let savedOrder;

  try {
    const { email, name, phone, address, items } = req.body;

    if (!email || !name || !address?.street || !address?.city || !address?.state || !address?.zipCode) {
      return res.status(400).json({ success: false, message: 'Complete your contact and shipping details before ordering.' });
    }
    if (!US_STATES.includes(String(address.state).toUpperCase())) {
      return res.status(400).json({ success: false, message: 'We currently ship within the United States and U.S. territories only.' });
    }
    if (!ZIP_PATTERN.test(String(address.zipCode).trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid 5-digit ZIP code.' });
    }
    const shippingAddress = {
      street: String(address.street).trim(),
      street2: address.street2 ? String(address.street2).trim() : undefined,
      city: String(address.city).trim(),
      state: String(address.state).toUpperCase(),
      zipCode: String(address.zipCode).trim(),
      country: 'United States',
    };
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ success: false, message: 'Your cart is empty or contains too many items.' });
    }
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Online payment is not set up yet. Please try again later.' });
    }

    let userId = null;
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch (error) {
        console.error('JWT verification failed for guest checkout:', error.message);
      }
    }
    if (userId && !(await prisma.user.findUnique({ where: { id: String(userId) }, select: { id: true } }))) {
      userId = null;
    }

    const orderItems = [];
    const requestedVariants = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ success: false, message: 'One or more cart items are invalid.' });
      }

      const product = await prisma.product.findFirst({
        where: { id: String(item.productId), isPublished: true },
        include: { variants: true, images: { orderBy: { position: 'asc' }, take: 1 } }
      });
      if (!product) {
        return res.status(400).json({ success: false, message: 'A product in your cart is no longer available.' });
      }

      let variant;
      let price = product.price;
      if (product.variants.length > 0) {
        if (!item.variantSku) {
          return res.status(400).json({ success: false, message: `Choose an option for ${product.name}.` });
        }
        variant = product.variants.find(({ sku }) => sku === item.variantSku);
        if (!variant) {
          return res.status(400).json({ success: false, message: `The selected option for ${product.name} is no longer available.` });
        }
        requestedVariants.push({ productId: product.id, sku: item.variantSku, quantity, name: product.name });
        price = variant.price ?? product.price;
      } else {
        // Products without options keep one stock count
        requestedVariants.push({ productId: product.id, sku: null, quantity, name: product.name });
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        variantName: variant?.name,
        variantSku: variant?.sku,
        image: product.images[0]?.url,
        quantity,
        price,
      });
    }

    const subtotal = roundMoney(orderItems.reduce((total, item) => total + item.price * item.quantity, 0));
    const shippingFee = shippingFor(subtotal);
    const orderTotal = roundMoney(subtotal + shippingFee);

    // Reserve stock and create the order atomically
    savedOrder = await prisma.$transaction(async (tx) => {
      for (const requested of requestedVariants) {
        const { count } = requested.sku
          ? await tx.productVariant.updateMany({
            where: {
              productId: requested.productId,
              sku: requested.sku,
              stock: { gte: requested.quantity },
              product: { isPublished: true }
            },
            data: { stock: { decrement: requested.quantity } }
          })
          : await tx.product.updateMany({
            where: { id: requested.productId, isPublished: true, stockQuantity: { gte: requested.quantity } },
            data: { stockQuantity: { decrement: requested.quantity } }
          });
        if (count === 0) {
          throw new StockError(`${requested.name} does not have enough stock for that quantity.`);
        }
      }

      return tx.order.create({
        data: {
          orderNumber: `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          userId,
          email: String(email).trim().toLowerCase(),
          name: String(name).trim(),
          phone: phone ? String(phone).trim() : null,
          address: shippingAddress,
          subtotal,
          shippingFee,
          total: orderTotal,
          currency: CURRENCY,
          status: 'PENDING',
          paymentMethod: 'STRIPE',
          paymentStatus: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: true }
      });
    });
    reservedVariants = requestedVariants;

    // USD only; the Payment Element shows cards, Apple Pay, Google Pay and any other
    // methods enabled in the Stripe Dashboard that support USD
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(orderTotal),
      currency: CURRENCY.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      description: `Order ${savedOrder.orderNumber}`,
      shipping: {
        name: savedOrder.name,
        phone: savedOrder.phone || undefined,
        address: {
          line1: shippingAddress.street,
          line2: shippingAddress.street2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: 'US',
        },
      },
      metadata: { orderId: savedOrder.id, orderNumber: savedOrder.orderNumber },
    }, { idempotencyKey: `order-${savedOrder.id}` });
    savedOrder = await prisma.order.update({
      where: { id: savedOrder.id },
      data: { stripePaymentIntentId: paymentIntent.id },
      include: { items: true }
    });

    res.status(201).json({
      success: true,
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      clientSecret: paymentIntent.client_secret,
      amount: orderTotal,
      currency: CURRENCY,
      order: publicOrder(savedOrder),
    });
  } catch (error) {
    if (error instanceof StockError) {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error(error);
    if (savedOrder) {
      await prisma.order.deleteMany({ where: { id: savedOrder.id } });
      await releaseStock(reservedVariants);
    }
    res.status(500).json({ success: false, message: 'We could not place your order. Please try again.' });
  }
};

const findOrderByNumber = (orderNumber) =>
  prisma.order.findUnique({ where: { orderNumber: String(orderNumber || '').trim().toUpperCase() }, include: { items: true } });

// POST /api/orders/confirm-payment — called by the checkout success page after Stripe
// returns. Checks the PaymentIntent with Stripe directly (the webhook does the same),
// so the order is marked paid even if the webhook has not arrived yet.
exports.confirmPayment = async (req, res) => {
  try {
    const { orderNumber, paymentIntentId } = req.body;
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ success: false, message: 'Online payment is not configured.' });
    if (!orderNumber || !paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    let order = await findOrderByNumber(orderNumber);
    if (!order || order.stripePaymentIntentId !== String(paymentIntentId)) {
      return res.status(404).json({ success: false, message: 'We could not find that order.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      order = (await markOrderPaid(paymentIntent)) || order;
    }

    res.json({ success: true, paymentStatus: paymentIntent.status, order: publicOrder(order) });
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({ success: false, message: 'We could not check your payment. Please contact us.' });
  }
};

// POST /api/orders/track — public order lookup by order number + email
exports.trackOrder = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const order = await findOrderByNumber(req.body.orderNumber);
    if (!order || !email || order.email !== email) {
      return res.status(404).json({ success: false, message: 'We could not find an order with that number and email.' });
    }
    res.json({ success: true, order: publicOrder(order) });
  } catch (error) {
    console.error('Order lookup failed:', error);
    res.status(500).json({ success: false, message: 'Order lookup failed. Please try again.' });
  }
};

// GET /api/orders/:orderNumber/receipt?token=… — printable receipt / invoice
exports.getReceipt = async (req, res) => {
  try {
    const order = await findOrderByNumber(req.params.orderNumber);
    const token = String(req.query.token || '');
    const valid = order && token.length === order.accessToken.length &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(order.accessToken));
    if (!valid || !['PAID', 'REFUNDED'].includes(order.paymentStatus)) {
      return res.status(404).type('html').send('<p style="font-family:sans-serif">Receipt not found.</p>');
    }

    const store = escapeHtml(process.env.STORE_NAME || 'Jayam Wellness');
    const a = order.address || {};
    const date = (value) => (value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—');
    res.set('Cache-Control', 'private, no-store').type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Receipt ${escapeHtml(order.orderNumber)} — ${store}</title>
<style>
  body{font-family:Helvetica,Arial,sans-serif;color:#1f2a22;background:#f6f3ec;margin:0;padding:24px 16px}
  .sheet{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;padding:32px}
  h1{font-family:Georgia,serif;font-weight:400;margin:0 0 4px}
  .muted{color:#666;font-size:14px}
  .grid{display:flex;flex-wrap:wrap;gap:24px;margin:24px 0}
  .grid>div{flex:1 1 200px}
  h2{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a6d3b;margin:0 0 6px}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{text-align:left;padding:10px 4px;border-bottom:1px solid #eee;font-size:14px}
  td.num,th.num{text-align:right}
  tfoot td{border:0;padding:6px 4px}
  .total td{font-weight:700;font-size:16px;border-top:2px solid #1f2a22}
  .actions{max-width:720px;margin:0 auto 16px;text-align:right}
  button{background:#234330;color:#fff;border:0;border-radius:999px;padding:10px 20px;font-size:14px;cursor:pointer}
  @media print{body{background:#fff;padding:0}.sheet{border-radius:0;padding:0}.actions{display:none}}
</style></head>
<body>
  <div class="actions"><button onclick="window.print()">Print / Save as PDF</button></div>
  <div class="sheet">
    <p class="muted">${store}</p>
    <h1>Receipt</h1>
    <p class="muted">Order ${escapeHtml(order.orderNumber)} · ${order.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Paid'} ${date(order.paidAt || order.createdAt)}</p>
    <div class="grid">
      <div><h2>Billed to</h2><div>${escapeHtml(order.name)}<br>${escapeHtml(order.email)}</div></div>
      <div><h2>Ship to</h2><div>${escapeHtml(a.street)}${a.street2 ? `<br>${escapeHtml(a.street2)}` : ''}<br>${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.zipCode)}<br>United States</div></div>
      <div><h2>Order date</h2><div>${date(order.createdAt)}</div><h2 style="margin-top:12px">Payment</h2><div>Online payment (Stripe), USD</div></div>
    </div>
    <table>
      <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${order.items.map((item) => `<tr><td>${escapeHtml(item.name)}${item.variantName ? ` <span class="muted">(${escapeHtml(item.variantName)})</span>` : ''}</td><td class="num">${item.quantity}</td><td class="num">${money(item.price)}</td><td class="num">${money(item.price * item.quantity)}</td></tr>`).join('')}
      </tbody>
      <tfoot>
        <tr><td colspan="3" class="num">Subtotal</td><td class="num">${money(order.subtotal)}</td></tr>
        <tr><td colspan="3" class="num">Shipping</td><td class="num">${order.shippingFee ? money(order.shippingFee) : 'Free'}</td></tr>
        <tr class="total"><td colspan="3" class="num">Total (USD)</td><td class="num">${money(order.total)}</td></tr>
      </tfoot>
    </table>
    <p class="muted" style="margin-top:24px">Thank you for shopping with ${store}.</p>
  </div>
</body></html>`);
  } catch (error) {
    console.error('Receipt failed:', error);
    res.status(500).type('html').send('<p style="font-family:sans-serif">Could not load this receipt.</p>');
  }
};
