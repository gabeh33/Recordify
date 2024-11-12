// middleware/validateUser.js
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const { username, password } = req.body;

  // Ensure both username and password are provided
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  // Check if username already exists
  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).send('Username is already taken');
  }

  next();
};
