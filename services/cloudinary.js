const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadImage = async (filePath) => {
  // 1. Try Cloudinary if keys are provided
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'smk-spare-parts',
        use_filename: true,
        unique_filename: true
      });
      return result.secure_url;
    } catch (error) {
      console.warn('⚠️ Cloudinary Upload Warning, falling back to Base64 Data URI:', error.message);
    }
  }

  // 2. Universal Netlify/Cloud Fallback: Convert file to Base64 Data URL
  // Base64 Data URLs are stored directly in MongoDB so images work 100% on Netlify, Render, Vercel, etc.
  try {
    if (filePath && fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = filePath.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      
      const base64 = fileBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }
  } catch (err) {
    console.error('Failed to convert uploaded image to Base64 Data URI:', err.message);
  }

  return '/images/placeholder.svg';
};

module.exports = { uploadImage };
