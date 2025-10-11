const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    profilePicture: { type: String },
    password: { type: String, required: true },
});


module.exports = mongoose.model('User', userSchema);
