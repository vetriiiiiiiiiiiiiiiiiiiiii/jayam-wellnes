require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL is not set — PostgreSQL connection will fail");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Single shared client for the whole process
const prisma = global.__prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

module.exports = prisma;
