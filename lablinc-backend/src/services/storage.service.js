// Storage Service - Cloudinary integration
const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'lablinc') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // If file is a buffer or path
    const result = await cloudinary.uploader.upload(file.path || file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Upload image error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'lablinc') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    console.error('Upload multiple images error:', error);
    throw new Error('Failed to upload images');
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Delete image error:', error);
    throw new Error('Failed to delete image');
  }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      throw new Error('No public IDs provided');
    }

    const deletePromises = publicIds.map(id => deleteImage(id));
    const results = await Promise.all(deletePromises);

    return results;
  } catch (error) {
    console.error('Delete multiple images error:', error);
    throw new Error('Failed to delete images');
  }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  try {
    if (!url) return null;

    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Extract public ID error:', error);
    return null;
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  extractPublicId
};
