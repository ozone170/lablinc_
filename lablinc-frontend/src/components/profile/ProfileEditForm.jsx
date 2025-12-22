import { useState } from 'react';
import { authAPI } from '../../api/auth.api';

const ProfileEditForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await authAPI.updateProfile(formData);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      
      // Handle specific error cases
      if (message.includes('email')) {
        setErrors({ email: 'This email is already in use' });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      organization: user?.organization || '',
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      {errors.general && (
        <div className="form-error-general">
          <span className="error-icon">⚠️</span>
          {errors.general}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Enter your full name"
            autoComplete="name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            placeholder="your@email.com"
            autoComplete="email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            placeholder="9876543210"
            autoComplete="tel"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
          <small className="form-hint">10-digit mobile number</small>
        </div>

        <div className="form-group">
          <label htmlFor="organization">Organization</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Your company or institute"
            autoComplete="organization"
          />
          <small className="form-hint">Optional: Your workplace or institution</small>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={handleCancel}
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
          {loading ? (
            <>
              <span className="loading-spinner-small"></span>
              Saving...
            </>
          ) : (
            <>
              <span className="save-icon">💾</span>
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
