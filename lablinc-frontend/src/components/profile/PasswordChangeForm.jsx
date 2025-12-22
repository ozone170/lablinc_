import { useState } from 'react';
import { authAPI } from '../../api/auth.api';

const PasswordChangeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      alert('Password changed successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to change password:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      if (message.includes('current password')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-change-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password *</label>
        <div className="password-input-wrapper">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={errors.currentPassword ? 'error' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="password-toggle"
          >
            {showPasswords.current ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.currentPassword && (
          <span className="error-message">{errors.currentPassword}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password *</label>
        <div className="password-input-wrapper">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={errors.newPassword ? 'error' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="password-toggle"
          >
            {showPasswords.new ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.newPassword && (
          <span className="error-message">{errors.newPassword}</span>
        )}
        <small className="form-hint">Minimum 6 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm New Password *</label>
        <div className="password-input-wrapper">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="password-toggle"
          >
            {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;
