const prisma = require('../config/prisma');
const { sendEmail } = require('./mailService');
const { escapeHtml, money, layout, button } = require('./emailLayout');
const { frontendUrl } = require('../utils/orderLinks');

// Emails to the store team: new orders, low stock and payment disputes.
// They go to ORDER_ALERT_EMAIL (comma-separated), or SUPPORT_EMAIL when that is empty.

const lowStockLevel = () => Number(process.env.LOW_STOCK_THRESHOLD) || 10;

const recipients = () =>
  (process.env.ORDER_ALERT_EMAIL || process.env.SUPPORT_EMAIL || '').split(',').map((email) => email.trim()).filter(Boolean);

const alert = async (kind, subject, html) => {
  const to = recipients();
  if (to.length === 0) return;
  try {
    await sendEmail(to, subject, html);
  } catch (error) {
    console.error(`[AdminAlert] Could not send ${kind} alert:`, error.message);
  }
};

const itemList = (lines) => `<ul style="padding-left:18px">${lines.map((line) => `<li>${line}</li>`).join('')}</ul>`;

const newOrderAlert = (order) => alert('new order', `New order ${order.orderNumber} · ${money(order.total)}`, layout('New order', `
  <p><strong>${escapeHtml(order.name)}</strong> (${escapeHtml(order.email)}) paid <strong>${money(order.total)}</strong> for order ${escapeHtml(order.orderNumber)}.</p>
  ${itemList(order.items.map((item) => `${escapeHtml(item.name)}${item.variantName ? ` (${escapeHtml(item.variantName)})` : ''} × ${item.quantity}`))}
  ${order.discountCode ? `<p>Discount code ${escapeHtml(order.discountCode)}: −${money(order.discount)}</p>` : ''}
  <p>${button(`${frontendUrl()}/admin/orders`, 'Open orders')}</p>`, { team: true }));

// After an order is paid, warn about any of its products that are running low
const lowStockAlert = async (order) => {
  const ids = [...new Set(order.items.map((item) => item.productId).filter(Boolean))];
  if (ids.length === 0) return;
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: { variants: true } });
  const level = lowStockLevel();
  const low = [];
  for (const product of products) {
    if (product.variants.length) {
      product.variants.filter((variant) => variant.stock <= level).forEach((variant) => low.push(`${product.name} (${variant.name}): ${variant.stock} left`));
    } else if (product.stockQuantity <= level) {
      low.push(`${product.name}: ${product.stockQuantity} left`);
    }
  }
  if (low.length === 0) return;
  await alert('low stock', `Low stock: ${low.length} item${low.length === 1 ? '' : 's'}`, layout('Running low', `
    <p>These are at or below ${level} in stock:</p>
    ${itemList(low.map(escapeHtml))}
    <p>${button(`${frontendUrl()}/admin/products`, 'Update stock')}</p>`, { team: true }));
};

const disputeAlert = (dispute, order) => {
  const due = dispute.evidence_details?.due_by
    ? ` (by ${new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`
    : '';
  return alert('dispute', `Payment dispute${order ? ` on ${order.orderNumber}` : ''}`, layout('A customer disputed a payment', `
    <p>${order ? `Order <strong>${escapeHtml(order.orderNumber)}</strong> (${escapeHtml(order.email)})` : 'A payment'} has a dispute for <strong>${money(dispute.amount / 100)}</strong>. Reason: ${escapeHtml(String(dispute.reason || 'not given').replace(/_/g, ' '))}.</p>
    <p>Respond in the Stripe Dashboard${due}, with proof of delivery if you have it.</p>
    <p>${button('https://dashboard.stripe.com/disputes', 'Open Stripe disputes')}</p>`, { team: true }));
};

module.exports = { newOrderAlert, lowStockAlert, disputeAlert, recipients };
