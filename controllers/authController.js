// controllers/authController.js
const User = require('../models/UserModel');

// Render login page
exports.loginPage = (req, res) => {
  res.render('login', { activePage: 'login', title: 'login' });
};

// Handle login request
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.render('login', { error: 'Invalid username or password' });

    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      req.session.userId = user._id;
      req.session.user = user;
      return res.redirect('/profile');
    }
    return res.render('login', { error: 'Invalid username or password' });
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
};

// Handle logout request
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
};

// Render signup page
exports.signupPage = (req, res) => {
  res.render('signup', { activePage: 'signup', title: 'signup' });
};

// Handle signup request
exports.signup = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.render('signup', { error: 'Username already taken' });

    const newUser = new User({ username, password, email });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('signup', { error: 'Error during signup, please try again' });
  }
};
