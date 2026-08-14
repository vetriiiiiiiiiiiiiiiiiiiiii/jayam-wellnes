const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  { slug: "mogo-moringa-energy-bar", name: "Mogo Moringa Energy Bar", price: 60, featured: true, isPublished: true, isBestSeller: true, description: "Packed with natural energy, dates, and the power of Moringa." },
  { slug: "movita-sprouted-multi-grain-laddus", name: "Movita Multi-grain Laddus", price: 250, featured: true, isPublished: true, isBestSeller: true, description: "Traditional sprouted multi-grain laddus enriched with Moringa." },
  { slug: "beauty-drops-skin-hydration", name: "Beauty Drops - Skin Hydration", price: 850, featured: true, isPublished: true, description: "Deeply hydrating serum infused with Moringa oil extracts for a natural glow." },
  { slug: "colostrum-protein-bar", name: "Colostrum Protein Bar (Box of 10)", price: 300, featured: true, isPublished: true, description: "Premium colostrum protein bars to support recovery and wellness." },
  { slug: "drumstick-pulp-soup", name: "Drumstick Pulp Instant Soup", price: 540, featured: true, isPublished: true, description: "Nourishing instant soup packed with the goodness of drumstick pulp." },
  { slug: "moringa-rolled-masala-chai", name: "Moringa Rolled Masala Chai", price: 240, featured: true, isPublished: true, description: "A robust blend of traditional masala chai and premium Moringa leaves." }
];

async function main() {
  console.log('Seeding database with initial products...');

  for (const productData of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug }
    });

    if (!existing) {
      await prisma.product.create({
        data: productData
      });
      console.log(`Created product: ${productData.name}`);
    } else {
      console.log(`Product already exists: ${productData.name}`);
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
