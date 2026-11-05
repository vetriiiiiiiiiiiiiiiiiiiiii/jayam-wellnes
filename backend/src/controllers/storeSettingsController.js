const prisma = require('../config/prisma');
const { getStripe } = require('../config/stripe');
const { sendEmail, mailConfigured, parseFrom } = require('../services/mailService');
const { layout } = require('../services/emailLayout');
const { recipients } = require('../services/adminAlerts');
const { normaliseCode } = require('../services/discounts');
const { googleConfigured } = require('../config/passport');
const { withId } = require('../utils/serialize');

// Admin → Discounts and Admin → Setup

// ---------- Discount codes ----------
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const discountData = (body) => {
  const code = normaliseCode(body.code);
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { error: 'Codes are 3–32 letters, numbers, - or _' };
  const type = body.type === 'FIXED' ? 'FIXED' : 'PERCENT';
  const value = Number(body.value);
  if (!Number.isFinite(value) || value <= 0 || (type === 'PERCENT' && value > 100)) {
    return { error: type === 'PERCENT' ? 'Enter a percentage between 1 and 100' : 'Enter the dollars off' };
  }
  const minSubtotal = body.minSubtotal === '' || body.minSubtotal == null ? 0 : Number(body.minSubtotal);
  const maxUses = body.maxUses === '' || body.maxUses == null ? null : Number(body.maxUses);
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) return { error: 'Minimum order must be 0 or more' };
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) return { error: 'Use limit must be a whole number, or empty' };
  const startsAt = parseDate(body.startsAt);
  const endsAt = parseDate(body.endsAt);
  if (startsAt === undefined || endsAt === undefined) return { error: 'Enter valid dates' };
  if (startsAt && endsAt && endsAt <= startsAt) return { error: 'The end date must be after the start date' };
  return { data: { code, type, value, minSubtotal, maxUses, startsAt, endsAt, active: body.active !== false } };
};

exports.listDiscounts = async (req, res) => {
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(discounts.map(withId));
};

exports.saveDiscount = async (req, res) => {
  const { data, error } = discountData(req.body || {});
  if (error) return res.status(400).json({ message: error });
  try {
    const discount = req.params.id
      ? await prisma.discountCode.update({ where: { id: req.params.id }, data })
      : await prisma.discountCode.create({ data });
    res.status(req.params.id ? 200 : 201).json(withId(discount));
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'That code already exists' });
    if (err.code === 'P2025') return res.status(404).json({ message: 'Discount not found' });
    console.error('[Admin] Discount save failed:', err);
    res.status(500).json({ message: 'Could not save the discount' });
  }
};

exports.deleteDiscount = async (req, res) => {
  const { count } = await prisma.discountCode.deleteMany({ where: { id: req.params.id } });
  if (!count) return res.status(404).json({ message: 'Discount not found' });
  res.json({ success: true });
};

// ---------- Setup check ----------
const keyMode = (key) => (!key ? null : key.startsWith('sk_live_') || key.startsWith('rk_live_') ? 'live' : 'test');

// GET /admin/setup — what is configured, without revealing any secret
exports.getSetup = async (req, res) => {
  const backendUrl = (process.env.BACKEND_URL || '').replace(/\/$/, '');
  const mailFrom = process.env.MAIL_FROM || '';
  const sender = parseFrom();
  let stripeAccount = null;
  const stripe = getStripe();
  if (stripe) {
    try {
      const account = await stripe.accounts.retrieve();
      stripeAccount = { ok: true, name: account.settings?.dashboard?.display_name || account.business_profile?.name || account.id, chargesEnabled: account.charges_enabled };
    } catch (error) {
      stripeAccount = { ok: false, error: error.message };
    }
  }
  res.json({
    stripe: {
      secretKey: Boolean(process.env.STRIPE_SECRET_KEY),
      mode: keyMode(process.env.STRIPE_SECRET_KEY),
      webhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      webhookUrl: backendUrl ? `${backendUrl}/api/payments/stripe/webhook` : null,
      account: stripeAccount,
    },
    email: {
      provider: process.env.RESEND_API_KEY ? 'resend' : process.env.SMTP_HOST ? 'smtp' : null,
      configured: mailConfigured(),
      from: sender.from || null,
      fromError: sender.error || null,
      fromIsTestAddress: !mailFrom || mailFrom.includes('resend.dev'),
      supportEmail: process.env.SUPPORT_EMAIL || null,
      alertRecipients: recipients(),
    },
    google: googleConfigured(),
    urls: { frontend: process.env.FRONTEND_URL || null, backend: backendUrl || null },
    orderHoldMinutes: Number(process.env.ORDER_HOLD_MINUTES) || 120,
    lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD) || 10,
  });
};

// POST /admin/setup/test-email — sends a test email to the signed-in admin
exports.sendTestEmail = async (req, res) => {
  try {
    const result = await sendEmail(req.user.email, 'Test email from your store', layout('Email is working', `
      <p>This test was sent from the admin panel. Order confirmations, shipping updates and store alerts will look like this.</p>`, { team: true }));
    if (result.provider === 'log') {
      return res.status(400).json({ message: 'Email is not set up yet: add RESEND_API_KEY to backend/.env and restart the API' });
    }
    res.json({ success: true, message: `Sent to ${req.user.email} via ${result.provider === 'resend' ? 'Resend' : 'SMTP'}` });
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};
