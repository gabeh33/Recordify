// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, depositMoney, upload } = require('../controllers/userController');


// Profile and deposit routes
router.get('/', getProfile);
router.post('/deposit', depositMoney);
router.post('/upload', upload);

module.exports = router;
