const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { sendOtpToEmail, verifyOtpAndRegister } = require("../controllers/otpController");

// Send OTP
router.post("/send-otp", sendOtpToEmail);

// Verify OTP + Register (with image)
router.post("/verify-otp", upload.single("profilePicture"), verifyOtpAndRegister);

module.exports = router;
