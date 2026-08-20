const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const { mediaQueue } = require('../services/queue');

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

// ==========================================
// ORDER REFUNDS
// ==========================================
exports.refundOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }
    
    // Process Razorpay refund if applicable
    if (order.paymentMethod === 'RAZORPAY' && order.razorpayOrderId) {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         return res.status(500).json({ message: 'Razorpay keys missing on server' });
      }
      
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      
      // Need the payment ID to issue a refund. Usually stored in order or fetched from Razorpay
      // We will attempt to fetch payments for this order
      const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
      const capturedPayment = payments.items.find(p => p.status === 'captured');
      
      if (capturedPayment) {
        // Issue refund
        await razorpay.payments.refund(capturedPayment.id, {
          amount: capturedPayment.amount
        });
        console.log(`[Admin] Refund issued for payment: ${capturedPayment.id}`);
      } else {
        console.log(`[Admin] No captured payment found for Razorpay order: ${order.razorpayOrderId}. Proceeding to cancel anyway.`);
      }
    }
    
    order.status = 'CANCELLED';
    await order.save();
    
    res.json({ success: true, message: 'Order cancelled and refunded successfully' });
  } catch (error) {
    console.error('[Admin] Refund Error:', error);
    res.status(500).json({ message: 'Failed to process cancellation and refund' });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users.map(u => ({ ...u.toObject(), id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = role;
    await user.save();
    res.json({ success: true, message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// ==========================================
// PRODUCT MANAGEMENT
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(p => ({ ...p.toObject(), id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, isPublished, stockQuantity } = req.body;
    const slug = name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

    const newProduct = new Product({
      name,
      slug,
      description,
      price: Number(price),
      isPublished: isPublished === 'true' || isPublished === true,
      stockQuantity: Number(stockQuantity || 0),
      images: imageUrl ? [{ url: imageUrl, position: 0 }] : []
    });

    const result = await newProduct.save();

    // Add media queue jobs for each uploaded file
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await mediaQueue.add('process-image', {
          fileId: result._id,
          filePath: file.path,
          mimeType: file.mimetype,
          outputDir: 'uploads/products',
          modelName: 'Product',
          fieldName: 'images',
          operation: 'push'
        });
      }
    }

    res.status(201).json({ ...result.toObject(), id: result._id.toString() });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
    }
    if (updateData.isPublished !== undefined) {
      updateData.isPublished = updateData.isPublished === 'true' || updateData.isPublished === true;
    }
    
    // Handle image update simplistically for now
    if (updateData.imageUrl) {
       updateData.images = [{ url: updateData.imageUrl, position: 0 }];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Add media queue jobs for each uploaded file
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await mediaQueue.add('process-image', {
          fileId: product._id,
          filePath: file.path,
          mimeType: file.mimetype,
          outputDir: 'uploads/products',
          modelName: 'Product',
          fieldName: 'images',
          operation: 'push'
        });
      }
    }

    res.json({ success: true, product: { ...product.toObject(), id: product._id.toString() } });
  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
