const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  content: { type: String },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

module.exports = Review;
