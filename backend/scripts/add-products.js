// Adds the five Jayam products to the database — safe on a live site.
// Products are matched by slug: missing ones are created (published, 100 in stock),
// existing ones are left exactly as they are. Nothing else is touched or deleted.
//
//   npm run db:products
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const prisma = require('../src/config/prisma');
const products = require('./data/products');

async function addProducts() {
  let created = 0;
  try {
    for (const { images = [], specs = [], variants = [], ...product } of products) {
      const existing = await prisma.product.findUnique({ where: { slug: product.slug }, select: { id: true, name: true } });
      if (existing) {
        console.log(`• Already in the shop: ${existing.name}`);
        continue;
      }
      await prisma.product.create({
        data: {
          ...product,
          isPublished: true,
          stockQuantity: 100,
          images: { create: images },
          specs: { create: specs.map((spec, position) => ({ ...spec, position })) },
          variants: { create: variants.map((variant, position) => ({ ...variant, position })) },
        },
      });
      created += 1;
      console.log(`✓ Added: ${product.name}`);
    }
    console.log(created ? `\nDone — added ${created} product${created === 1 ? '' : 's'}.` : '\nNothing to add — all five products are already in the shop.');
  } catch (error) {
    console.error('Adding products failed:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

addProducts();
