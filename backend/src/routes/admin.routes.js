const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Uploads land in a temp folder, then are resized to WebP by services/mediaService
const upload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 20 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype)),
});

// Run multer, turning its failures into messages the admin panel can show
const accept = (middleware) => (req, res, next) => middleware(req, res, (error) => {
  if (!error) return next();
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Images must be 20 MB or smaller' });
  if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ message: 'Please upload up to 20 photos at a time' });
  console.error('Upload failed:', error);
  res.status(500).json({ message: `The server could not save the photo (${error.code || 'unknown error'})` });
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
router.post('/products/add-defaults', adminController.addDefaultProducts);
router.post('/products', accept(upload.array('images', 20)), adminController.createProduct);
router.put('/products/:id', accept(upload.array('images', 20)), adminController.updateProduct);
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
router.post('/uploads', accept(upload.single('image')), adminController.uploadContentImage);

// Photo library (Admin → Assets)
const assetsController = require('../controllers/assetsController');
router.get('/assets', assetsController.listAssets);
router.post('/assets/crop', assetsController.cropAsset);
router.delete('/assets', assetsController.deleteAsset);

// Discount codes and the setup check
const storeSettingsController = require('../controllers/storeSettingsController');
router.get('/discounts', storeSettingsController.listDiscounts);
router.post('/discounts', storeSettingsController.saveDiscount);
router.put('/discounts/:id', storeSettingsController.saveDiscount);
router.delete('/discounts/:id', storeSettingsController.deleteDiscount);
router.get('/setup', storeSettingsController.getSetup);
router.post('/setup/test-email', storeSettingsController.sendTestEmail);

module.exports = router;
