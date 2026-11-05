const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const rateLimit = require('../middleware/rateLimit');

const discountLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, message: 'Too many tries. Please wait a few minutes and try again.' });

const checkoutLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, message: 'Too many checkout attempts. Please wait a few minutes and try again.' });

const router = express.Router();

router.get('/my-orders', protect(), orderController.getMyOrders);
router.post('/', checkoutLimit, orderController.createOrder);
router.post('/confirm-payment', orderController.confirmPayment);
router.post('/discount', discountLimit, orderController.previewDiscount);
router.post('/track', orderController.trackOrder);
router.get('/:orderNumber/receipt', orderController.getReceipt);
router.get('/:id', protect(), orderController.getOrderById);
router.put('/:id/cancel', protect(), orderController.cancelOrder);

module.exports = router;
