// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { profilePage, depositMoney } = require('../controllers/userController');

// Profile and deposit routes
router.get('/profile', profilePage);
router.post('/profile/deposit', depositMoney);

module.exports = router;
