// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { profilePage, depositMoney } = require('../controllers/userController');

// Profile and deposit routes
router.get('/', profilePage);
router.post('/deposit', depositMoney);

module.exports = router;
