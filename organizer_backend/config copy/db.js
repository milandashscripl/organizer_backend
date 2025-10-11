const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use MONGO_URI from the environment variables
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the application if the connection fails
  }
};

module.exports = connectDB;
