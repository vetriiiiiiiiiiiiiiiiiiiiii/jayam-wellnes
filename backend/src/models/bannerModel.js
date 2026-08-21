const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
