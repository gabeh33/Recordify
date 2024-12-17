require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');           // Database connection
const allRoutes = require('./routes/allRoutes');   // Authentication routes
const my_session = require('./config/session');
const authenticateToken = require('./middleware/authenticateToken');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Session setup
app.use(session(my_session));

// Database connection
connectDB();

app.use('/', allRoutes);

// Ping route for health check
app.get('/ping', (req, res) => res.status(200).json({'Online': 'True'}));

app.get('/pping', authenticateToken, (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the protected route!', user: req.user });
});

// Start server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
