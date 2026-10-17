const prisma = require("./prisma");

const connectDb = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ PostgreSQL connected via Prisma");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message || err);
    process.exit(1);
  }
};

module.exports = connectDb;
