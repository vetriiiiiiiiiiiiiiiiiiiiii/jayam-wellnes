const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getAllProducts);
router.post('/', protect({ admin: true }), productController.createProduct);
router.get('/:slug', productController.getProductBySlug);
router.post('/:id/reviews', productController.createReview);

module.exports = router;
