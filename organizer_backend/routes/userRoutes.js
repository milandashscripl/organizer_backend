const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const { registerUser, loginUser, getUserProfile, getAllUsers, updateUser, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = require('../controllers/userController');

const router = express.Router();

// Configure Cloudinary storage with multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Routes
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.get('/profile/:id', getUserProfile);
router.get('/all', getAllUsers);
router.put('/updateProfile/:id', upload.single('profilePicture'), updateUser); // ✅ Fixed line
router.post('/sendRequest/:id', sendFriendRequest);
router.post('/acceptRequest/:id', acceptFriendRequest);
router.post('/rejectRequest/:id', rejectFriendRequest);



module.exports = router;
