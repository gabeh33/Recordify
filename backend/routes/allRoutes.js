// routes/artistRoutes.js
const express = require('express');
const router = express.Router();
const { artistsPage, buyTicket, sellTicket } = require('../controllers/artistsController');
const { login, signup } = require('../controllers/authController');
const { getProfile, depositMoney, } = require('../controllers/userController');
const { socialPage, newsPage } = require('../controllers/socialController');
const { authenticateToken } = require('../middleware/authenticateToken');

//---------------------------------------------- Artist Routes ----------------------------------------------//
router.get('/artists', artistsPage);
router.post('/artists/buy', buyTicket);
router.post('/artists/sell', sellTicket);

//---------------------------------------------- Authentication Routes ----------------------------------------------//
router.post('/login', login); // To login
router.post('/signup', signup); // To signup

//---------------------------------------------- User Routes ----------------------------------------------//
router.get('/profile', getProfile); 
router.post('/profile/deposit', depositMoney);

//---------------------------------------------- Social Routes ----------------------------------------------//
router.get('/social/friends', socialPage);
router.get('/social', newsPage);

module.exports = router;
