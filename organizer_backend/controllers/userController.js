
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, contact, address, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);


    // Get the Cloudinary URL of the uploaded file
    const profilePicture = req.file?.path;

    const newUser = new User({
      name,
      email,
      contact,
      address,
      password: hashedPassword,
      profilePicture, // Save the Cloudinary URL
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};





exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                contact: user.contact,
                address: user.address,
                profilePicture: user.profilePicture,
            },
            userId: user._id, // Include userId for backward compatibility
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ GET /api/me
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("friends", "name email profilePicture");

    res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





// ✅ Update User (Fixed)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      address: req.body.address,
    };

    // ✅ If new image uploaded, update it
    if (req.file && req.file.path) {
      updatedData.profilePicture = req.file.path;
    }

    // ✅ If new password provided, hash it
    if (req.body.password) {
      updatedData.password = await bcrypt.hash(req.body.password, 10);
    }

    // Remove undefined fields
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ message: 'User updated successfully!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users); // Return the list of users
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({ message: "You can't send a request to yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.friends.includes(targetId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    if (user.sentRequests.includes(targetId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (target.friendRequests.includes(userId)) {
      return res.status(400).json({ message: "Request already pending" });
    }

    user.sentRequests.push(targetId);
    target.friendRequests.push(userId);

    await user.save();
    await target.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const requesterId = req.params.id;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from pending lists
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    // Add to friends
    user.friends.push(requesterId);
    requester.friends.push(userId);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.rejectFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const requesterId = req.params.id;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


