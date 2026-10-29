const prisma = require('../config/prisma');
const { sendEmail } = require('../services/mailService');
const { withId } = require('../utils/serialize');

const CATEGORIES = {
  PRODUCT_QUESTION: 'Product Question',
  ORDER_SUPPORT: 'Order Support',
  SHIPPING: 'Shipping',
  RETURNS: 'Returns',
  WHOLESALE: 'Wholesale/Business',
  OTHER: 'Other',
};
const STATUSES = ['NEW', 'RESPONDED', 'CLOSED'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Send an email without holding up the response; failures are logged
const queueEmail = (to, subject, html, replyTo) => {
  if (!to) return;
  sendEmail(to, subject, html, { replyTo }).catch((error) =>
    console.error(`[Enquiry] Could not send email to ${to}:`, error.message)
  );
};

exports.createEnquiry = async (req, res) => {
  try {
    // Honeypot: real visitors never fill this hidden field
    if (req.body.website) {
      return res.status(201).json({ success: true, message: 'Thank you — your enquiry has been received.' });
    }

    const name = clean(req.body.name, 120);
    const email = clean(req.body.email, 200).toLowerCase();
    const phone = clean(req.body.phone, 40) || null;
    const subject = clean(req.body.subject, 200);
    const message = clean(req.body.message, 5000);
    const orderNumber = clean(req.body.orderNumber, 40) || null;
    const category = CATEGORIES[req.body.category] ? req.body.category : 'OTHER';

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in your name, email, subject and message.' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const enquiry = await prisma.enquiry.create({
      data: { name, email, phone, subject, category, orderNumber, message }
    });

    const storeName = process.env.STORE_NAME || 'Jayam Wellness';
    const categoryLabel = CATEGORIES[category];

    // 1. Automatic confirmation to the customer
    queueEmail(
      email,
      `We've received your enquiry — ${storeName}`,
      `<p>Hi ${escapeHtml(name)},</p>
       <p>Thank you for contacting ${escapeHtml(storeName)}. We've received your enquiry and will respond within 1 business day.</p>
       <p><strong>Subject:</strong> ${escapeHtml(subject)}<br><strong>Topic:</strong> ${escapeHtml(categoryLabel)}</p>
       <p>Warm regards,<br>The Jayam team</p>`,
      process.env.SUPPORT_EMAIL || undefined
    );

    // 2. Notification to the Jayam support inbox
    queueEmail(
      process.env.SUPPORT_EMAIL,
      `[${categoryLabel}] ${subject}`,
      `<p><strong>New enquiry from the website</strong></p>
       <p><strong>Name:</strong> ${escapeHtml(name)}<br>
       <strong>Email:</strong> ${escapeHtml(email)}<br>
       ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}<br>` : ''}
       <strong>Category:</strong> ${escapeHtml(categoryLabel)}<br>
       ${orderNumber ? `<strong>Order number:</strong> ${escapeHtml(orderNumber)}<br>` : ''}
       <strong>Subject:</strong> ${escapeHtml(subject)}</p>
       <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      email
    );

    res.status(201).json({
      success: true,
      message: "Thank you — we've received your enquiry and will respond within 1 business day.",
      enquiryId: enquiry.id
    });
  } catch (error) {
    console.error('Create Enquiry Error:', error);
    res.status(500).json({ success: false, message: 'We could not send your message. Please try again.' });
  }
};

// ==========================================
// ADMIN
// ==========================================
exports.getAllEnquiries = async (req, res) => {
  try {
    const where = STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
    const enquiries = await prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: enquiries.map(withId) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const { count } = await prisma.enquiry.updateMany({ where: { id: req.params.id }, data: { status } });
    if (count === 0) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, message: 'Enquiry updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update enquiry' });
  }
};
