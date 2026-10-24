const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/:key', contentController.getContent);

module.exports = router;
