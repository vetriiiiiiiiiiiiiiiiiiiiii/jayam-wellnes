const prisma = require('../config/prisma');
const { CURRENCY } = require('../config/store');
const { sendOrderConfirmation } = require('./orderEmails');

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
// (webhook and the success page both call it); only the first call sends the email.
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
      ...(order.status === 'PENDING' && { status: 'PROCESSING' }),
    }
  });
  const paid = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });

  if (count > 0) {
    console.log(`[Payments] Order ${paid.orderNumber} paid (${paymentIntent.id})`);
    if (paid.userId) {
      await prisma.cartItem.deleteMany({ where: { cart: { userId: paid.userId } } });
    }
    await sendOrderConfirmation(paid);
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

module.exports = {
  toCents,
  releaseOrderStock,
  markOrderPaid,
  markPaymentFailed,
  cancelUnpaidOrder,
};
