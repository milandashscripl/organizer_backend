const Otp = require("../models/Otp");
const User = require("../models/User");
const transporter = require("../config/nodemailer");
const bcrypt = require("bcryptjs");



// 1️⃣ SEND OTP
exports.sendOtpToEmail = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp, "for", email);

    await Otp.deleteMany({ email }); // clear old OTPs

    const savedOtp = await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });
    console.log("Saved OTP:", savedOtp);

    await transporter.sendMail({
      from: `"Organizer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Organizer Email Verification OTP",
      html: `<h2>Your OTP:</h2><h1>${otp}</h1><p>Expires in 10 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// 2️⃣ VERIFY OTP AND REGISTER USER
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { name, password, contact, address, otp } = req.body;

    const existingOtp = await Otp.findOne({ email });
    if (!existingOtp)
      return res.status(400).json({ message: "OTP not found or expired" });

    if (existingOtp.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (existingOtp.expiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePictureUrl = "";
    if (req.file && req.file.path) {
      profilePictureUrl = req.file.path; // Cloudinary provides this automatically
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contact,
      address,
      profilePicture: profilePictureUrl,
      emailVerified: true,
    });

    await newUser.save();
    await Otp.deleteOne({ email });

    res.json({
      message: "Registration successful!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

