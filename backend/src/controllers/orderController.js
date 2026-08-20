const Order = require('../models/orderModel');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const { paymentVerificationQueue } = require('../services/queue');

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
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(o => {
        const obj = o.toObject();
        obj.id = obj._id.toString();
        return obj;
      })
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // ensure order belongs to user
    if (order.userId && order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const obj = order.toObject();
    obj.id = obj._id.toString();
    res.json({ success: true, order: obj });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId && order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }
    
    order.status = 'CANCELLED';
    await order.save();
    
    res.json({ success: true, message: 'Order cancelled successfully', status: order.status });
  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { email, name, address, items, total } = req.body;
    let userId = null;
    
    // Check if user is authenticated via cookie
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch(e) {
        console.error("JWT verification failed for createOrder", e);
      }
    }

    const orderNumber = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // Calculate exact total if not trusted from frontend (ideal logic, but using frontend total for now as requested)
    const orderTotal = Number(total);

    const newOrder = new Order({
      orderNumber,
      userId,
      email,
      name,
      address,
      items,
      total: orderTotal,
      status: 'PENDING',
      paymentMethod: req.body.paymentMethod || 'RAZORPAY',
      paymentStatus: req.body.paymentMethod === 'COD' ? 'PENDING' : 'PENDING' // COD is paid on delivery, so pending for now
    });

    const result = await newOrder.save();

    let razorpayOrder = null;
    
    if (newOrder.paymentMethod === 'RAZORPAY') {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(orderTotal * 100), // amount in paise
          currency: "INR",
          receipt: result._id.toString(),
        });

        result.razorpayOrderId = razorpayOrder.id;
        await result.save();
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
        return res.status(500).json({ error: 'Payment gateway configuration error. Please ensure valid Razorpay keys are set in the backend .env file.' });
      }
    } else if (newOrder.paymentMethod === 'COD') {
        // If COD, clear the cart here since there's no payment verification queue step
        if (userId) {
          const Cart = require('../models/cartModel');
          await Cart.findOneAndUpdate({ userId }, { items: [] });
        }
        // Also trigger the order processing queue immediately for COD
        const { orderProcessingQueue } = require('../services/queue');
        await orderProcessingQueue.add("process-order", {
          orderId: result.orderNumber,
          userId: userId
        });
    }

    const orderObj = result.toObject();
    orderObj.id = result._id.toString();

    res.status(201).json({ 
      success: true, 
      orderId: result._id.toString(),
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : null,
      amount: orderTotal,
      currency: "INR",
      order: orderObj 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;
    let userId = null;
    if (req.user) userId = req.user.id;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
       return res.status(400).json({ message: "Invalid payment details" });
    }

    await paymentVerificationQueue.add("verify-payment", {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      userId
    });

    res.json({ success: true, message: 'Payment verification in progress' });
  } catch (error) {
    console.error("Payment verify queue error:", error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};
