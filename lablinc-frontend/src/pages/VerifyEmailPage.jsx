import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus('loading');
      const response = await authAPI.verifyEmail(token);
      
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      
      showToast('Email verified successfully! You can now log in.', 'success');
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
      console.error('Email verification error:', error);
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    
    if (!email) return;
    
    try {
      setIsResending(true);
      await authAPI.resendVerificationEmail(email);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resend verification email', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="verify-email-header">
          <h1 className="verify-email-logo">LabLinc</h1>
          <h2 className="verify-email-title">Email Verification</h2>
          <p className="verify-email-subtitle">Verifying your LabLinc account</p>
        </div>

        <div className="verify-email-card">
          {status === 'loading' && (
            <div className="verification-state loading-state">
              <div className="verification-icon">
                <div className="loading-spinner large"></div>
              </div>
              <h3>Verifying your email...</h3>
              <p>Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verification-state success-state">
              <div className="verification-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3>Email Verified!</h3>
              <p>{message}</p>
              <div className="redirect-info">
                <p>✨ Redirecting to login in 5 seconds...</p>
              </div>
              <div className="verification-actions">
                <Link to="/login" className="btn btn-primary btn-block">
                  Go to Login Now
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="verification-state error-state">
              <div className="verification-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3>Verification Failed</h3>
              <p>{message}</p>
              
              <div className="verification-actions">
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="btn btn-primary btn-block"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
                
                <Link to="/login" className="btn btn-secondary btn-block">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="verify-email-benefits">
          <h3>Why verify your email?</h3>
          <ul>
            <li>🔒 Secure your account</li>
            <li>📧 Get notifications</li>
            <li>🔬 Access all features</li>
            <li>💬 Receive support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;