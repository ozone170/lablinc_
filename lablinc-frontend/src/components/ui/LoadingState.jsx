import React from 'react';
import './LoadingState.css';

const LoadingState = ({ 
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
  overlay = false,
  className = '',
  children
}) => {
  const containerClass = `loading-state ${fullScreen ? 'fullscreen' : ''} ${overlay ? 'overlay' : ''} ${className}`;
  const sizeClass = `loading-${size}`;

  // Spinner variant (default)
  if (variant === 'spinner') {
    return (
      <div className={containerClass}>
        <div className="loading-content">
          <div className={`loading-spinner ${sizeClass}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          {message && <p className="loading-message">{message}</p>}
          {children}
        </div>
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={containerClass}>
        <div className="loading-content">
          <div className={`loading-dots ${sizeClass}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          {message && <p className="loading-message">{message}</p>}
          {children}
        </div>
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={containerClass}>
        <div className="loading-content">
          <div className={`loading-pulse ${sizeClass}`}>
            <div className="pulse-circle"></div>
          </div>
          {message && <p className="loading-message">{message}</p>}
          {children}
        </div>
      </div>
    );
  }

  // Bar variant (progress bar)
  if (variant === 'bar') {
    return (
      <div className={containerClass}>
        <div className="loading-content">
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
          {message && <p className="loading-message">{message}</p>}
          {children}
        </div>
      </div>
    );
  }

  // Inline variant (small, inline loading indicator)
  if (variant === 'inline') {
    return (
      <span className={`loading-inline ${sizeClass} ${className}`}>
        <span className="loading-spinner-inline"></span>
        {message && <span className="loading-message-inline">{message}</span>}
      </span>
    );
  }

  // Default fallback
  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={`loading-spinner ${sizeClass}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
        {children}
      </div>
    </div>
  );
};

// Compound components for common use cases
LoadingState.Spinner = ({ ...props }) => (
  <LoadingState variant="spinner" {...props} />
);

LoadingState.Dots = ({ ...props }) => (
  <LoadingState variant="dots" {...props} />
);

LoadingState.Pulse = ({ ...props }) => (
  <LoadingState variant="pulse" {...props} />
);

LoadingState.Bar = ({ ...props }) => (
  <LoadingState variant="bar" {...props} />
);

LoadingState.Inline = ({ ...props }) => (
  <LoadingState variant="inline" {...props} />
);

LoadingState.FullScreen = ({ ...props }) => (
  <LoadingState fullScreen {...props} />
);

LoadingState.Overlay = ({ ...props }) => (
  <LoadingState overlay {...props} />
);

export default LoadingState;