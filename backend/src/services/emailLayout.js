// Shared look for every email: white card, Jayam logo, teal palette, orange buttons
const { frontendUrl } = require('../utils/orderLinks');

const STORE_NAME = () => process.env.STORE_NAME || 'Jayam Wellness';

const escapeHtml = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

const button = (href, label, { quiet = false } = {}) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:${quiet ? '#ffffff' : '#fc8500'};color:#133a41;border:1px solid ${quiet ? '#cde0c9' : '#fc8500'};text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;margin:6px 8px 6px 0">${escapeHtml(label)}</a>`;

/**
 * Wrap an email body. options.team marks emails for the store team, which
 * skip the customer sign-off.
 */
const layout = (title, body, { team = false } = {}) => `
  <div style="background:#f1f6f0;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2c6975">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px 28px;border:1px solid #e0ecde">
      <a href="${escapeHtml(frontendUrl())}" style="text-decoration:none;color:#2c6975;display:inline-block;margin-bottom:20px">
        <img src="${escapeHtml(frontendUrl())}/jayam-logo.png" width="44" height="44" alt="" style="vertical-align:middle;border-radius:50%;margin-right:10px">
        <span style="vertical-align:middle;font-weight:700;letter-spacing:.2em;font-size:15px">${escapeHtml(STORE_NAME().toUpperCase())}</span>
      </a>
      <h1 style="margin:0 0 16px;font-weight:700;font-size:26px;line-height:1.2;color:#2c6975">${escapeHtml(title)}</h1>
      <div style="font-size:15px;line-height:1.6;color:#2c6975">${body}</div>
      ${team ? '' : `<p style="margin-top:28px;font-size:13px;color:#4f7f88">Questions? Just reply to this email${process.env.SUPPORT_EMAIL ? ` or write to ${escapeHtml(process.env.SUPPORT_EMAIL)}` : ''}.<br>— The ${escapeHtml(STORE_NAME())} team</p>`}
    </div>
    <p style="text-align:center;font-size:12px;color:#4f7f88;margin:16px 0 0">${escapeHtml(STORE_NAME())} · Shipping within the United States</p>
  </div>`;

module.exports = { STORE_NAME, escapeHtml, money, button, layout };
