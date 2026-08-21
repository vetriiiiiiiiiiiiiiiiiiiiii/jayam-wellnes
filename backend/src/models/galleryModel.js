const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
