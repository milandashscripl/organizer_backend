// const express = require("express");
// const passport = require("passport");
// const jwt = require("jsonwebtoken");
// const router = express.Router();

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.redirect(`http://127.0.0.1:8080/profile.html?token=${token}`);
//   }
// );

// module.exports = router;
