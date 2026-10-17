const { Worker } = require("bullmq");
const { connection, notificationQueue } = require("../services/queue");
const prisma = require("../config/prisma");

const orderWorker = new Worker(
  "order-processing-queue",
  async (job) => {
    const { orderId, userId } = job.data;
    console.log(`\n⚙️ [OrderWorker] Processing Order: ${orderId}...`);

    try {
      // orderId here is the human-readable order number
      const { count } = await prisma.order.updateMany({
        where: { orderNumber: orderId, status: "PENDING" },
        data: { status: "PROCESSING" },
      });

      if (count > 0) {
        console.log(`[OrderWorker] ✅ Order ${orderId} moved to PROCESSING.`);

        await notificationQueue.add("push-user", {
          type: "push-user",
          recipientId: userId,
          data: {
            title: "Order Processing ⚙️",
            message: `Your order #${orderId} is being packed.`,
            url: `/profile/orders`,
          },
        });
      } else {
        console.log(`[OrderWorker] ⚠️ Order ${orderId} skipped (Not Pending).`);
      }
    } catch (err) {
      console.error(`[OrderWorker] ❌ Failed:`, err);
      throw err;
    }
  },
  { connection }
);

module.exports = orderWorker;
