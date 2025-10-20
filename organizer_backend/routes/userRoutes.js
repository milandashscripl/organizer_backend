const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const userController = require('../controllers/userController');

const router = express.Router();

// ✅ Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ Routes
router.post('/register', upload.single('profilePicture'), userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile/:id', userController.getUserProfile);
router.get('/me', userController.getCurrentUser);
router.get('/all', userController.getAllUsers);
router.put('/updateProfile/:id', upload.single('profilePicture'), userController.updateUser);

// ✅ Friend System
router.post('/:currentUserId/send-request/:friendId', userController.sendFriendRequest);
router.post('/:userId/accept-request/:friendId', userController.acceptFriendRequest);
router.post('/:userId/reject-request/:friendId', userController.rejectFriendRequest);
router.get('/:userId/friends', userController.getFriends);
router.get('/:userId/requests', userController.getFriendRequests);

module.exports = router;
