const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/my-orders', protect(), orderController.getMyOrders);
router.post('/', orderController.createOrder);
router.post('/verify', orderController.verifyPayment);
router.get('/:id', protect(), orderController.getOrderById);
router.put('/:id/cancel', protect(), orderController.cancelOrder);

module.exports = router;
