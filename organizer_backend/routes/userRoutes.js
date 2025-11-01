const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/login", userController.loginUser);
router.get("/profile/:id", userController.getUserProfile);
router.get("/:userId/friends", userController.getFriends);
router.get("/:userId/requests", userController.getFriendRequests);
router.post("/:currentUserId/send-request/:friendId", userController.sendFriendRequest);
router.post("/:userId/accept-request/:friendId", userController.acceptFriendRequest);
router.get("/:userId/suggestions", userController.getFriendSuggestions);
router.get("/:userId/sent", userController.getSentRequests);
router.delete("/:userId/cancel-request/:friendId", userController.cancelFriendRequest);

module.exports = router;
