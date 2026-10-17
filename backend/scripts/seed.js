require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');
const products = require('./data/products');

// Turn plain product data into a Prisma nested create
const toProductData = ({ images = [], specs = [], variants = [], ...product }) => ({
  ...product,
  images: { create: images },
  specs: { create: specs.map((spec, position) => ({ ...spec, position })) },
  variants: { create: variants.map((variant, position) => ({ ...variant, position })) }
});

async function seed() {
  try {
    console.log('Connected to PostgreSQL for seeding');

    // Clear existing (children cascade from products/users/orders)
    await prisma.enquiry.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Create Admin
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@miracletree.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const password = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        fullname: 'Admin User',
        username: 'admin',
        email: adminEmail,
        password,
        role: 'admin'
      }
    });
    console.log(`Admin created (${adminEmail})`);

    // 2. Create Products
    for (const [index, product] of products.entries()) {
      await prisma.product.create({
        data: toProductData({
          ...product,
          isPublished: true,
          addToHomeScreen: index < 4,
          stockQuantity: 100,
        })
      });
    }
    console.log(`Seeded ${products.length} products`);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
