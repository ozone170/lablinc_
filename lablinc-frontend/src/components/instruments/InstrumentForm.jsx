import { useState, useEffect } from 'react';
import { instrumentsAPI } from '../../api/instruments.api';
import ImageUploader from '../common/ImageUploader';
import SpecificationEditor from './SpecificationEditor';
import PricingForm from './PricingForm';

const InstrumentForm = ({ instrumentId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    specifications: {},
    pricing: {
      hourlyRate: '',
      dailyRate: '',
    },
    status: 'available',
  });
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (instrumentId) {
      fetchInstrument();
    }
  }, [instrumentId]);

  const fetchCategories = async () => {
    try {
      const response = await instrumentsAPI.getCategories();
      setCategories(response.data || response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchInstrument = async () => {
    try {
      const response = await instrumentsAPI.getById(instrumentId);
      const instrument = response.data || response;
      setFormData({
        name: instrument.name || '',
        description: instrument.description || '',
        category: instrument.category?._id || instrument.category || '',
        location: instrument.location || {
          address: '',
          city: '',
          state: '',
          pincode: '',
        },
        specifications: instrument.specifications || {},
        pricing: instrument.pricing || {
          hourlyRate: '',
          dailyRate: '',
        },
        status: instrument.status || 'available',
      });
      setPhotos(instrument.photos || []);
    } catch (error) {
      console.error('Failed to fetch instrument:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecificationsChange = (specs) => {
    setFormData(prev => ({ ...prev, specifications: specs }));
  };

  const handlePricingChange = (pricing) => {
    setFormData(prev => ({ ...prev, pricing }));
  };

  const handlePhotosChange = (newPhotos) => {
    setPhotos(newPhotos);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.pricing.hourlyRate && !formData.pricing.dailyRate) {
      newErrors.pricing = 'At least one pricing option is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        photos,
      };

      if (instrumentId) {
        await instrumentsAPI.update(instrumentId, submitData);
      } else {
        await instrumentsAPI.create(submitData);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to save instrument:', error);
      alert(error.response?.data?.message || 'Failed to save instrument');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="instrument-form">
      <div className="form-section">
        <h3>Basic Information</h3>
        
        <div className="form-group">
          <label htmlFor="name">Instrument Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Location</h3>
        
        <div className="form-group">
          <label htmlFor="location.address">Address</label>
          <input
            type="text"
            id="location.address"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location.city">City</label>
            <input
              type="text"
              id="location.city"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location.state">State</label>
            <input
              type="text"
              id="location.state"
              name="location.state"
              value={formData.location.state}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location.pincode">Pincode</label>
            <input
              type="text"
              id="location.pincode"
              name="location.pincode"
              value={formData.location.pincode}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Photos</h3>
        <ImageUploader
          images={photos}
          onChange={handlePhotosChange}
          maxImages={5}
          instrumentId={instrumentId}
        />
      </div>

      <div className="form-section">
        <h3>Specifications</h3>
        <SpecificationEditor
          specifications={formData.specifications}
          onChange={handleSpecificationsChange}
        />
      </div>

      <div className="form-section">
        <h3>Pricing *</h3>
        <PricingForm
          pricing={formData.pricing}
          onChange={handlePricingChange}
        />
        {errors.pricing && <span className="error-message">{errors.pricing}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : instrumentId ? 'Update Instrument' : 'Create Instrument'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default InstrumentForm;
