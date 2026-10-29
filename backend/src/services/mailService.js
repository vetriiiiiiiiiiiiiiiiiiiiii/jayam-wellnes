const nodemailer = require('nodemailer');

// Sends email straight away — no queue or Redis needed.
//   1. Resend, when RESEND_API_KEY is set (the default for Jayam)
//   2. SMTP, when SMTP_HOST is set
//   3. Otherwise the email is logged, so local development never fails on mail
//
// MAIL_FROM must use a domain verified in Resend, e.g. "Jayam Wellness <orders@jayamwellness.com>".
// While testing, Resend's "onboarding@resend.dev" can only deliver to the Resend account's own inbox.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 10000;

const fromAddress = () =>
  process.env.MAIL_FROM || `${process.env.STORE_NAME || 'Jayam Wellness'} <onboarding@resend.dev>`;

let smtp;
const smtpTransport = () => {
  smtp ||= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return smtp;
};

const sendWithResend = async ({ to, subject, html, replyTo }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo && { reply_to: replyTo }),
      }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Resend ${response.status}: ${body.message || body.name || 'request failed'}`);
    }
    return { provider: 'resend', id: body.id };
  } finally {
    clearTimeout(timer);
  }
};

const sendWithSmtp = async ({ to, subject, html, replyTo }) => {
  const info = await smtpTransport().sendMail({ from: fromAddress(), to, subject, html, replyTo });
  return { provider: 'smtp', id: info.messageId };
};

const mailConfigured = () => Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);

/**
 * Send one email. Resolves with { provider, id } or rejects with the reason.
 * options.replyTo sets where replies go (e.g. the customer, for enquiry alerts).
 */
const sendEmail = async (to, subject, html, options = {}) => {
  if (!to) throw new Error('No recipient');
  const message = { to, subject, html, replyTo: options.replyTo };

  if (process.env.RESEND_API_KEY) return sendWithResend(message);
  if (process.env.SMTP_HOST) return sendWithSmtp(message);

  console.warn(`[Mail] Not configured (set RESEND_API_KEY) — would send "${subject}" to ${to}`);
  return { provider: 'log', id: null };
};

module.exports = {
  sendEmail,
  mailConfigured,
};
