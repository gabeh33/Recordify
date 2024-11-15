const express = require('express');
const router = express.Router();
const { socialPage } = require('../controllers/socialController');

// Profile and deposit routes
router.get('/', socialPage);

module.exports = router;
