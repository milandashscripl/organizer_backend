const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Friend Suggestions
exports.getFriendSuggestions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .populate("friends", "_id")
      .populate("friendRequests", "_id")
      .populate("sentRequests", "_id");

    // Collect IDs to exclude
    const excludeIds = [
      user._id.toString(),
      ...user.friends.map((f) => f._id.toString()),
      ...user.friendRequests.map((r) => r._id.toString()),
    ];

    // Find users who are not in excludeIds
    const suggestions = await User.find({
      _id: { $nin: excludeIds },
    }).select("name email profilePicture");

    res.json(suggestions);
  } catch (err) {
    console.error("❌ Error fetching friend suggestions:", err);
    res.status(500).json({ message: err.message });
  }
};

// FRIEND SYSTEM
exports.sendFriendRequest = async (req, res) => {
  try {
    const { currentUserId, friendId } = req.params;
    if (currentUserId === friendId)
      return res.status(400).json({ message: "Can't add yourself" });

    const user = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!user || !friend)
      return res.status(404).json({ message: "User not found" });

    if (friend.friendRequests.includes(currentUserId))
      return res.status(400).json({ message: "Already sent" });

    friend.friendRequests.push(currentUserId);
    user.sentRequests.push(friendId); // ✅ add this
    await user.save();
    await friend.save();

    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend)
      return res.status(404).json({ message: "User not found" });

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== friendId
    );
    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "friends",
      "name email profilePicture"
    );
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "friendRequests",
      "name email profilePicture"
    );
    res.json(user.friendRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Sent Friend Requests
exports.getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("friendRequests", "_id")
      .populate("friends", "_id")
      .populate("sentRequests", "name email profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.sentRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Cancel Friend Request
exports.cancelFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.params;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend)
      return res.status(404).json({ message: "User not found" });

    // Remove friendId from user's sentRequests
    user.sentRequests = user.sentRequests.filter(
      (id) => id.toString() !== friendId
    );

    // Remove userId from friend's incoming requests
    friend.friendRequests = friend.friendRequests.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await friend.save();

    res.json({ message: "Friend request cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
