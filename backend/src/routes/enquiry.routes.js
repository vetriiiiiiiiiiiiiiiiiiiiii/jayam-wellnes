const express = require('express');
const enquiryController = require('../controllers/enquiryController');

const router = express.Router();

router.post('/', enquiryController.createEnquiry);

module.exports = router;
