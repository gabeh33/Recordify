// routes/artistRoutes.js
const express = require('express');
const router = express.Router();
const { artistsPage, buyTicket, sellTicket } = require('../controllers/artistsController');

// Artist routes
router.get('/', artistsPage);
router.post('/buy', buyTicket);
router.post('/sell', sellTicket);

module.exports = router;
