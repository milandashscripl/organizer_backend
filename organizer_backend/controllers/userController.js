const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, contact, address, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = req.file?.path;

    const newUser = new User({
      name,
      email,
      contact,
      address,
      password: hashedPassword,
      profilePicture,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        address: user.address,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get current logged-in user (simplified)
exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


// ✅ Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      address: req.body.address,
    };

    if (req.file?.path) updatedData.profilePicture = req.file.path;
    if (req.body.password)
      updatedData.password = await bcrypt.hash(req.body.password, 10);

    const updateData = { ...req.body };
delete updateData.email; // prevent duplicate email check

const updatedUser = await User.findByIdAndUpdate(
  userId,
  updateData,
  { new: true }
);
    res.json({ message: 'User updated successfully', updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { currentUserId, friendId } = req.params;

    if (currentUserId === friendId)
      return res.status(400).json({ message: "You can't add yourself" });

    const user = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!user || !friend)
      return res.status(404).json({ message: 'User not found' });

    if (user.friends.includes(friendId))
      return res.status(400).json({ message: 'Already friends' });

    if (friend.friendRequests.includes(currentUserId))
      return res.status(400).json({ message: 'Request already sent' });

    friend.friendRequests.push(currentUserId);
    await friend.save();

    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Accept friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.params;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend)
      return res.status(404).json({ message: 'User not found' });

    if (!user.friendRequests.includes(friendId))
      return res.status(400).json({ message: 'No pending request from this user' });

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Reject friend request
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
    await user.save();

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all friends
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('friends', 'name email profilePicture');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get friend requests
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('friendRequests', 'name email profilePicture');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.friendRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
