// Setting up a session for user authentication

// config/session.js
module.exports = {
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true for HTTPS
  };
  
