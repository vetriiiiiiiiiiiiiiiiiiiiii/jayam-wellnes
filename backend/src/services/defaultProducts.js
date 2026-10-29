const prisma = require('../config/prisma');
const products = require('../../scripts/data/products');
const stories = require('../../scripts/data/stories.json');

/**
 * Make sure the five Jayam products are in the shop — safe on a live site.
 * Missing products are created (published, 100 in stock, with their product story);
 * products that already exist are left as they are, except that one with no story
 * yet gets its default story. Nothing is ever deleted.
 */
async function addMissingProducts() {
  const added = [];
  const existing = [];
  const storiesAdded = [];

  for (const { images = [], specs = [], variants = [], ...product } of products) {
    const found = await prisma.product.findUnique({ where: { slug: product.slug }, select: { id: true, name: true, story: true } });
    if (found) {
      existing.push(found.name);
      if (!found.story && stories[product.slug]) {
        await prisma.product.update({ where: { id: found.id }, data: { story: stories[product.slug] } });
        storiesAdded.push(found.name);
      }
      continue;
    }
    await prisma.product.create({
      data: {
        ...product,
        story: stories[product.slug] || undefined,
        isPublished: true,
        stockQuantity: 100,
        images: { create: images },
        specs: { create: specs.map((spec, position) => ({ ...spec, position })) },
        variants: { create: variants.map((variant, position) => ({ ...variant, position })) },
      },
    });
    added.push(product.name);
  }
  return { added, existing, storiesAdded };
}

module.exports = { addMissingProducts, defaultStories: stories };
