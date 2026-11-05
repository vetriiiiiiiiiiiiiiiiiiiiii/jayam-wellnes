const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const rateLimit = require('../middleware/rateLimit');

const reviewLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'You’ve posted several reviews already. Please try again later.' });

const router = express.Router();

router.get('/', productController.getAllProducts);
router.post('/', protect({ admin: true }), productController.createProduct);
router.get('/reviews/latest', productController.getLatestReviews);
router.get('/:slug', productController.getProductBySlug);
router.post('/:id/reviews', reviewLimit, productController.createReview);

module.exports = router;
