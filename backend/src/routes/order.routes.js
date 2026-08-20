const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', protect({ admin: true }), orderController.getAllOrders);
router.get('/my', protect(), orderController.getMyOrders);
router.post('/', orderController.createOrder);

module.exports = router;
