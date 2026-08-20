const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(protect({ admin: true }));



router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
