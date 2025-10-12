const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: String,
  contact: String,
  profilePicture: String,
  friends: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [], // ✅ This ensures it's always an array
  },
});

module.exports = mongoose.model("User", userSchema);
