import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { logout } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Enter OTP and new password
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Calculate password strength
  useEffect(() => {
    if (!formData.newPassword) {
      setPasswordStrength({ score: 0, label: '' });
      setPasswordRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
      return;
    }

    const password = formData.newPassword;
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordRequirements(requirements);

    // Calculate strength score
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let strength = { score: 0, label: '' };

    if (metRequirements <= 2) {
      strength = { score: 1, label: 'weak' };
    } else if (metRequirements <= 3) {
      strength = { score: 2, label: 'medium' };
    } else {
      strength = { score: 3, label: 'strong' };
    }

    setPasswordStrength(strength);
  }, [formData.newPassword]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const requestOTP = async () => {
    try {
      setIsLoading(true);
      setError('');
      await authAPI.requestPasswordChangeOTP();
      
      setOtpSent(true);
      setStep(2);
      setCountdown(600); // 10 minutes countdown
      setResendDisabled(true);
      
      showToast('OTP sent to your email address', 'success');
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendDisabled) return;
    
    try {
      setIsLoading(true);
      setError('');
      await authAPI.requestPasswordChangeOTP();
      
      setCountdown(600); // Reset countdown
      setResendDisabled(true);
      
      showToast('New OTP sent to your email address', 'success');
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
      showToast(error.response?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      await requestOTP();
      return;
    }

    // Step 2: Change password with OTP
    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.changePasswordWithOTP(formData.otp, formData.newPassword);
      
      showToast('Password changed successfully! Please log in again.', 'success');
      
      // Logout user and redirect to login
      await logout();
      navigate('/login');
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <MainLayout>
      <div className="change-password-page">
        <div className="change-password-container">
          <div className="change-password-header">
            <h2 className="change-password-title">Change Password</h2>
            <p className="change-password-subtitle">
              {step === 1 
                ? 'We\'ll send a verification code to your email'
                : 'Enter the code and create your new password'
              }
            </p>
          </div>

          <div className="change-password-card">
            
            {step === 1 && (
              <div className="change-password-step1">
                <div className="change-password-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="change-password-step1-title">Secure Password Change</h3>
                <p className="change-password-step1-description">
                  For your security, we'll send a verification code to your registered email address.
                </p>
                
                {error && (
                  <div className="form-error">
                    <p className="form-error-message">{error}</p>
                  </div>
                )}
                
                <button
                  onClick={requestOTP}
                  disabled={isLoading}
                  className="btn btn-primary btn-block"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            )}

            {step === 2 && (
              <form className="change-password-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="form-error">
                    <p className="form-error-message">{error}</p>
                  </div>
                )}
                
                {/* OTP Input */}
                <div className="form-group">
                  <label htmlFor="otp" className="input-label">
                    Verification Code
                  </label>
                  <div className="otp-input-wrapper">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength="6"
                      required
                      value={formData.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, otp: value });
                        setError('');
                      }}
                      className="input otp-input"
                      placeholder="000000"
                    />
                  </div>
                  <div className="otp-timer-row">
                    {countdown > 0 ? (
                      <span className="otp-timer">
                        Expires in {formatTime(countdown)}
                      </span>
                    ) : (
                      <span className="otp-timer expired">
                        Code expired
                      </span>
                    )}
                    
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={resendDisabled || isLoading}
                      className="otp-resend-btn"
                    >
                      {resendDisabled ? `Resend (${formatTime(countdown)})` : 'Resend Code'}
                    </button>
                  </div>
                </div>

                {/* New Password Input */}
                <div className="form-group">
                  <label htmlFor="newPassword" className="input-label">
                    New Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter new password"
                    />
                    {formData.newPassword && passwordStrength.score > 0 && (
                      <span className={`input-validation-icon ${passwordStrength.score >= 2 ? 'valid' : 'invalid'}`}>
                        {passwordStrength.score >= 2 ? '✓' : '!'}
                      </span>
                    )}
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="password-strength-indicator">
                      <div className="password-strength-bar">
                        <div className={`password-strength-fill ${passwordStrength.label}`}></div>
                      </div>
                      <div className={`password-strength-text ${passwordStrength.label}`}>
                        <span>Password strength: {passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Password Requirements */}
                  <div className="password-requirements">
                    <p className="password-requirements-title">Password must contain:</p>
                    <ul className="password-requirements-list">
                      <li className={`password-requirement ${passwordRequirements.minLength ? 'met' : ''}`}>
                        At least 8 characters
                      </li>
                      <li className={`password-requirement ${passwordRequirements.hasUpperCase ? 'met' : ''}`}>
                        One uppercase letter
                      </li>
                      <li className={`password-requirement ${passwordRequirements.hasLowerCase ? 'met' : ''}`}>
                        One lowercase letter
                      </li>
                      <li className={`password-requirement ${passwordRequirements.hasNumber ? 'met' : ''}`}>
                        One number
                      </li>
                      <li className={`password-requirement ${passwordRequirements.hasSpecialChar ? 'met' : ''}`}>
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="input-label">
                    Confirm New Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input"
                      placeholder="Confirm new password"
                    />
                    {formData.confirmPassword && (
                      <span className={`input-validation-icon ${formData.newPassword === formData.confirmPassword ? 'valid' : 'invalid'}`}>
                        {formData.newPassword === formData.confirmPassword ? '✓' : '✕'}
                      </span>
                    )}
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="validation-message error">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="change-password-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setFormData({ otp: '', newPassword: '', confirmPassword: '' });
                      setError('');
                    }}
                    className="btn btn-secondary"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading || passwordStrength.score < 2 || formData.newPassword !== formData.confirmPassword}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChangePasswordPage;