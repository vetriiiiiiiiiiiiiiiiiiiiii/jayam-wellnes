const { sendEmail } = require('./mailService');
const { STORE_NAME, escapeHtml, money, button, layout } = require('./emailLayout');
const { CARRIERS, carrierTrackingUrl, receiptUrl, trackOrderUrl, frontendUrl } = require('../utils/orderLinks');

// Customer emails: order confirmation, shipping, delivery, refund, cancellation and welcome

const row = (label, value, strong = false) =>
  `<tr><td style="padding:6px 0;${strong ? 'font-weight:700' : 'color:#4f7f88'}">${label}</td><td style="padding:6px 0;text-align:right;${strong ? 'font-weight:700' : ''}">${value}</td></tr>`;

const itemsTable = (order) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px">
    ${order.items.map((item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e0ecde">${escapeHtml(item.name)}${item.variantName ? ` <span style="color:#4f7f88">(${escapeHtml(item.variantName)})</span>` : ''} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e0ecde;text-align:right">${money(item.price * item.quantity)}</td>
      </tr>`).join('')}
    ${row('Subtotal', money(order.subtotal))}
    ${order.discount ? row(`Discount${order.discountCode ? ` (${escapeHtml(order.discountCode)})` : ''}`, `−${money(order.discount)}`) : ''}
    ${row('Shipping', order.shippingFee ? money(order.shippingFee) : 'Free')}
    ${row('Total', money(order.total), true)}
    ${order.refundedAmount ? row('Refunded', `−${money(order.refundedAmount)}`) : ''}
  </table>`;

const shipTo = (order) => {
  const a = order.address || {};
  return `<p style="margin:0;color:#4f7f88">${escapeHtml(order.name)}<br>${escapeHtml(a.street)}${a.street2 ? `, ${escapeHtml(a.street2)}` : ''}<br>${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.zipCode)}</p>`;
};

const firstName = (name) => escapeHtml(String(name || 'there').split(' ')[0]);

const confirmationEmail = (order) => ({
  subject: `Order ${order.orderNumber} confirmed`,
  html: layout('Thank you for your order', `
    <p>Hi ${firstName(order.name)}, we've received your payment and are getting order <strong>${escapeHtml(order.orderNumber)}</strong> ready. We'll email you a tracking number as soon as it ships.</p>
    ${itemsTable(order)}
    <h3 style="font-size:14px;margin:16px 0 6px">Shipping to</h3>
    ${shipTo(order)}
    <p style="margin-top:20px">${button(trackOrderUrl(order), 'Track your order')}${button(receiptUrl(order), 'View receipt', { quiet: true })}</p>`),
});

const shippedEmail = (order) => {
  const carrier = CARRIERS[order.carrier]?.name || order.carrier;
  const link = carrierTrackingUrl(order.carrier, order.trackingNumber);
  return {
    subject: `Your order ${order.orderNumber} has shipped`,
    html: layout('Your order is on its way', `
      <p>Good news, ${firstName(order.name)}: order <strong>${escapeHtml(order.orderNumber)}</strong> has shipped with ${escapeHtml(carrier)}.</p>
      <p>Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong></p>
      <p>${link ? button(link, `Track with ${carrier}`) : ''}${button(trackOrderUrl(order), 'Order status', { quiet: true })}</p>
      <p style="color:#4f7f88">Delivery usually takes 2–7 business days; Alaska, Hawaii and U.S. territories may take longer.</p>
      <h3 style="font-size:14px;margin:16px 0 6px">Shipping to</h3>
      ${shipTo(order)}`),
  };
};

const deliveredEmail = (order) => ({
  subject: `Your order ${order.orderNumber} was delivered`,
  html: layout('Your order has been delivered', `
    <p>Order <strong>${escapeHtml(order.orderNumber)}</strong> has been marked as delivered. We hope you enjoy it!</p>
    <p>If anything is missing or not right, reply to this email and we'll help.</p>
    <p>${button(trackOrderUrl(order), 'View your order')}${button(receiptUrl(order), 'View receipt', { quiet: true })}</p>`),
});

// amount: the money returned by this refund
const refundEmail = (order, amount) => {
  const full = order.paymentStatus === 'REFUNDED';
  return {
    subject: `Refund for order ${order.orderNumber}`,
    html: layout(full ? 'Your refund is on its way' : 'We’ve refunded part of your order', `
      <p>Hi ${firstName(order.name)}, we've refunded <strong>${money(amount)}</strong> for order <strong>${escapeHtml(order.orderNumber)}</strong> to your original payment method.</p>
      <p style="color:#4f7f88">Refunds usually appear within 5–10 business days, depending on your bank.</p>
      ${itemsTable(order)}
      <p>${button(receiptUrl(order), 'View receipt')}</p>`),
  };
};

// For orders cancelled before they were paid (nothing was charged)
const cancelledEmail = (order) => ({
  subject: `Order ${order.orderNumber} cancelled`,
  html: layout('Your order was cancelled', `
    <p>Hi ${firstName(order.name)}, order <strong>${escapeHtml(order.orderNumber)}</strong> has been cancelled. You have not been charged.</p>
    <p>${button(`${frontendUrl()}/shop`, 'Shop again')}</p>`),
});

const welcomeEmail = (user) => ({
  subject: `Welcome to ${STORE_NAME()}`,
  html: layout('Welcome to Jayam', `
    <p>Hi ${firstName(user.fullname)}, thank you for creating an account.</p>
    <p>Your account keeps your orders in one place, so you can follow each one from payment to your door.</p>
    <p>${button(`${frontendUrl()}/shop`, 'Explore the collection')}${button(`${frontendUrl()}/account`, 'Your account', { quiet: true })}</p>`),
});

// Send a customer email; a failure is logged and never blocks the order itself
const deliver = async (kind, to, label, { subject, html }) => {
  try {
    const result = await sendEmail(to, subject, html, { replyTo: process.env.SUPPORT_EMAIL || undefined });
    console.log(`[Email] Sent ${kind} email for ${label} via ${result.provider}`);
    return result.provider !== 'log';
  } catch (error) {
    console.error(`[Email] Could not send ${kind} email for ${label}:`, error.message);
    return false;
  }
};

const sendOrderEmail = (kind, email, order) => deliver(kind, order.email, order.orderNumber, email);

module.exports = {
  escapeHtml,
  money,
  sendOrderConfirmation: (order) => sendOrderEmail('confirmation', confirmationEmail(order), order),
  sendShippingNotification: (order) => sendOrderEmail('shipping', shippedEmail(order), order),
  sendDeliveryNotification: (order) => sendOrderEmail('delivery', deliveredEmail(order), order),
  sendRefundNotification: (order, amount) => sendOrderEmail('refund', refundEmail(order, amount), order),
  sendCancellationNotification: (order) => sendOrderEmail('cancellation', cancelledEmail(order), order),
  sendWelcomeEmail: (user) => deliver('welcome', user.email, user.email, welcomeEmail(user)),
};
