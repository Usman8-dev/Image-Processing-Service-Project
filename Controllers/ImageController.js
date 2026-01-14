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

    // Apply rotate
    if (rotate) {
      image = image.rotate(parseInt(rotate));
    }

    // Apply flip
    if (flip) {
      if (flip === 'horizontal') {
        image = image.flop();
      } else if (flip === 'vertical') {
        image = image.flip();
      } else if (flip === 'both') {
        image = image.flip().flop();
      }
    }

    // Apply watermark if requested
    if (watermark === 'text' && wm_text) {
      const svg = `
        <svg width="200" height="50">
          <style>
            .title { fill: rgba(255,255,255,0.8); font-size: 20px; font-family: Arial; }
          </style>
          <text x="10" y="30" class="title">${wm_text}</text>
        </svg>
      `;
      const watermarkBuffer = Buffer.from(svg);
      const watermarkImage = sharp(watermarkBuffer);

      let gravity = 'southeast'; // default bottom-right
      if (wm_position === 'top-left') gravity = 'northwest';
      else if (wm_position === 'top-right') gravity = 'northeast';
      else if (wm_position === 'bottom-left') gravity = 'southwest';
      else if (wm_position === 'center') gravity = 'center';

      image = image.composite([{ input: await watermarkImage.toBuffer(), gravity }]);
    }

    // Determine output format and quality
    let outputOptions = {};
    if (format) {
      if (format === 'jpeg' || format === 'jpg') {
        outputOptions = { quality: quality ? parseInt(quality) : 80 };
        image = image.jpeg(outputOptions);
      } else if (format === 'png') {
        outputOptions = { quality: quality ? parseInt(quality) : 80 };
        image = image.png(outputOptions);
      } else if (format === 'webp') {
        outputOptions = { quality: quality ? parseInt(quality) : 80 };
        image = image.webp(outputOptions);
      }
    } else {
      // Default to jpeg if no format specified
      image = image.jpeg({ quality: quality ? parseInt(quality) : 80 });
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
