const { Worker } = require("bullmq");
const { connection, orderProcessingQueue } = require("../services/queue");
const Order = require("../models/orderModel");
const crypto = require("crypto");

const paymentWorker = new Worker(
  "payment-verification-queue",
  async (job) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId, userId } = job.data;
    console.log(`\n⚙️ [PaymentWorker] Verifying Payment for Order: ${orderId}...`);

    try {
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        console.log(`[PaymentWorker] ✅ Payment verified for ${orderId}`);
        
        // Update Order to Paid
        const order = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: 'PAID',
            status: 'PROCESSING'
          },
          { new: true }
        );

        if (order) {
          // Clear user cart if authenticated
          if (userId) {
            const Cart = require('../models/cartModel');
            await Cart.findOneAndUpdate({ userId }, { items: [] });
          }

          // Trigger Order Worker
          await orderProcessingQueue.add("process-order", {
            orderId: order.orderNumber,
            userId: userId
          });
        }
      } else {
        console.log(`[PaymentWorker] ❌ Verification failed for ${orderId}`);
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'FAILED'
        });
      }
    } catch (err) {
      console.error(`[PaymentWorker] ❌ Failed:`, err);
      throw err;
    }
  },
  { connection }
);

module.exports = paymentWorker;
