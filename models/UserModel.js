// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    tickets: [
        {
          artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
          quantity: { type: Number, default: 1 },
          purchasedAt: { type: Date, default: Date.now }
        }
      ],
    balance: {type: Number, default: 0}
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });

  // Method to compare the entered password with the hashed password
userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

const User = mongoose.model('User', userSchema);

module.exports = User;