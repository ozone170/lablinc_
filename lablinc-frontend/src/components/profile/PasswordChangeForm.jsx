import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api/auth.api';

const PasswordChangeForm = ({ onSuccess }) => {
  const [showOTPOption, setShowOTPOption] = useState(false);

  if (showOTPOption) {
    return (
      <div className="password-change-options">
        <div className="option-card">
          <div className="option-icon">🔐</div>
          <h4>Secure Password Change</h4>
          <p>For your security, we use OTP verification for password changes.</p>
          <Link 
            to="/change-password" 
            className="btn btn-primary"
          >
            Change Password with OTP
          </Link>
        </div>
        <button 
          onClick={() => setShowOTPOption(false)}
          className="btn btn-secondary btn-small"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="password-change-info">
      <div className="info-card">
        <div className="info-icon">🔒</div>
        <h4>Password Security</h4>
        <p>
          To ensure maximum security, password changes require email verification with a one-time password (OTP).
        </p>
        <div className="security-features">
          <div className="feature">
            <span className="feature-icon">📧</span>
            <span>Email verification required</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⏱️</span>
            <span>OTP expires in 10 minutes</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🛡️</span>
            <span>Maximum 3 attempts per OTP</span>
          </div>
        </div>
        <button 
          onClick={() => setShowOTPOption(true)}
          className="btn btn-primary"
        >
          <span className="btn-icon">🔐</span>
          Change Password
        </button>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
