const prisma = require('../config/prisma');
const { CURRENCY, roundMoney } = require('../config/store');
const { getStripe } = require('../config/stripe');
const { sendOrderConfirmation, sendRefundNotification } = require('./orderEmails');
const { newOrderAlert, lowStockAlert, disputeAlert } = require('./adminAlerts');
const { recordDiscountUse } = require('./discounts');

const toCents = (amount) => Math.round(amount * 100);

// Put reserved stock back for an order that will never be paid (variant or product level)
const releaseOrderStock = async (orderId) => {
  const items = await prisma.orderItem.findMany({ where: { orderId, productId: { not: null } } });
  if (items.length === 0) return;
  await prisma.$transaction(items.map(({ productId, variantSku, quantity }) => (variantSku
    ? prisma.productVariant.updateMany({ where: { productId, sku: variantSku }, data: { stock: { increment: quantity } } })
    : prisma.product.updateMany({ where: { id: productId }, data: { stockQuantity: { increment: quantity } } }))));
};

// Mark the order for a succeeded PaymentIntent as PAID. Safe to call more than once
// (webhook, the success page and the abandoned-checkout sweep all call it); only the
// first call sends the emails and counts the discount code.
const markOrderPaid = async (paymentIntent) => {
  const orderId = paymentIntent.metadata?.orderId;
  if (paymentIntent.status !== 'succeeded' || !orderId) return null;

  const order = await prisma.order.findFirst({ where: { id: orderId, stripePaymentIntentId: paymentIntent.id } });
  if (!order) {
    console.error(`[Payments] No order ${orderId} for PaymentIntent ${paymentIntent.id}`);
    return null;
  }
  if (paymentIntent.currency !== CURRENCY.toLowerCase() || paymentIntent.amount_received !== toCents(order.total)) {
    console.error(`[Payments] Amount mismatch for ${order.orderNumber}: received ${paymentIntent.amount_received} ${paymentIntent.currency}, expected ${toCents(order.total)}`);
    return null;
  }

  const { count } = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: { in: ['PENDING', 'FAILED'] } },
    data: {
      paymentStatus: 'PAID',
      paidAt: new Date(),
      // An order the sweep cancelled while the customer was still paying comes back
      ...(['PENDING', 'CANCELLED'].includes(order.status) && { status: 'PROCESSING' }),
    }
  });
  const paid = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });

  if (count > 0) {
    console.log(`[Payments] Order ${paid.orderNumber} paid (${paymentIntent.id})`);
    if (order.status === 'CANCELLED') {
      // Its stock was released by the sweep; take it again
      await prisma.$transaction(paid.items.filter((item) => item.productId).map(({ productId, variantSku, quantity }) => (variantSku
        ? prisma.productVariant.updateMany({ where: { productId, sku: variantSku }, data: { stock: { decrement: quantity } } })
        : prisma.product.updateMany({ where: { id: productId }, data: { stockQuantity: { decrement: quantity } } }))));
    }
    if (paid.userId) {
      await prisma.cartItem.deleteMany({ where: { cart: { userId: paid.userId } } });
    }
    await recordDiscountUse(paid.discountCode);
    await sendOrderConfirmation(paid);
    await newOrderAlert(paid);
    await lowStockAlert(paid).catch((error) => console.error('[Payments] Low stock check failed:', error.message));
  }
  return paid;
};

const markPaymentFailed = async (paymentIntent) => {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;
  // The customer can retry with the same PaymentIntent, so keep the order and its stock
  await prisma.order.updateMany({
    where: { id: orderId, stripePaymentIntentId: paymentIntent.id, paymentStatus: 'PENDING' },
    data: { paymentStatus: 'FAILED' }
  });
};

const cancelUnpaidOrder = async (paymentIntent) => {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, stripePaymentIntentId: paymentIntent.id, paymentStatus: { not: 'PAID' }, status: { not: 'CANCELLED' } },
    data: { status: 'CANCELLED' }
  });
  if (count > 0) await releaseOrderStock(orderId);
};

/**
 * Bring an order in line with the refunds on its Stripe charge. Called by the
 * charge.refunded webhook, so refunds made in the Stripe Dashboard show up too, and
 * by the admin refund action. Uses Stripe's running total, so repeats are harmless.
 * Returns { order, newlyRefunded } (the amount not recorded before), or null.
 */
const syncRefunds = async (charge) => {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return null;
  const order = await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId }, include: { items: true } });
  if (!order) return null;

  const refunded = roundMoney(charge.amount_refunded / 100);
  const newlyRefunded = roundMoney(refunded - order.refundedAmount);
  if (newlyRefunded <= 0) return { order, newlyRefunded: 0 };

  const full = charge.refunded || refunded >= order.total;
  const { count } = await prisma.order.updateMany({
    where: { id: order.id, refundedAmount: order.refundedAmount },
    data: {
      refundedAmount: refunded,
      refundedAt: new Date(),
      paymentStatus: full ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      // A full refund before shipping ends the order
      ...(full && ['PENDING', 'PROCESSING'].includes(order.status) && { status: 'CANCELLED' }),
    },
  });
  if (count === 0) return { order, newlyRefunded: 0 }; // someone else recorded it first

  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
  if (full && ['PENDING', 'PROCESSING'].includes(order.status)) await releaseOrderStock(order.id);
  console.log(`[Payments] ${updated.orderNumber}: refunded ${newlyRefunded} (total ${refunded})`);
  await sendRefundNotification(updated, newlyRefunded);
  return { order: updated, newlyRefunded };
};

const handleDispute = async (dispute) => {
  const paymentIntentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id;
  const order = paymentIntentId ? await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId } }) : null;
  console.warn(`[Payments] Dispute ${dispute.id} on ${order?.orderNumber || paymentIntentId}`);
  await disputeAlert(dispute, order);
};

// Unpaid checkouts hold stock. After ORDER_HOLD_MINUTES (default 120) the sweep checks
// each one with Stripe: paid ones are completed (a missed webhook), processing ones wait,
// and the rest are cancelled so their stock goes back on sale.
const holdMinutes = () => Number(process.env.ORDER_HOLD_MINUTES) || 120;

const sweepAbandonedOrders = async () => {
  const stripe = getStripe();
  const cutoff = new Date(Date.now() - holdMinutes() * 60 * 1000);
  const stale = await prisma.order.findMany({
    where: { status: 'PENDING', paymentStatus: { in: ['PENDING', 'FAILED'] }, createdAt: { lt: cutoff } },
    take: 100,
  });
  for (const order of stale) {
    try {
      if (stripe && order.stripePaymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        if (paymentIntent.status === 'succeeded') {
          await markOrderPaid(paymentIntent);
          continue;
        }
        if (paymentIntent.status === 'processing') continue;
        if (paymentIntent.status !== 'canceled') await stripe.paymentIntents.cancel(paymentIntent.id);
      }
      const { count } = await prisma.order.updateMany({
        where: { id: order.id, status: 'PENDING', paymentStatus: { not: 'PAID' } },
        data: { status: 'CANCELLED' },
      });
      if (count > 0) {
        await releaseOrderStock(order.id);
        console.log(`[Payments] Released abandoned checkout ${order.orderNumber}`);
      }
    } catch (error) {
      console.error(`[Payments] Could not sweep ${order.orderNumber}:`, error.message);
    }
  }
};

let sweepTimer;
const startAbandonedOrderSweep = () => {
  if (sweepTimer) return;
  const run = () => sweepAbandonedOrders().catch((error) => console.error('[Payments] Sweep failed:', error.message));
  sweepTimer = setInterval(run, 15 * 60 * 1000);
  sweepTimer.unref();
  setTimeout(run, 30 * 1000).unref();
};

module.exports = {
  toCents,
  releaseOrderStock,
  markOrderPaid,
  markPaymentFailed,
  cancelUnpaidOrder,
  syncRefunds,
  handleDispute,
  sweepAbandonedOrders,
  startAbandonedOrderSweep,
};
