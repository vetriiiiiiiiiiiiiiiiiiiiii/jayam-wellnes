const prisma = require('../config/prisma');
const { roundMoney } = require('../config/store');

// Discount codes from Admin → Discounts. A code takes money off the subtotal only;
// shipping is worked out on the subtotal before the discount.

const normaliseCode = (code) => String(code || '').trim().toUpperCase().replace(/\s+/g, '');

const discountAmount = (discount, subtotal) => {
  const amount = discount.type === 'PERCENT' ? subtotal * (discount.value / 100) : discount.value;
  return roundMoney(Math.min(Math.max(amount, 0), subtotal));
};

const describe = (discount) => (discount.type === 'PERCENT' ? `${discount.value}% off` : `$${discount.value.toFixed(2)} off`);

/**
 * Check a code against a subtotal. Resolves with { code, amount, label }
 * or { error } with a message the customer can read.
 */
const applyDiscount = async (rawCode, subtotal) => {
  const code = normaliseCode(rawCode);
  if (!code) return { error: 'Enter a discount code.' };
  const discount = await prisma.discountCode.findUnique({ where: { code } });
  const now = new Date();
  if (!discount || !discount.active || (discount.startsAt && discount.startsAt > now)) {
    return { error: 'That discount code isn’t valid.' };
  }
  if (discount.endsAt && discount.endsAt < now) return { error: 'That discount code has expired.' };
  if (discount.maxUses != null && discount.usedCount >= discount.maxUses) {
    return { error: 'That discount code has been fully used.' };
  }
  if (subtotal < discount.minSubtotal) {
    return { error: `That code needs a subtotal of $${discount.minSubtotal.toFixed(2)} or more.` };
  }
  return { code, amount: discountAmount(discount, subtotal), label: describe(discount) };
};

// Count a use once the order is paid
const recordDiscountUse = (code) =>
  code ? prisma.discountCode.updateMany({ where: { code }, data: { usedCount: { increment: 1 } } }) : null;

module.exports = { normaliseCode, applyDiscount, recordDiscountUse, describe };
