const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Replace with your Cloudinary Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY,      // Replace with your API Key
  api_secret: process.env.CLOUDINARY_API_SECRET // Replace with your API Secret
});

module.exports = cloudinary;
