
const User = require('../models/UserModel')
// Render login page
exports.profilePage = (req, res) => {
    // Check if the user is authenticated
    if (!req.session.userId) {
        return res.redirect('/auth/login'); // Redirect to login if not authenticated
    }

    // Find the user by their session ID and populate the artist data for tickets
    User.findById(req.session.userId)
        .populate('tickets.artistId')  // Populate artist data
        .select('username email tickets balance') // Select specific fields
        .then(user => {
    if (!user) {
        return res.redirect('/auth/login');
    }

    // Render the profile page with user data and additional view info
    res.render('profile', { 
        user,
        activePage: 'profile',
        title: 'Profile'
      });
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      res.status(500).send('Server Error');
    });
  };

  // Render login page
exports.depositMoney = (req, res) => {
    const { amount } = req.body;
    const depositAmount = parseFloat(amount);

    // Check if the deposit amount is invalid or less than or equal to zero
    if (isNaN(depositAmount) || depositAmount <= 0) {
        return res.status(400).send("Invalid deposit amount.");
    }

    // Find the user by their ID and update the balance atomically using .then()
    User.findByIdAndUpdate(
        req.session.userId,
    {
        $inc: { balance: depositAmount }, // Increment the user's balance
    },
        { new: true } // Ensure that the updated user document is returned
    ).then(user => {
    
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Update the session with the new user data to reflect the updated balance
    req.session.user = user;

    // Redirect the user back to their profile page
        res.redirect('/profile');
    })
    .catch(error => {
        console.error("Error updating balance:", error);

        // If an error occurs, return an error message to the user
        res.status(500).send("An error occurred while updating your balance.");
    });
  };