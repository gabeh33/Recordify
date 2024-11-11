// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Need to hash before saving of course
    tickets: {type: Number, required: false}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
