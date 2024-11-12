require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');           // Database connection
const authRoutes = require('./routes/authRoutes');   // Authentication routes
const artistRoutes = require('./routes/artistRoutes'); // Artist routes
const userRoutes = require('./routes/userRoutes');   // User routes

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));                  // Serve static files

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// View engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Database connection
connectDB();

// Routes
app.use('/auth', authRoutes);      // All auth-related routes
app.use('/artists', artistRoutes); // All artist-related routes
app.use('/user', userRoutes);      // All user-related routes

// Basic routes
app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.render('home', { activePage: 'home', title: 'home' }));

// Ping route for health check
app.get('/ping', (req, res) => res.send("Pong"));

// Start server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
