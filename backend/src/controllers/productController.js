const prisma = require('../config/prisma');
const { productInclude, serializeProduct, serializeReview } = require('../utils/serialize');

exports.getAllProducts = async (req, res) => {
  try {
    const where = { isPublished: true };
    if (req.query.type) {
      where.productType = req.query.type;
    }

    if (req.query.homeScreen === 'true') {
      where.addToHomeScreen = true;
    }

    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    // Sort logic
    let orderBy = { createdAt: 'desc' };
    if (req.query.sort === 'price-asc') orderBy = { price: 'asc' };
    else if (req.query.sort === 'price-desc') orderBy = { price: 'desc' };

    // Price filters
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price.gte = Number(req.query.minPrice);
      if (req.query.maxPrice) where.price.lte = Number(req.query.maxPrice);
    }

    const products = await prisma.product.findMany({ where, orderBy, include: productInclude });
    res.json(products.map(serializeProduct));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isPublished } = req.body;
    const slug = name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

    const result = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        isPublished: Boolean(isPublished),
        images: imageUrl ? { create: [{ url: imageUrl, position: 0 }] } : undefined
      },
      include: productInclude
    });
    res.status(201).json(serializeProduct(result));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      include: {
        ...productInclude,
        reviews: { orderBy: { createdAt: 'desc' } },
        bundleItems: { include: productInclude }
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { reviews, bundleItems, ...rest } = product;
    const obj = serializeProduct({ ...rest, bundleItems });
    obj.reviews = reviews.map(serializeReview);

    // For bundles, include the bundled products
    if (obj.productType === 'BUNDLE' && bundleItems.length > 0) {
      obj.relatedTo = bundleItems.map(rp => ({
        id: rp.id,
        relatedProduct: serializeProduct(rp)
      }));
    }

    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// POST /api/products/:id/reviews — posted straight away; remove unwanted ones in Admin → Reviews
exports.createReview = async (req, res) => {
  try {
    // Honeypot: real visitors never fill this hidden field
    if (req.body.website) return res.status(201).json({});

    const author = clean(req.body.author, 80);
    const title = clean(req.body.title, 120) || null;
    const content = clean(req.body.content, 2000) || null;
    const numericRating = Number(req.body.rating);

    if (!author || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Please add your name and a rating from 1 to 5 stars.' });
    }
    if (!content || content.length < 10) {
      return res.status(400).json({ error: 'Please write a few words about the product.' });
    }

    const product = await prisma.product.findFirst({ where: { id: String(req.params.id), isPublished: true }, select: { id: true, name: true, slug: true } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const result = await prisma.review.create({
      data: { productId: product.id, author, rating: numericRating, title, content }
    });
    res.status(201).json({ ...serializeReview(result), product: { name: product.name, slug: product.slug } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// GET /api/products/reviews/latest — the newest reviews across the shop, with the overall rating
exports.getLatestReviews = async (req, res) => {
  try {
    const where = { product: { isPublished: true } };
    const [reviews, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 9,
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.review.aggregate({ where, _avg: { rating: true }, _count: true }),
    ]);
    res.json({
      average: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
      count: stats._count,
      reviews: reviews.map(({ product, ...review }) => ({ ...serializeReview(review), product })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
};
