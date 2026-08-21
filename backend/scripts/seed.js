require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const url = process.env.MONGO_DB || 'mongodb://127.0.0.1:27017/miracletree';
const client = new MongoClient(url);

async function seed() {
  try {
    await client.connect();
    console.log('Connected to MongoDB for seeding');
    const db = client.db();

    // Clear existing
    await db.collection('users').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('reviews').deleteMany({});

    // 1. Create Admin
    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@miracletree.com',
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Admin created (admin@miracletree.com / admin123)');

    // 2. Create Products
    const products = [
      {
        name: 'Moringa Face Oil',
        slug: 'moringa-face-oil',
        description: 'Rich in antioxidants and Vitamin E, this cold-pressed oil deeply hydrates and restores your skins natural glow.',
        price: 2499,
        compareAtPrice: 2999,
        isPublished: true,
        productType: 'SKINCARE',
        images: [{ url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800', position: 0 }],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Moringa Leaf Powder',
        slug: 'moringa-leaf-powder',
        description: 'Pure, organic moringa leaf powder. Add to smoothies, juices, or water for a daily nutrient boost.',
        price: 999,
        isPublished: true,
        productType: 'SUPPLEMENT',
        images: [{ url: 'https://images.unsplash.com/photo-1610484251752-675270275841?w=800', position: 0 }],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Moringa Hair Serum',
        slug: 'moringa-hair-serum',
        description: 'Strengthen and nourish your hair from root to tip with our specialized moringa-infused hair serum.',
        price: 1899,
        isPublished: true,
        productType: 'HAIRCARE',
        images: [{ url: 'https://images.unsplash.com/photo-1608248593874-cb48b261b606?w=800', position: 0 }],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedProducts = await db.collection('products').insertMany(products);
    console.log(`Seeded ${insertedProducts.insertedCount} products`);

    const p1Id = Object.values(insertedProducts.insertedIds)[0];
    const p2Id = Object.values(insertedProducts.insertedIds)[1];

    // 3. Create a Bundle
    const bundle = {
      name: 'The Ultimate Glow Bundle',
      slug: 'ultimate-glow-bundle',
      description: 'Get our best-selling face oil and leaf powder for holistic inside-out radiance.',
      price: 2999,
      compareAtPrice: 3498,
      isPublished: true,
      productType: 'BUNDLE',
      images: [{ url: 'https://images.unsplash.com/photo-1615396899839-c99c14188f00?w=800', position: 0 }],
      relatedToIds: [p1Id.toString(), p2Id.toString()],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('products').insertOne(bundle);
    console.log('Seeded bundle');

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await client.close();
  }
}

seed();
