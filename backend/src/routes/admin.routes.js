const express = require('express');
const { getDb } = require('../utils/db');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

// Admin check middleware
router.use((req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
});

router.get('/dashboard', async (req, res) => {
  try {
    const db = getDb();
    const [totalProducts, totalOrders, recentOrders, allOrders] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('orders').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('orders').find({}, { projection: { total: 1 } }).toArray()
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0) || 0;
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders: recentOrders.map(o => ({ ...o, id: o._id.toString() }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
