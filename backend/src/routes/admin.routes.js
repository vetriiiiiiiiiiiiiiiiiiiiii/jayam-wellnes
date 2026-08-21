const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const upload = multer({ dest: 'uploads/temp/' });

const router = express.Router();

router.use(protect({ admin: true }));



router.get('/dashboard', adminController.getDashboardStats);

// Order Management
router.get('/orders/all', adminController.getAllOrders);
router.put('/orders/:id', adminController.updateOrderStatus);
router.put('/order/:id', adminController.updateOrderStatus);
router.post('/orders/:id/refund', adminController.refundOrder);

// Product Management
router.get('/products', adminController.getAllProducts);
router.post('/products', upload.array('images', 5), adminController.createProduct);
router.put('/products/:id', upload.array('images', 5), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// User Management
router.get('/users/all', adminController.getAllUsers);
router.get('/users/inspect/:id', adminController.getUserDetails);
router.put('/users/role/:id', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Review Management
const adminReviewController = require('../controllers/adminReviewController');
router.get('/reviews', adminReviewController.getAllReviews);
router.put('/reviews/:id', adminReviewController.updateReview);
router.delete('/reviews/:id', adminReviewController.deleteReview);

module.exports = router;
