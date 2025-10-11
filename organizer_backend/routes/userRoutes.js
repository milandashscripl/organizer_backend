const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Correct usage: pass **both multer middleware and controller**
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
