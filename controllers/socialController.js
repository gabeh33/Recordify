// File where people can see other users, artists they might like, fyp type vibe
const User = require('../models/UserModel')

exports.socialPage = async (req, res) => {
    try {
        // Fetch all users except the current user (if you have req.session.userId)
        const users = await User.find({ _id: { $ne: req.session.userId } });

        // Add a field `isFriend` to each user based on your logic (e.g., if they’re already friends with the current user)
        const updatedUsers = users.map(user => ({
            ...user.toObject(), // Convert Mongoose document to plain object
            isFriend: user.friends && user.friends.includes(req.session.userId) // Replace this with actual logic
        }));

        // Render the EJS file, passing the `users` array
        res.render('social', { users: updatedUsers, title: 'Social Page', activePage: 'social' });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
};