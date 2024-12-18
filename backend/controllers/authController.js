// controllers/authController.js
const User = require('../models/UserModel');
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

// Handle login request (POST)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Create a JWT token
    const token = jwt.sign(
      {
          id: user._id, // Include user ID in the payload
          username: user.username,
      },
      JWT_SECRET, // Use your secret key
      { expiresIn: '12h' } // Token expires in 12 hours
  );

    // Respond with the token and user details
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
          id: user._id,
          username: user.username,
          email: user.email,
      },
  });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Handle logout request
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({'Successful Logout': 'False'});
    }
    res.status(200).json({"Successful Logout": "True"})
  });
};


// Handle signup request
exports.signup = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingUser) { 
      return res.status(401).json({
        success: false,
        message: 'Username taken',
    })} else if (existingEmail) {
      return res.status(401).json({
        success: false,
        message: 'Email taken',
    })};

    const newUser = new User({ username, password, email });
    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "Successfully registered"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
