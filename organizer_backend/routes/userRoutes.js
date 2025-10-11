const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage(); // store in memory
const upload = multer({ storage });

// Register route
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
