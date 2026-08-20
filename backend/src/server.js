const app = require('./app');
const logger = require('./utils/logger');
const connectMongo = require('./config/connectMongo');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectMongo();
    logger.info("✅ MongoDB initialization complete");
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ MONGODB INITIALIZATION FAILED:", err.message);
    process.exit(1);
  }
})();

