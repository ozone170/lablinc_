import React from 'react';
import './ErrorState.css';

const ErrorState = ({
  variant = 'general',
  title,
  message,
  error,
  onRetry,
  onReport,
  showDetails = false,
  className = '',
  children
}) => {
  const containerClass = `error-state error-${variant} ${className}`;

  // Get appropriate icon based on variant
  const getIcon = () => {
    switch (variant) {
      case 'network':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.26 21L12 18.26L14.74 21L12 23.74L9.26 21Z"/>
            <path d="M12 2L14.74 4.74L12 7.48L9.26 4.74L12 2Z"/>
            <path d="M21 12L18.26 9.26L15.52 12L18.26 14.74L21 12Z"/>
            <path d="M7.48 12L4.74 9.26L2 12L4.74 14.74L7.48 12Z"/>
            <path d="M12 7.48L14.74 10.22L12 12.96L9.26 10.22L12 7.48Z"/>
          </svg>
        );
      case 'not-found':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21L16.65 16.65"/>
            <path d="M11 8V16"/>
            <path d="M8 11H14"/>
          </svg>
        );
      case 'permission':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7A5 5 0 0 1 17 7V11"/>
          </svg>
        );
      case 'server':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
            <path d="M6 10H18"/>
            <circle cx="6" cy="7" r="1"/>
            <circle cx="10" cy="7" r="1"/>
          </svg>
        );
      case 'validation':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.55 21H20.45A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
    }
  };

  // Get default title and message based on variant
  const getDefaultContent = () => {
    switch (variant) {
      case 'network':
        return {
          title: title || 'Connection Error',
          message: message || 'Unable to connect to the server. Please check your internet connection and try again.'
        };
      case 'not-found':
        return {
          title: title || 'Not Found',
          message: message || 'The requested resource could not be found.'
        };
      case 'permission':
        return {
          title: title || 'Access Denied',
          message: message || 'You do not have permission to access this resource.'
        };
      case 'server':
        return {
          title: title || 'Server Error',
          message: message || 'An internal server error occurred. Please try again later.'
        };
      case 'validation':
        return {
          title: title || 'Validation Error',
          message: message || 'Please check your input and try again.'
        };
      default:
        return {
          title: title || 'Something went wrong',
          message: message || 'An unexpected error occurred. Please try again.'
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={containerClass}>
      <div className="error-content">
        <div className="error-icon">
          {getIcon()}
        </div>

        <div className="error-text">
          <h3 className="error-title">{content.title}</h3>
          <p className="error-message">{content.message}</p>
        </div>

        {/* Error Details */}
        {showDetails && error && (
          <details className="error-details">
            <summary>Error Details</summary>
            <div className="error-details-content">
              <pre>{error.message || error.toString()}</pre>
              {error.stack && (
                <details className="error-stack">
                  <summary>Stack Trace</summary>
                  <pre>{error.stack}</pre>
                </details>
              )}
            </div>
          </details>
        )}

        {/* Custom Content */}
        {children}

        {/* Actions */}
        {(onRetry || onReport) && (
          <div className="error-actions">
            {onRetry && (
              <button className="btn btn-primary" onClick={onRetry}>
                Try Again
              </button>
            )}
            {onReport && (
              <button className="btn btn-secondary" onClick={onReport}>
                Report Issue
              </button>
            )}
          </div>
        )}

        {/* Troubleshooting Tips */}
        <div className="error-tips">
          {variant === 'network' && (
            <ul>
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Disable any VPN or proxy</li>
              <li>Contact support if the issue persists</li>
            </ul>
          )}
          {variant === 'not-found' && (
            <ul>
              <li>Check the URL for typos</li>
              <li>Go back to the previous page</li>
              <li>Use the navigation menu</li>
              <li>Contact support if you believe this is an error</li>
            </ul>
          )}
          {variant === 'permission' && (
            <ul>
              <li>Make sure you are logged in</li>
              <li>Contact your administrator for access</li>
              <li>Try logging out and back in</li>
            </ul>
          )}
          {variant === 'server' && (
            <ul>
              <li>Try refreshing the page</li>
              <li>Wait a few minutes and try again</li>
              <li>Contact support if the issue persists</li>
            </ul>
          )}
          {variant === 'validation' && (
            <ul>
              <li>Check all required fields are filled</li>
              <li>Verify the format of your input</li>
              <li>Try clearing and re-entering the data</li>
            </ul>
          )}
          {variant === 'general' && (
            <ul>
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
              <li>Try again in a few minutes</li>
              <li>Contact support if the issue persists</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Compound components for specific error types
ErrorState.Network = ({ ...props }) => (
  <ErrorState variant="network" {...props} />
);

ErrorState.NotFound = ({ ...props }) => (
  <ErrorState variant="not-found" {...props} />
);

ErrorState.Permission = ({ ...props }) => (
  <ErrorState variant="permission" {...props} />
);

ErrorState.Server = ({ ...props }) => (
  <ErrorState variant="server" {...props} />
);

ErrorState.Validation = ({ ...props }) => (
  <ErrorState variant="validation" {...props} />
);

export default ErrorState;