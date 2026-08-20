const Product = require('../models/productModel');
const Order = require('../models/orderModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, recentOrders, allOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.find().select('total')
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders: recentOrders.map(o => {
        const obj = o.toObject();
        obj.id = obj._id.toString();
        return obj;
      })
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
