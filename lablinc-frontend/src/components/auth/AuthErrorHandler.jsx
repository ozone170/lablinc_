import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const AuthErrorHandler = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Handle authentication state changes
    const handleAuthError = (event) => {
      const { type, message, redirectTo } = event.detail;

      switch (type) {
        case 'TOKEN_EXPIRED':
          showToast('Your session has expired. Please log in again.', 'warning');
          navigate('/login');
          break;
        
        case 'UNAUTHORIZED':
          showToast('You are not authorized to access this resource.', 'error');
          navigate('/dashboard');
          break;
        
        case 'EMAIL_NOT_VERIFIED':
          showToast('Please verify your email address to continue.', 'warning');
          // Don't redirect, let user stay on current page
          break;
        
        case 'ACCOUNT_SUSPENDED':
          showToast('Your account has been suspended. Please contact support.', 'error');
          navigate('/');
          break;
        
        case 'NETWORK_ERROR':
          showToast('Network error. Please check your connection and try again.', 'error');
          break;
        
        case 'SERVER_ERROR':
          showToast('Server error. Please try again later.', 'error');
          break;
        
        default:
          if (message) {
            showToast(message, 'error');
          }
          if (redirectTo) {
            navigate(redirectTo);
          }
      }
    };

    // Listen for custom auth error events
    window.addEventListener('authError', handleAuthError);

    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, [navigate, showToast]);

  // Check for email verification status
  useEffect(() => {
    if (isAuthenticated && user && !user.emailVerified) {
      // Show persistent notification for unverified email
      const timer = setTimeout(() => {
        showToast(
          'Your email is not verified. Some features may be limited.',
          'warning',
          { duration: 8000 }
        );
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, showToast]);

  return children;
};

// Utility function to dispatch auth errors
export const dispatchAuthError = (type, message = '', redirectTo = '') => {
  const event = new CustomEvent('authError', {
    detail: { type, message, redirectTo }
  });
  window.dispatchEvent(event);
};

// Standard auth error messages
export const AUTH_ERRORS = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED'
};

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  if (!error.response) {
    dispatchAuthError(AUTH_ERRORS.NETWORK_ERROR, 'Unable to connect to server');
    return;
  }

  const { status, data } = error.response;
  const message = data?.message || 'An error occurred';

  switch (status) {
    case 401:
      if (message.includes('token') || message.includes('expired')) {
        dispatchAuthError(AUTH_ERRORS.TOKEN_EXPIRED);
      } else if (message.includes('verify') || message.includes('verification')) {
        dispatchAuthError(AUTH_ERRORS.EMAIL_NOT_VERIFIED, message);
      } else {
        dispatchAuthError(AUTH_ERRORS.INVALID_CREDENTIALS, message);
      }
      break;
    
    case 403:
      if (message.includes('suspended') || message.includes('banned')) {
        dispatchAuthError(AUTH_ERRORS.ACCOUNT_SUSPENDED, message);
      } else if (message.includes('verify') || message.includes('verification')) {
        dispatchAuthError(AUTH_ERRORS.EMAIL_NOT_VERIFIED, message);
      } else {
        dispatchAuthError(AUTH_ERRORS.UNAUTHORIZED, message);
      }
      break;
    
    case 429:
      dispatchAuthError('RATE_LIMITED', 'Too many requests. Please try again later.');
      break;
    
    case 500:
    case 502:
    case 503:
    case 504:
      dispatchAuthError(AUTH_ERRORS.SERVER_ERROR, 'Server error. Please try again later.');
      break;
    
    default:
      dispatchAuthError('GENERIC_ERROR', message);
  }
};

export default AuthErrorHandler;