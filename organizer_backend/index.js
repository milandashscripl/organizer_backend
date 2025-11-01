const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const otpRoutes = require("./routes/otpRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors({
    origin: ["http://127.0.0.1:8080", "http://localhost:8080", "oraganizer.netlify.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(express.json());

app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
// const passport = require("./config/passport");
// app.use(passport.initialize());
// app.use("/auth", require("./routes/authRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log("✅ Server running & DB connected")
    )
  )
  .catch((err) => console.error("❌ DB Connection Error:", err));
