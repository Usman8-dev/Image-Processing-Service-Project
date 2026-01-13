const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    let image = sharp(imagePath);

    // Get query parameters
    const { resize, crop, rotate, flip, format, quality, watermark, wm_text, wm_position } = req.query;

    // Apply resize
    if (resize) {
      const [width, height] = resize.split('x').map(Number);
      image = image.resize(width, height);
    }

    // Apply crop
    if (crop) {
      const parts = crop.split('+');
      const dimensions = parts[0].split('x').map(Number);
      const position = parts.slice(1).map(Number);
      image = image.extract({
        left: position[0] || 0,
        top: position[1] || 0,
        width: dimensions[0],
        height: dimensions[1]
      });
    }

    // Get the processed image buffer
    const buffer = await image.toBuffer();

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    // Set appropriate headers
    const mimeType = format ? `image/${format === 'jpg' ? 'jpeg' : format}` : 'image/jpeg';
    res.set('Content-Type', mimeType);
    res.set('Content-Disposition', 'attachment; filename="processed-image.' + (format || 'jpg') + '"');

    // Send the processed image
    res.send(buffer);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

module.exports = {
  processImage
};
