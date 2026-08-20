import nodemailer from 'nodemailer';

// Reusable transporter using Ethereal (mock email service)
// In production, replace with real SMTP credentials (e.g. Resend, SendGrid)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'demian.bergnaum92@ethereal.email',
    // Replace with a real test account or process.env
    pass: 'ZJ35p5N54n67a8r8p5'
  }
});
export async function sendOrderReceivedAdminEmail(order) {
  try {
    const info = await transporter.sendMail({
      from: '"Miracle Tree Orders" <orders@miracletree.in>',
      to: 'admin@miracletree.in',
      // Admin email
      subject: `New Order Received - #${order.orderNumber}`,
      html: `
        <h1>New Order Received!</h1>
        <p><strong>Order ID:</strong> ${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.shippingAddress}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><a href="http://localhost:3000/admin/orders/${order.id}">View Order in Admin Panel</a></p>
      `
    });
    console.log("Admin Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending admin email", error);
  }
}
export async function sendOrderConfirmedEmail(email, order) {
  try {
    const info = await transporter.sendMail({
      from: '"Miracle Tree" <support@miracletree.in>',
      to: email,
      subject: `Your Order is Confirmed - #${order.orderNumber}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>#${order.orderNumber}</strong> has been successfully placed and is now confirmed.</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p>We will notify you once it ships.</p>
      `
    });
    console.log("Confirmation Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending confirmation email", error);
  }
}
export async function sendOrderShippedEmail(email, order) {
  try {
    const info = await transporter.sendMail({
      from: '"Miracle Tree" <support@miracletree.in>',
      to: email,
      subject: `Your Order has Shipped! - #${order.orderNumber}`,
      html: `
        <h1>Good News!</h1>
        <p>Your order <strong>#${order.orderNumber}</strong> has been shipped.</p>
        <p>It is on its way to you.</p>
      `
    });
    console.log("Shipped Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending shipped email", error);
  }
}
export async function sendOrderDeliveredEmail(email, order) {
  try {
    const info = await transporter.sendMail({
      from: '"Miracle Tree" <support@miracletree.in>',
      to: email,
      subject: `Your Order has been Delivered! - #${order.orderNumber}`,
      html: `
        <h1>Order Delivered!</h1>
        <p>Your order <strong>#${order.orderNumber}</strong> has been delivered.</p>
        <p>We hope you enjoy your products!</p>
      `
    });
    console.log("Delivered Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending delivered email", error);
  }
}