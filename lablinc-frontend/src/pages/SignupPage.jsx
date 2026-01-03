import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth.api';
import MainLayout from '../components/layout/MainLayout';
import './LoginPage.css';

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'msme',
    phone: '',
    organization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailOTP, setEmailOTP] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setOtpError('');
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setOtpError('Please enter your email address first');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await authAPI.sendRegistrationOTP(formData.email);
      setIsOTPSent(true);
      setOtpError('');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await authAPI.verifyRegistrationOTP(formData.email, emailOTP);
      setIsOTPVerified(true);
      setOtpError('');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if email is verified
    if (!isOTPVerified) {
      setError('Please verify your email address with OTP before registering');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);

      if (result.success) {
        // Redirect to dashboard after successful registration
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Join LabLinc</h1>
            <p>Create your account to access research equipment</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <div className="email-input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="email-input"
                    disabled={isOTPVerified}
                  />
                  <div className="email-actions">
                    {!isOTPVerified && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading || !formData.email}
                        className="btn btn-secondary otp-btn"
                      >
                        {otpLoading ? 'Sending...' : isOTPSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    )}
                    {isOTPVerified && (
                      <span className="verification-status">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                
                {isOTPSent && !isOTPVerified && (
                  <div className="otp-verification-container">
                    <div className="otp-input-container">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={emailOTP}
                        onChange={(e) => {
                          setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setOtpError('');
                        }}
                        maxLength={6}
                        className="otp-input"
                      />
                      <div className="otp-actions">
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={otpLoading || emailOTP.length !== 6}
                          className="btn btn-primary otp-btn"
                        >
                          {otpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>
                    {otpError && <div className="otp-error">{otpError}</div>}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">I am a *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="msme">MSME (Looking to use equipment)</option>
                <option value="institute">Research Institute (Providing equipment)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Your company/institute name"
                  autoComplete="organization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading || !isOTPVerified}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
              {!isOTPVerified && (
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px', textAlign: 'center' }}>
                  Please verify your email with OTP to continue
                </p>
              )}
            </div>

            <div className="form-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

          <div className="auth-benefits">
            <h3>What you'll get:</h3>
            <ul>
              <li>🔬 Access to premium research equipment</li>
              <li>🏢 Direct connection with institutes</li>
              <li>💰 Transparent pricing and billing</li>
              <li>📅 Easy booking and scheduling</li>
              <li>🔒 Secure and verified platform</li>
              <li>📞 24/7 technical support</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignupPage;