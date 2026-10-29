// Customer-facing links for an order (tracking page, carrier tracking, receipt)
const { mediaUrl } = require('./serialize');

const CARRIERS = {
  USPS: { name: 'USPS', trackingUrl: (number) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(number)}` },
  UPS: { name: 'UPS', trackingUrl: (number) => `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(number)}` },
};

const frontendUrl = () => (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const backendUrl = () => (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5005}`).replace(/\/$/, '');

const carrierTrackingUrl = (carrier, trackingNumber) =>
  CARRIERS[carrier] && trackingNumber ? CARRIERS[carrier].trackingUrl(trackingNumber) : null;

const trackOrderUrl = (order) => `${frontendUrl()}/track-order?order=${encodeURIComponent(order.orderNumber)}`;

const receiptUrl = (order) =>
  `${backendUrl()}/api/orders/${encodeURIComponent(order.orderNumber)}/receipt?token=${encodeURIComponent(order.accessToken)}`;

// What a customer may see about their order on the tracking and success pages
const publicOrder = (order) => ({
  orderNumber: order.orderNumber,
  name: order.name,
  email: order.email,
  status: order.status,
  paymentStatus: order.paymentStatus,
  createdAt: order.createdAt,
  paidAt: order.paidAt,
  shippedAt: order.shippedAt,
  deliveredAt: order.deliveredAt,
  carrier: order.carrier,
  trackingNumber: order.trackingNumber,
  trackingUrl: carrierTrackingUrl(order.carrier, order.trackingNumber),
  address: order.address,
  items: (order.items || []).map(({ name, variantName, image, quantity, price }) => ({ name, variantName, image: mediaUrl(image), quantity, price })),
  subtotal: order.subtotal,
  shippingFee: order.shippingFee,
  total: order.total,
  currency: order.currency,
  receiptUrl: order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED' ? receiptUrl(order) : null,
});

module.exports = {
  CARRIERS,
  carrierTrackingUrl,
  trackOrderUrl,
  receiptUrl,
  publicOrder,
};
