import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ 
  variant = 'text', 
  width = '100%', 
  height = 'auto',
  lines = 1,
  className = '',
  animate = true,
  ...props 
}) => {
  const baseClass = `skeleton-loader ${animate ? 'animate' : ''} ${className}`;

  // Text skeleton (default)
  if (variant === 'text') {
    if (lines === 1) {
      return (
        <div 
          className={`${baseClass} skeleton-text`}
          style={{ width, height: height === 'auto' ? '1em' : height }}
          {...props}
        />
      );
    }

    return (
      <div className={`${baseClass} skeleton-text-block`} {...props}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="skeleton-text"
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              height: height === 'auto' ? '1em' : height
            }}
          />
        ))}
      </div>
    );
  }

  // Rectangle skeleton
  if (variant === 'rect' || variant === 'rectangle') {
    return (
      <div 
        className={`${baseClass} skeleton-rect`}
        style={{ width, height: height === 'auto' ? '200px' : height }}
        {...props}
      />
    );
  }

  // Circle skeleton
  if (variant === 'circle') {
    const size = width === '100%' ? '40px' : width;
    return (
      <div 
        className={`${baseClass} skeleton-circle`}
        style={{ width: size, height: size }}
        {...props}
      />
    );
  }

  // Avatar skeleton
  if (variant === 'avatar') {
    const size = width === '100%' ? '40px' : width;
    return (
      <div 
        className={`${baseClass} skeleton-avatar`}
        style={{ width: size, height: size }}
        {...props}
      />
    );
  }

  // Button skeleton
  if (variant === 'button') {
    return (
      <div 
        className={`${baseClass} skeleton-button`}
        style={{ 
          width: width === '100%' ? '120px' : width, 
          height: height === 'auto' ? '40px' : height 
        }}
        {...props}
      />
    );
  }

  // Card skeleton
  if (variant === 'card') {
    return (
      <div className={`${baseClass} skeleton-card`} style={{ width }} {...props}>
        <div className="skeleton-card-header">
          <div className="skeleton-avatar" />
          <div className="skeleton-card-title">
            <div className="skeleton-text" style={{ width: '60%' }} />
            <div className="skeleton-text" style={{ width: '40%' }} />
          </div>
        </div>
        <div className="skeleton-card-content">
          <div className="skeleton-rect" style={{ height: '120px', marginBottom: '12px' }} />
          <div className="skeleton-text" />
          <div className="skeleton-text" />
          <div className="skeleton-text" style={{ width: '75%' }} />
        </div>
        <div className="skeleton-card-actions">
          <div className="skeleton-button" />
          <div className="skeleton-button" />
        </div>
      </div>
    );
  }

  // Table row skeleton
  if (variant === 'table-row') {
    const columns = typeof width === 'number' ? width : 4;
    return (
      <div className={`${baseClass} skeleton-table-row`} {...props}>
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="skeleton-table-cell">
            <div className="skeleton-text" />
          </div>
        ))}
      </div>
    );
  }

  // List item skeleton
  if (variant === 'list-item') {
    return (
      <div className={`${baseClass} skeleton-list-item`} style={{ width }} {...props}>
        <div className="skeleton-avatar" />
        <div className="skeleton-list-content">
          <div className="skeleton-text" style={{ width: '70%' }} />
          <div className="skeleton-text" style={{ width: '50%' }} />
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div 
      className={`${baseClass} skeleton-rect`}
      style={{ width, height: height === 'auto' ? '20px' : height }}
      {...props}
    />
  );
};

// Compound components for common patterns
SkeletonLoader.Text = ({ lines = 1, ...props }) => (
  <SkeletonLoader variant="text" lines={lines} {...props} />
);

SkeletonLoader.Avatar = ({ size = '40px', ...props }) => (
  <SkeletonLoader variant="avatar" width={size} {...props} />
);

SkeletonLoader.Button = ({ ...props }) => (
  <SkeletonLoader variant="button" {...props} />
);

SkeletonLoader.Card = ({ ...props }) => (
  <SkeletonLoader variant="card" {...props} />
);

SkeletonLoader.ListItem = ({ ...props }) => (
  <SkeletonLoader variant="list-item" {...props} />
);

SkeletonLoader.TableRow = ({ columns = 4, ...props }) => (
  <SkeletonLoader variant="table-row" width={columns} {...props} />
);

export default SkeletonLoader;