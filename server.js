require('dotenv').config();
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');           // Database connection
const authRoutes = require('./routes/authRoutes');   // Authentication routes
const artistRoutes = require('./routes/artistRoutes'); // Artist routes
const userRoutes = require('./routes/userRoutes');   // User routes
const socialRoutes = require('./routes/socialRoutes');   // User routes
const my_session = require('./config/session');
const authenticateToken = require('./middleware/authenticateToken');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));                  // Serve static files

// Session setup
app.use(session(my_session));

// View engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Database connection
connectDB();

// Routes
app.use('/auth', authRoutes);      // All auth-related routes
app.use('/artists', artistRoutes); // All artist-related routes
app.use('/profile', userRoutes);      // All user-related routes

// Basic routes
app.get('/', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.render('home', { activePage: 'home', title: 'home' }));

// Ping route for health check
app.get('/ping', (req, res) => res.send("Pong"));


app.use('/social', socialRoutes);

// Catchall for logging in
app.get('/login', (req, res) => res.redirect('/auth/login'));
// Catchall for logging in
app.post('/logout', (req, res) => res.redirect('/auth/logout'));

app.get('/pping', authenticateToken, (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the protected route!', user: req.user });
});


// Start server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
