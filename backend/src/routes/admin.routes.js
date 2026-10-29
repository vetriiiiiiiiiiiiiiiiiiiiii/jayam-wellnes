const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Uploads land in a temp folder, then are resized to WebP by services/mediaService
const upload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype)),
});

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
router.post('/products', upload.array('images', 10), adminController.createProduct);
router.put('/products/:id', upload.array('images', 10), adminController.updateProduct);
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

// Customer Enquiries (contact form)
const enquiryController = require('../controllers/enquiryController');
router.get('/enquiries', enquiryController.getAllEnquiries);
router.put('/enquiries/:id', enquiryController.updateEnquiryStatus);

// Editable storefront text
const contentController = require('../controllers/contentController');
router.put('/content/:key', contentController.updateContent);
router.post('/uploads', upload.single('image'), adminController.uploadContentImage);

module.exports = router;
