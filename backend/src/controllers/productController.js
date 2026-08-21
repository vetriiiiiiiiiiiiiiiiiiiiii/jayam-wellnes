const Product = require('../models/productModel');
const Review = require('../models/reviewModel');

exports.getAllProducts = async (req, res) => {
  try {
    const query = {};
    if (req.query.type) {
      query.productType = req.query.type;
    }

    if (req.query.homeScreen === 'true') {
      query.addToHomeScreen = true;
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

    const products = await Product.find(query).sort(sort);
    
    // Map _id to id for frontend compatibility
    res.json(products.map(p => {
      const obj = p.toObject();
      obj.id = obj._id.toString();
      return obj;
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isPublished } = req.body;
    const slug = name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

    const newProduct = new Product({
      name,
      slug,
      description,
      price: Number(price),
      isPublished: Boolean(isPublished),
      images: imageUrl ? [{ url: imageUrl, position: 0 }] : []
    });

    const result = await newProduct.save();
    res.status(201).json({ ...result.toObject(), id: result._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const obj = product.toObject();
    obj.id = obj._id.toString();

    // Fetch reviews
    const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });
    obj.reviews = reviews.map(r => {
      const rObj = r.toObject();
      rObj.id = rObj._id.toString();
      return rObj;
    });

    // For bundles, populate relatedTo
    if (obj.productType === 'BUNDLE' && obj.relatedToIds && obj.relatedToIds.length > 0) {
      const relatedProducts = await Product.find({ _id: { $in: obj.relatedToIds } });
        
      obj.relatedTo = relatedProducts.map(rp => {
        const rpObj = rp.toObject();
        rpObj.id = rpObj._id.toString();
        return {
          id: rpObj.id,
          relatedProduct: rpObj
        };
      });
    }

    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { author, rating, title, content } = req.body;
    
    const newReview = new Review({
      productId: req.params.id,
      author,
      rating: Number(rating),
      title,
      content
    });
    
    const result = await newReview.save();
    res.status(201).json({ ...result.toObject(), id: result._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};
