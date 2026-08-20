const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/miracletree');
  const Product = require('./backend/src/models/productModel');
  const products = await Product.find({});
  let count = 0;
  for (const p of products) {
    let changed = false;
    for (const img of p.images) {
      if (img.url && img.url.startsWith('/icuman/')) {
        img.url = img.url.replace('/icuman/', '/');
        changed = true;
      }
    }
    if (changed) {
      await p.save();
      count++;
    }
  }
  console.log('Fixed', count, 'products');
  process.exit(0);
}
fix();
