
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, contact, aadhar, address, password, campusName, seatNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate studentId dynamically
    const studentId = `${campusName}-${seatNumber}`;

    // Get the Cloudinary URL of the uploaded file
    const profilePicture = req.file?.path;

    const newUser = new User({
      name,
      email,
      contact,
      aadhar,
      address,
      password: hashedPassword,
      campusName,
      seatNumber,
      studentId, // Auto-generated
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
                aadhar: user.aadhar,
                address: user.address,
                campusName: user.campusName,
                seatNumber: user.seatNumber,
                studentId: user.studentId,
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
      aadhar: user.aadhar,
      address: user.address,
      campusName: user.campusName,
      seatNumber: user.seatNumber,
      studentId: user.studentId,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Update User
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch the existing user data
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Collect updated data from the request body
    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      aadhar: req.body.aadhar,
      address: req.body.address,
    };

    // If a new profile picture is uploaded, update it
    if (req.file) {
      updatedData.profilePicture = req.file.path; // Cloudinary or file path
    }

    // If campusName or seatNumber is updated, regenerate studentId
    const newCampusName = req.body.campusName || existingUser.campusName;
    const newSeatNumber = req.body.seatNumber || existingUser.seatNumber;

    updatedData.campusName = newCampusName;
    updatedData.seatNumber = newSeatNumber;
    updatedData.studentId = `${newCampusName}-${newSeatNumber}`;

    // Hash password if provided
    if (req.body.password) {
      updatedData.password = await bcrypt.hash(req.body.password, 10);
    }

    // Remove undefined fields
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    // Update the user in the database
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

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ position: 'teacher' }); // Fetch only teachers
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ position: 'student' }); // Fetch only teachers
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

