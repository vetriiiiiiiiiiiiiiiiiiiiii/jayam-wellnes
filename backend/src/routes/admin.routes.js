const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(protect({ admin: true }));



router.get('/dashboard', adminController.getDashboardStats);

// Order Management
router.get('/orders/all', adminController.getAllOrders);
router.put('/orders/:id', adminController.updateOrderStatus);
// Alias route for older API signature
router.put('/order/:id', adminController.updateOrderStatus);

module.exports = router;
