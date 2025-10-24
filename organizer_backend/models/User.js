const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  address: String,
  contact: String,
  profilePicture: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  emailVerified: { type: Boolean, default: false },
  verificationToken: String, // token for email verification
});

module.exports = mongoose.model("User", userSchema);
