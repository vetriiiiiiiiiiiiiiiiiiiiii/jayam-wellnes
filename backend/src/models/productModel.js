const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  productType: { type: String }, // e.g. BUNDLE, SINGLE
  images: [
    {
      url: String,
      position: Number,
    }
  ],
  isPublished: { type: Boolean, default: false },
  relatedToIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
