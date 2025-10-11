const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  address: String,
  email: { type: String, unique: true },
  contact: String,
  password: String,
  profilePicture: String, // store Base64 string
  foodPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Combo'] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
