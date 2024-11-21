// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, depositMoney, upload, getProfilePicture } = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Profile and deposit routes
router.get('/', getProfile);
router.post('/deposit', depositMoney);
router.post('/upload', authenticateToken, upload);
router.get('/picture', authenticateToken, getProfilePicture);

module.exports = router;
