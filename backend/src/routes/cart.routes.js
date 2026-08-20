const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.use(protect()); // All cart routes require authentication

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
