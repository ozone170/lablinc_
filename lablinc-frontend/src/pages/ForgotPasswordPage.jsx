import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    if (cooldown > 0) {
      showToast(`Please wait ${cooldown} seconds before trying again`, 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.forgotPassword(formData.email);
      
      setIsSubmitted(true);
      setLastSubmittedEmail(formData.email);
      
      // Start cooldown (60 seconds)
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      showToast(response.message || 'Password reset instructions sent to your email', 'success');
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send reset email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    try {
      setIsLoading(true);
      const response = await authAPI.forgotPassword(lastSubmittedEmail);
      
      // Start cooldown again
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      showToast('Reset instructions sent again', 'success');
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resend email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-header">
            <h1 className="forgot-password-logo">LabLinc</h1>
          </div>

          <div className="forgot-password-card">
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="forgot-password-success-title">Check Your Email</h3>
              
              <p className="forgot-password-success-message">
                We've sent password reset instructions to <strong>{lastSubmittedEmail}</strong>
              </p>
              
              <div className="forgot-password-info-box">
                <h4 className="forgot-password-info-title">Next Steps:</h4>
                <ul className="forgot-password-info-list">
                  <li>Check your email inbox</li>
                  <li>Look in spam/junk if needed</li>
                  <li>Link expires in 1 hour</li>
                </ul>
              </div>
              
              <div className="forgot-password-actions">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || isLoading}
                  className="btn btn-secondary btn-block"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    'Resend Instructions'
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ email: '' });
                    setCooldown(0);
                  }}
                  className="btn btn-ghost btn-block"
                >
                  Try Different Email
                </button>
                
                <Link to="/login" className="btn btn-primary btn-block">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1 className="forgot-password-logo">LabLinc</h1>
          <h2 className="forgot-password-title">Forgot Password?</h2>
          <p className="forgot-password-subtitle">
            Enter your email address and we'll send you secure instructions to reset your password.
          </p>
        </div>

        <div className="forgot-password-card">
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="btn btn-primary btn-block"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s`
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="forgot-password-back-link">
              <Link to="/login">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;