const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Profile endpoint with token authentication
exports.getProfile = (req, res) => {
    // Extract token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find the user by their ID and populate the artist data for tickets
        User.findById(userId)
            .populate('tickets.artistId') // Populate artist data
            .select('username email tickets balance') // Select specific fields
            .then(user => {
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found.' });
                }

                // Return user data as JSON
                res.status(200).json({
                    success: true,
                    user: {
                        username: user.username,
                        email: user.email,
                        tickets: user.tickets,
                        balance: user.balance,
                    },
                });
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                res.status(500).json({ success: false, message: 'Server error.' });
            });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

exports.depositMoney = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { amount } = req.body;
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid deposit amount.' });
        }

        // Find the user by their ID and update the balance
        User.findByIdAndUpdate(
            userId,
            { $inc: { balance: depositAmount } }, // Increment the user's balance
            { new: true } // Return the updated user document
        )
            .then(user => {
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found.' });
                }

                // Return the updated balance
                res.status(200).json({
                    success: true,
                    message: 'Balance updated successfully.',
                    balance: user.balance,
                });
            })
            .catch(error => {
                console.error('Error updating balance:', error);
                res.status(500).json({ success: false, message: 'Server error.' });
            });
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};
