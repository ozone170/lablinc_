import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

const ImageUploader = ({ 
  onUpload, 
  onDelete, 
  existingImages = [], 
  maxImages = 5,
  maxSizeMB = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  multiple = true 
}) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState(existingImages);

  const validateFile = (file) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`File ${file.name} exceeds ${maxSizeMB}MB limit`, 'error');
      return false;
    }

    const acceptedTypes = accept.split(',');
    if (!acceptedTypes.includes(file.type)) {
      showToast(`File ${file.name} is not an accepted image type`, 'error');
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (previews.length + files.length > maxImages) {
      showToast(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Create preview URLs
      const newPreviews = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        isNew: true
      }));

      setPreviews(prev => [...prev, ...newPreviews]);

      // Call upload handler
      if (onUpload) {
        await onUpload(validFiles);
      }

      showToast(`${validFiles.length} image(s) uploaded successfully`, 'success');
    } catch (error) {
      showToast(error.message || 'Failed to upload images', 'error');
      // Remove failed uploads from previews
      setPreviews(prev => prev.filter(p => !p.isNew));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (index, imageUrl) => {
    try {
      if (onDelete) {
        await onDelete(imageUrl);
      }

      setPreviews(prev => {
        const newPreviews = [...prev];
        // Revoke object URL if it's a local preview
        if (newPreviews[index].isNew) {
          URL.revokeObjectURL(newPreviews[index].url);
        }
        newPreviews.splice(index, 1);
        return newPreviews;
      });

      showToast('Image deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete image', 'error');
    }
  };

  return (
    <div className="image-uploader">
      <div className="image-grid">
        {previews.map((preview, index) => (
          <div key={index} className="image-preview">
            <img 
              src={preview.url || preview} 
              alt={`Preview ${index + 1}`}
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(index, preview.url || preview)}
              disabled={uploading}
            >
              ✕
            </button>
          </div>
        ))}

        {previews.length < maxImages && (
          <label className="upload-box">
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              {uploading ? (
                <div className="spinner">Uploading...</div>
              ) : (
                <>
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">
                    {previews.length === 0 ? 'Add Images' : 'Add More'}
                  </span>
                  <span className="upload-hint">
                    {previews.length}/{maxImages}
                  </span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      <div className="upload-info">
        <small>
          Max {maxImages} images, up to {maxSizeMB}MB each. Accepted: JPG, PNG, WebP
        </small>
      </div>
    </div>
  );
};

export default ImageUploader;
