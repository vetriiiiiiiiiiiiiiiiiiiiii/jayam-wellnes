const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/my-orders', protect(), orderController.getMyOrders);
router.post('/', orderController.createOrder);
router.post('/confirm-payment', orderController.confirmPayment);
router.post('/track', orderController.trackOrder);
router.get('/:orderNumber/receipt', orderController.getReceipt);
router.get('/:id', protect(), orderController.getOrderById);
router.put('/:id/cancel', protect(), orderController.cancelOrder);

module.exports = router;
