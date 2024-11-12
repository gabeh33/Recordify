// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginPage, login, logout, signupPage, signup } = require('../controllers/authController');

// Authentication routes
router.get('/login', loginPage);
router.post('/login', login);
router.get('/logout', logout);
router.get('/signup', signupPage);
router.post('/signup', signup);

module.exports = router;
