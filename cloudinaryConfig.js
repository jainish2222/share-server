const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage with multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'project_showcase', // Folder name in Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});

// Set up multer for file uploads
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
