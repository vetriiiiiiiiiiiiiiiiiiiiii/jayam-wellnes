const Order = require('../models/orderModel');
const jwt = require('jsonwebtoken');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(o => {
      const obj = o.toObject();
      obj.id = obj._id.toString();
      return obj;
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders.map(o => {
      const obj = o.toObject();
      obj.id = obj._id.toString();
      return obj;
    }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { email, name, address, items, total } = req.body;
    let userId = null;
    
    // Check if user is authenticated (optional for checkout)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch(e) {}
    }

    const orderNumber = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    const newOrder = new Order({
      orderNumber,
      userId,
      email,
      name,
      address,
      items,
      total: Number(total),
      status: 'PENDING'
    });

    const result = await newOrder.save();
    res.status(201).json({ ...result.toObject(), id: result._id.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
