const express = require('express');
const router = express.Router();
const { uploadImage, processImage } = require('../Controllers/ImageController');
const upload = require('../Middlewares/uploadMiddleware');

// Route for uploading and processing image
router.post('/process', upload.single('image'), processImage);

module.exports = router;
