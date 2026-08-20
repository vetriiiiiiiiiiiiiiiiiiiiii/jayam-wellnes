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

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders.map(o => {
        const obj = o.toObject();
        obj.id = obj._id.toString();
        return obj;
      })
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    await order.save();
    
    const orderObj = order.toObject();
    orderObj.id = order._id.toString();
    
    res.json({ success: true, message: 'Order updated successfully', order: orderObj });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
};
