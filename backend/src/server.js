const app = require('./app');
const logger = require('./utils/logger');
const connectDb = require('./config/connectDb');

const PORT = process.env.PORT || 5000;

// Refuse to start a production server with settings that would make it unsafe or broken
if (process.env.NODE_ENV === 'production') {
  const problems = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'change-me') {
    problems.push('JWT_SECRET must be a random string of at least 32 characters');
  }
  for (const key of ['DATABASE_URL', 'FRONTEND_URL', 'BACKEND_URL']) {
    if (!process.env[key]) problems.push(`${key} is not set`);
  }
  if (problems.length) {
    problems.forEach((problem) => logger.error(`❌ ${problem}`));
    process.exit(1);
  }
  for (const key of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'RESEND_API_KEY', 'MAIL_FROM']) {
    if (!process.env[key]) logger.warn(`⚠️  ${key} is not set`);
  }
}

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

