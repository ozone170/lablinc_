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
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccess(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const levels = [
      { score: 0, text: 'Very Weak', color: 'var(--color-error)' },
      { score: 1, text: 'Weak', color: 'var(--color-error)' },
      { score: 2, text: 'Fair', color: 'var(--color-warning)' },
      { score: 3, text: 'Good', color: 'var(--color-warning)' },
      { score: 4, text: 'Strong', color: 'var(--color-success)' },
      { score: 5, text: 'Very Strong', color: 'var(--color-success)' },
    ];

    return levels[score] || levels[0];
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
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
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
      
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Failed to change password:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      if (message.includes('current password') || message.includes('incorrect')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (success) {
    return (
      <div className="password-success">
        <div className="success-icon">✅</div>
        <h3>Password Changed Successfully!</h3>
        <p>Your password has been updated. You will be redirected shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="password-change-form">
      {errors.general && (
        <div className="form-error-general">
          <span className="error-icon">⚠️</span>
          {errors.general}
        </div>
      )}

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
            placeholder="Enter your current password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="password-toggle"
            aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
          >
            {showPasswords.current ? '🙈' : '👁️'}
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
            placeholder="Enter your new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="password-toggle"
            aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
          >
            {showPasswords.new ? '🙈' : '👁️'}
          </button>
        </div>
        {formData.newPassword && (
          <div className="password-strength">
            <div className="strength-bar">
              <div 
                className="strength-fill" 
                style={{ 
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: passwordStrength.color 
                }}
              ></div>
            </div>
            <span 
              className="strength-text" 
              style={{ color: passwordStrength.color }}
            >
              {passwordStrength.text}
            </span>
          </div>
        )}
        {errors.newPassword && (
          <span className="error-message">{errors.newPassword}</span>
        )}
        <small className="form-hint">
          Use at least 8 characters with a mix of letters, numbers, and symbols
        </small>
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
            placeholder="Re-enter your new password"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="password-toggle"
            aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
          >
            {showPasswords.confirm ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner-small"></span>
              Changing Password...
            </>
          ) : (
            <>
              <span className="lock-icon">🔒</span>
              Change Password
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;
