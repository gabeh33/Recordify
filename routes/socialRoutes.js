const express = require('express');
const router = express.Router();
const { socialPage, newsPage } = require('../controllers/socialController');

// Profile and deposit routes
router.get('/friends', socialPage);
router.get('/', newsPage);
module.exports = router;
