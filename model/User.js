const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // equivalent to UNI in MySQL
    lowercase: true,
    trim: true,
    default:"abc@gmail.com"
  },
  password: {
    type: String,
    required: true,
  },
  totalexpenses: {
    type: mongoose.Types.Decimal128, // or use Number if Decimal128 is not needed
    default: 0.00,
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpires: {
    type: Date,
    default: null,
  },
  premiumUser: {
    type: Boolean,
    default: false, // tinyint(1) used as boolean in MySQL
  }
}, {
  timestamps: true // created_at and updated_at auto-managed by Mongoose
});

module.exports = mongoose.model('User', userSchema);
