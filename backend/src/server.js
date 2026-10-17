const app = require('./app');
const logger = require('./utils/logger');
const connectDb = require('./config/connectDb');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDb();
    logger.info("✅ PostgreSQL initialization complete");
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT} and listening on all interfaces`);
    });
  } catch (err) {
    logger.error("❌ DATABASE INITIALIZATION FAILED:", err.message);
    process.exit(1);
  }
})();

