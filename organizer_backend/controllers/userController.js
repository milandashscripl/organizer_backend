
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



// ✅ Add Friend
exports.addFriend = async (req, res) => {
  try {
    const { userId } = req.body;
    const friendId = req.params.id;

    if (userId === friendId) {
      return res.status(400).json({ message: "You can't add yourself as a friend" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    // ✅ Ensure both arrays exist
    user.friends = user.friends || [];
    friend.friends = friend.friends || [];

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend added successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


