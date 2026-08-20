const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { connection } = require('../config/redis');

const mailWorker = new Worker('mailQueue', async (job) => {
  const { to, subject, html } = job.data;
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(`[MailWorker] Sending email to ${to}...`);
  await transporter.sendMail({
    from: `"${process.env.STORE_NAME || 'Ecommerce'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`[MailWorker] Email successfully sent to ${to}!`);
}, { connection });

mailWorker.on('completed', (job) => {
  console.log(`[MailWorker] Job ${job.id} has completed!`);
});

mailWorker.on('failed', (job, err) => {
  console.log(`[MailWorker] Job ${job.id} has failed with ${err.message}`);
});

module.exports = mailWorker;
