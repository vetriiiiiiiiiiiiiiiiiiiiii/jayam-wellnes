const { sendEmail } = require('./mailService');
const { CARRIERS, carrierTrackingUrl, receiptUrl, trackOrderUrl } = require('../utils/orderLinks');

const STORE_NAME = () => process.env.STORE_NAME || 'Jayam Wellness';

const escapeHtml = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const button = (href, label) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:#234330;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;margin:6px 8px 6px 0">${escapeHtml(label)}</a>`;

const itemsTable = (order) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0">
    ${order.items.map((item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(item.name)}${item.variantName ? ` <span style="color:#777">(${escapeHtml(item.variantName)})</span>` : ''} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${money(item.price * item.quantity)}</td>
      </tr>`).join('')}
    <tr><td style="padding:6px 0;color:#555">Subtotal</td><td style="padding:6px 0;text-align:right">${money(order.subtotal)}</td></tr>
    <tr><td style="padding:6px 0;color:#555">Shipping</td><td style="padding:6px 0;text-align:right">${order.shippingFee ? money(order.shippingFee) : 'Free'}</td></tr>
    <tr><td style="padding:6px 0;font-weight:700">Total</td><td style="padding:6px 0;text-align:right;font-weight:700">${money(order.total)}</td></tr>
  </table>`;

const layout = (title, body) => `
  <div style="background:#f6f3ec;padding:24px 12px;font-family:Helvetica,Arial,sans-serif;color:#1f2a22">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
      <p style="margin:0 0 4px;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#8a6d3b">${escapeHtml(STORE_NAME())}</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:26px">${escapeHtml(title)}</h1>
      ${body}
      <p style="margin-top:24px;font-size:13px;color:#777">Questions? Just reply to this email${process.env.SUPPORT_EMAIL ? ` or write to ${escapeHtml(process.env.SUPPORT_EMAIL)}` : ''}.</p>
    </div>
  </div>`;

const shipTo = (order) => {
  const a = order.address || {};
  return `<p style="margin:0;color:#555">${escapeHtml(order.name)}<br>${escapeHtml(a.street)}${a.street2 ? `, ${escapeHtml(a.street2)}` : ''}<br>${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.zipCode)}</p>`;
};

const confirmationEmail = (order) => ({
  subject: `Order ${order.orderNumber} confirmed`,
  html: layout('Thank you for your order', `
    <p>Hi ${escapeHtml(order.name.split(' ')[0])}, we've received your payment and are getting order <strong>${escapeHtml(order.orderNumber)}</strong> ready. We'll email you a tracking number as soon as it ships.</p>
    ${itemsTable(order)}
    <h3 style="font-size:14px;margin:16px 0 6px">Shipping to</h3>
    ${shipTo(order)}
    <p style="margin-top:20px">${button(trackOrderUrl(order), 'Track your order')}${button(receiptUrl(order), 'View receipt')}</p>`),
});

const shippedEmail = (order) => {
  const carrier = CARRIERS[order.carrier]?.name || order.carrier;
  const link = carrierTrackingUrl(order.carrier, order.trackingNumber);
  return {
    subject: `Your order ${order.orderNumber} has shipped`,
    html: layout('Your order is on its way', `
      <p>Good news — order <strong>${escapeHtml(order.orderNumber)}</strong> has shipped with ${escapeHtml(carrier)}.</p>
      <p>Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong></p>
      <p>${link ? button(link, `Track with ${carrier}`) : ''}${button(trackOrderUrl(order), 'Order status')}</p>
      <p style="color:#555">Delivery usually takes 2–7 business days; Alaska, Hawaii and U.S. territories may take longer.</p>
      <h3 style="font-size:14px;margin:16px 0 6px">Shipping to</h3>
      ${shipTo(order)}`),
  };
};

const deliveredEmail = (order) => ({
  subject: `Your order ${order.orderNumber} was delivered`,
  html: layout('Your order has been delivered', `
    <p>Order <strong>${escapeHtml(order.orderNumber)}</strong> has been marked as delivered. We hope you enjoy it!</p>
    <p>If anything is missing or not right, reply to this email and we'll help.</p>
    <p>${button(trackOrderUrl(order), 'View your order')}${button(receiptUrl(order), 'View receipt')}</p>`),
});

// Send an order email; a failure is logged and never blocks the order itself
const sendOrderEmail = async (kind, { subject, html }, order) => {
  try {
    const result = await sendEmail(order.email, subject, html, { replyTo: process.env.SUPPORT_EMAIL || undefined });
    console.log(`[OrderEmail] Sent ${kind} email for ${order.orderNumber} via ${result.provider}`);
    return result.provider !== 'log';
  } catch (error) {
    console.error(`[OrderEmail] Could not send ${kind} email for ${order.orderNumber}:`, error.message);
    return false;
  }
};

module.exports = {
  escapeHtml,
  money,
  sendOrderConfirmation: (order) => sendOrderEmail('confirmation', confirmationEmail(order), order),
  sendShippingNotification: (order) => sendOrderEmail('shipping', shippedEmail(order), order),
  sendDeliveryNotification: (order) => sendOrderEmail('delivery', deliveredEmail(order), order),
};
