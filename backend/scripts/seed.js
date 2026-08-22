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
        shortDescription: 'Deeply hydrates and restores your skin\'s natural glow.',
        description: 'Rich in antioxidants and Vitamin E, this cold-pressed oil deeply hydrates and restores your skin\'s natural glow. Carefully crafted to provide the ultimate nourishment for all skin types. Used daily, it reduces the appearance of fine lines and leaves your skin feeling supple and radiant.',
        ingredients: '100% Pure Cold-Pressed Moringa Oleifera Seed Oil, Vitamin E (Tocopherol), Rosehip Oil extract.',
        usageInstructions: 'Apply 3-5 drops to cleansed and toned skin. Massage gently in upward circular motions. Use morning and night for best results.',
        price: 2499,
        compareAtPrice: 2999,
        isPublished: true,
        productType: 'SKINCARE',
        specs: [
          { name: 'Skin Type', value: 'All Skin Types' },
          { name: 'Benefits', value: 'Hydrating, Anti-aging, Brightening' },
          { name: 'Expiry', value: '24 Months from manufacturing' }
        ],
        variants: [
          { name: '30ml Standard', size: '30ml', price: 2499, compareAtPrice: 2999, stock: 50, sku: 'MFO-30' },
          { name: '50ml Value Size', size: '50ml', price: 3499, compareAtPrice: 4299, stock: 30, sku: 'MFO-50' }
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800', position: 0 },
          { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800', position: 1 },
          { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', position: 2 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Moringa Leaf Powder',
        slug: 'moringa-leaf-powder',
        shortDescription: 'Pure, organic moringa leaf powder for a daily nutrient boost.',
        description: 'Pure, organic moringa leaf powder. Add to smoothies, juices, or water for a daily nutrient boost. Sourced from the finest organic farms, our powder is gently shade-dried to retain maximum nutritional value. It is packed with vitamins, minerals, and essential amino acids.',
        ingredients: '100% Organic Moringa Oleifera Leaf Powder.',
        usageInstructions: 'Mix 1 teaspoon (approx 5g) into warm water, smoothies, juices, or sprinkle over salads. Do not boil to retain nutrients.',
        price: 999,
        compareAtPrice: 1299,
        isPublished: true,
        productType: 'SUPPLEMENT',
        specs: [
          { name: 'Origin', value: 'South India' },
          { name: 'Dietary', value: 'Vegan, Gluten-Free' },
          { name: 'Expiry', value: '18 Months from manufacturing' }
        ],
        variants: [
          { name: '100g Pack', size: '100g', price: 999, compareAtPrice: 1299, stock: 100, sku: 'MLP-100' },
          { name: '250g Pack', size: '250g', price: 1999, compareAtPrice: 2499, stock: 75, sku: 'MLP-250' }
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1610484251752-675270275841?w=800', position: 0 },
          { url: 'https://images.unsplash.com/photo-1512223792601-592a98090059?w=800', position: 1 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Moringa Hair Serum',
        slug: 'moringa-hair-serum',
        shortDescription: 'Strengthen and nourish your hair from root to tip.',
        description: 'Strengthen and nourish your hair from root to tip with our specialized moringa-infused hair serum. Formulated to reduce frizz, add shine, and protect against environmental damage without weighing your hair down.',
        ingredients: 'Moringa Oil, Argan Oil, Jojoba Oil, Rosemary Essential Oil, Vitamin E.',
        usageInstructions: 'Apply 2-3 drops to damp or dry hair, focusing on the mid-lengths to ends. Style as usual.',
        price: 1899,
        compareAtPrice: 2299,
        isPublished: true,
        productType: 'HAIRCARE',
        specs: [
          { name: 'Hair Type', value: 'All Hair Types' },
          { name: 'Benefits', value: 'Frizz Control, Shine, Strength' }
        ],
        variants: [
          { name: '50ml Bottle', size: '50ml', price: 1899, compareAtPrice: 2299, stock: 40, sku: 'MHS-50' }
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1608248593874-cb48b261b606?w=800', position: 0 }
        ],
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
