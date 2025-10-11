const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    contact: { type: String, required: true },
    aadhar: { type: String, required: true },
    address: { type: String, required: true },
    campusName: { type: String, required: true },
    seatNumber: { type: Number, required: true, unique: true },
    studentId: { type: String, unique: true }, // Remove `required: true`, as it will be generated automatically
    profilePicture: { type: String },
    password: { type: String, required: true },
});

// Pre-save middleware to generate studentId
userSchema.pre('save', function (next) {
    if (this.campusName && this.seatNumber) {
        this.studentId = `${this.campusName}-${this.seatNumber}`;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
