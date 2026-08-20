const express = require('express');
const { getDb, ObjectId } = require('../utils/db');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    
    // Simple filter by type if provided (e.g. ?type=BUNDLE)
    const query = {};
    if (req.query.type) {
      query.productType = req.query.type;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Sort logic
    const sort = {};
    if (req.query.sort === 'price-asc') sort.price = 1;
    else if (req.query.sort === 'price-desc') sort.price = -1;
    else sort.createdAt = -1;
    
    // Price filters
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const products = await db.collection('products').find(query).sort(sort).toArray();
    
    // Map _id to id for frontend compatibility
    res.json(products.map(p => ({ ...p, id: p._id.toString() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const db = getDb();
    const { name, description, price, imageUrl, isPublished } = req.body;
    const slug = name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

    const newProduct = {
      name,
      slug,
      description,
      price: Number(price),
      isPublished: Boolean(isPublished),
      images: imageUrl ? [{ url: imageUrl, position: 0 }] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(newProduct);
    res.status(201).json({ ...newProduct, id: result.insertedId.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const db = getDb();
    
    const product = await db.collection('products').findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    product.id = product._id.toString();

    // Fetch reviews
    const reviews = await db.collection('reviews')
      .find({ productId: product._id.toString() })
      .sort({ createdAt: -1 })
      .toArray();
      
    product.reviews = reviews.map(r => ({ ...r, id: r._id.toString() }));

    // For bundles, populate relatedTo
    if (product.productType === 'BUNDLE' && product.relatedToIds && product.relatedToIds.length > 0) {
      const relatedProducts = await db.collection('products')
        .find({ _id: { $in: product.relatedToIds.map(id => new ObjectId(id)) } })
        .toArray();
        
      product.relatedTo = relatedProducts.map(rp => ({
        id: rp._id.toString(),
        relatedProduct: { ...rp, id: rp._id.toString() }
      }));
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    const db = getDb();
    const { author, rating, title, content } = req.body;
    
    const newReview = {
      productId: req.params.id,
      author,
      rating: Number(rating),
      title,
      content,
      createdAt: new Date()
    };
    
    const result = await db.collection('reviews').insertOne(newReview);
    res.status(201).json({ ...newReview, id: result.insertedId.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;
