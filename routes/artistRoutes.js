// routes/artistRoutes.js
const express = require('express');
const router = express.Router();
const { artistsPage, buyTicket } = require('../controllers/artistsController');

// Artist routes
router.get('/artists', artistsPage);
router.post('/artists/buy', buyTicket);

module.exports = router;
