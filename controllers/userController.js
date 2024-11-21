const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const multer = require('multer');
const authenticateToken = require('../middleware/authenticateToken');

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


// Configure Multer to handle file uploads
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('File must be an image.'));
        }
        cb(null, true);
    },
});


// Upload endpoint
exports.upload = [
    upload.single('profilePicture'), // Handle a single file upload
    async (req, res) => {
        try {
            // Retrieve the user ID (assumes authentication middleware sets req.user)
            
            const userId = req.user.id;

            // Check if a file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded.',
                });
            }

            // Find the user and update their profilePicture field
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.',
                });
            }

            user.profilePicture = req.file.buffer; // Store image as binary data
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Profile picture uploaded successfully.',
            });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.',
            });
        }
    },
];

exports.getProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authentication middleware provides req.user

        const user = await User.findById(userId);

        if (!user || !user.profilePicture) {
            return res.status(404).send('No profile picture found.');
        }

        // Set the appropriate content type for the response
        console.log("sending back profile picture");
        res.set('Content-Type', 'image/png'); // Assuming the image is a PNG
        res.send(user.profilePicture);
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).send('Server error.');
    }
};