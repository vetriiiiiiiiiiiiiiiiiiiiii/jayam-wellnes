const { Queue } = require("bullmq");
const { connection } = require("../config/redis");

// Create the Queues
const mediaQueue = new Queue("media-processing", { connection });
const notificationQueue = new Queue("notification-queue", { connection });
const orderProcessingQueue = new Queue("order-processing-queue", { connection });
const mailQueue = new Queue("mailQueue", { connection }); // Ensure mailQueue is exported

module.exports = {
  mediaQueue,
  notificationQueue,
  connection,
  orderProcessingQueue,
  mailQueue
};
