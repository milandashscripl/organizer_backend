const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getCurrentUser,
  getFriends,
  getFriendRequests,
} = require('../controllers/userController');

const router = express.Router();

// ✅ Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ Routes
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.get('/profile/:id', getUserProfile);
router.get('/me', protect, getCurrentUser);
router.get('/all', getAllUsers);
router.put('/updateProfile/:id', upload.single('profilePicture'), updateUser);

// ✅ Friend System (URLs fixed to match Flutter)
router.post('/:currentUserId/send-request/:friendId', sendFriendRequest);
router.post('/:userId/accept-request/:friendId', acceptFriendRequest);
router.post('/:userId/reject-request/:friendId', rejectFriendRequest);
router.get('/:userId/friends', getFriends);
router.get('/:userId/requests', getFriendRequests);

module.exports = router;
