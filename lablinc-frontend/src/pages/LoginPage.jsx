import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import MainLayout from '../components/layout/MainLayout';
import './LoginPage.css';

const LoginPage = () => {
  const { login, clearAuthCookies } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [emailOTP, setEmailOTP] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [isUnverifiedUser, setIsUnverifiedUser] = useState(false);
  const [showRefreshTokenError, setShowRefreshTokenError] = useState(false);

  // Get the intended destination from location state, default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowResendVerification(false);
    setIsUnverifiedUser(false);
    setShowRefreshTokenError(false);

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirect to intended destination or dashboard
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
        
        // Check if error is about email verification
        if (result.message && (result.message.includes('verify your email') || result.message.includes('Email verification required'))) {
          setShowResendVerification(true);
          setIsUnverifiedUser(true);
        }
      }
    } catch (err) {
      // Handle specific error codes from backend
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setError(err.response.data.message);
        setShowResendVerification(true);
        setIsUnverifiedUser(true);
      } else if (err.message && (err.message.includes('refresh token') || err.message.includes('token'))) {
        setError('Session expired. Please clear your session and try again.');
        setShowRefreshTokenError(true);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = () => {
    clearAuthCookies();
    localStorage.clear();
    setError('');
    setShowRefreshTokenError(false);
    showToast('Session cleared successfully. Please try logging in again.', 'success');
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      showToast('Please enter your email address first', 'error');
      return;
    }

    try {
      setResendingVerification(true);
      await authAPI.resendVerificationEmail(formData.email);
      showToast('Verification email sent! Please check your inbox.', 'success');
      setShowResendVerification(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resend verification email', 'error');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSendOTPForVerification = async () => {
    if (!formData.email) {
      showToast('Please enter your email address first', 'error');
      return;
    }

    try {
      setOtpLoading(true);
      await authAPI.sendEmailOTP(formData.email);
      setShowOTPVerification(true);
      showToast('OTP sent to your email address', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    try {
      setOtpLoading(true);
      await authAPI.verifyEmailOTP(formData.email, emailOTP);
      showToast('Email verified successfully! You can now log in.', 'success');
      
      // Reset verification states
      setShowResendVerification(false);
      setShowOTPVerification(false);
      setIsUnverifiedUser(false);
      setEmailOTP('');
      
      // Automatically attempt login again
      handleSubmit({ preventDefault: () => {} });
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your LabLinc account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="form-error">
                {error}
                {showResendVerification && (
                  <div className="verification-options" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>
                      Choose how to verify your email:
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingVerification}
                        className="btn btn-secondary btn-small"
                      >
                        {resendingVerification ? 'Sending...' : 'Resend Email Link'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOTPForVerification}
                        disabled={otpLoading}
                        className="btn btn-primary btn-small"
                      >
                        {otpLoading ? 'Sending...' : 'Send OTP Code'}
                      </button>
                    </div>
                  </div>
                )}
                {showRefreshTokenError && (
                  <div className="session-error-options" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#856404' }}>
                      <strong>Session Issue Detected:</strong> This usually happens when there are conflicting login sessions.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearSession}
                      className="btn btn-warning btn-small"
                    >
                      🔄 Clear Session & Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            {showOTPVerification && (
              <div className="otp-verification-section" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0369a1' }}>Enter Verification Code</h4>
                <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#0284c7' }}>
                  We've sent a 6-digit code to {formData.email}
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={emailOTP}
                      onChange={(e) => {
                        setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6));
                      }}
                      maxLength={6}
                      style={{ 
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        textAlign: 'center',
                        letterSpacing: '2px',
                        fontSize: '16px'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={otpLoading || emailOTP.length !== 6}
                    className="btn btn-primary"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPVerification(false);
                    setEmailOTP('');
                  }}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '14px',
                    marginTop: '10px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel OTP verification
                </button>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="form-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Create one here
                </Link>
              </p>
              <p>
                <Link to="/forgot-password" className="auth-link">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </form>

          <div className="auth-benefits">
            <h3>Why LabLinc?</h3>
            <ul>
              <li>🔬 Access cutting-edge research equipment</li>
              <li>🏢 Connect with leading institutes</li>
              <li>💰 Cost-effective equipment sharing</li>
              <li>📅 Real-time booking system</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;