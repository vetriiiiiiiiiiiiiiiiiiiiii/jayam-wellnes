// Adds the five Jayam products to the database — safe on a live site.
// Missing products are created (published, 100 in stock, with their story); existing
// ones are left as they are. Nothing else is touched or deleted.
// The same action is the "Add the Jayam products" button in Admin → Products.
//
//   npm run db:products
require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const prisma = require('../src/config/prisma');
const { addMissingProducts } = require('../src/services/defaultProducts');

addMissingProducts()
  .then(({ added, existing, storiesAdded }) => {
    existing.forEach((name) => console.log(`• Already in the shop: ${name}`));
    storiesAdded.forEach((name) => console.log(`✓ Added the product story to: ${name}`));
    added.forEach((name) => console.log(`✓ Added: ${name}`));
    console.log(added.length ? `\nDone — added ${added.length} product${added.length === 1 ? '' : 's'}.` : '\nNothing to add — all five products are already in the shop.');
  })
  .catch((error) => {
    console.error('Adding products failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
