import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin.api';
import '../../styles/admin.css';

const CreateInstrumentForm = ({ onInstrumentCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    pricing: {
      hourly: '',
      daily: '',
      weekly: '',
      monthly: ''
    },
    specifications: '',
    status: 'available',
    featured: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([
        'CNC Machines',
        '3D Printers',
        'Electronics',
        'Mechanical',
        'Material Testing',
        'GPU Workstations',
        'AI Servers',
        'Civil',
        'Environmental',
        'Prototyping'
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('pricing.')) {
      const pricingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [pricingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Instrument name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.pricing.hourly && !formData.pricing.daily) {
      newErrors.pricing = 'At least hourly or daily pricing is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const processedData = {
        ...formData,
        pricing: {
          hourly: formData.pricing.hourly ? parseFloat(formData.pricing.hourly) : null,
          daily: formData.pricing.daily ? parseFloat(formData.pricing.daily) : null,
          weekly: formData.pricing.weekly ? parseFloat(formData.pricing.weekly) : null,
          monthly: formData.pricing.monthly ? parseFloat(formData.pricing.monthly) : null
        }
      };
      
      await adminAPI.createInstrument(processedData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        location: '',
        pricing: {
          hourly: '',
          daily: '',
          weekly: '',
          monthly: ''
        },
        specifications: '',
        status: 'available',
        featured: false
      });
      setErrors({});
      
      if (onInstrumentCreated) {
        onInstrumentCreated();
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to create instrument:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create instrument'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-form-container">
      <div className="inline-form-header">
        <h3>🔬 Add New Instrument</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="inline-form">
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Instrument Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter instrument name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
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
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            placeholder="Enter detailed description"
            rows="3"
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
              placeholder="Enter location"
            />
            {errors.location && <span className="field-error">{errors.location}</span>}
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
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div className="pricing-section">
          <h4>Pricing (₹) *</h4>
          {errors.pricing && <span className="field-error">{errors.pricing}</span>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pricing.hourly">Hourly Rate</label>
              <input
                type="number"
                id="pricing.hourly"
                name="pricing.hourly"
                value={formData.pricing.hourly}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricing.daily">Daily Rate</label>
              <input
                type="number"
                id="pricing.daily"
                name="pricing.daily"
                value={formData.pricing.daily}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="specifications">Specifications</label>
            <textarea
              id="specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              placeholder="Enter technical specifications"
              rows="2"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span>Featured Instrument</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Creating...' : '✅ Add Instrument'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInstrumentForm;