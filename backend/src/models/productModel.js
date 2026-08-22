const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String },
  description: { type: String },
  ingredients: { type: String },
  usageInstructions: { type: String },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  productType: { type: String }, // e.g. BUNDLE, SINGLE
  images: [
    {
      url: String,
      position: Number,
    }
  ],
  specs: [
    {
      name: String,
      value: String
    }
  ],
  variants: [
    {
      name: String,
      size: String,
      sku: String,
      price: Number,
      compareAtPrice: Number,
      stock: { type: Number, default: 0 }
    }
  ],
  isPublished: { type: Boolean, default: false },
  addToHomeScreen: { type: Boolean, default: false },
  relatedToIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
