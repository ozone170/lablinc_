import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  webp = true,
  placeholder = 'blur',
  quality = 80,
  sizes,
  srcSet,
  onLoad,
  onError,
  fallback,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate WebP source if supported
  const generateWebPSrc = (originalSrc) => {
    if (!webp || !originalSrc) return originalSrc;
    
    // Check if browser supports WebP
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    if (supportsWebP()) {
      // Convert common image extensions to WebP
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }

    return originalSrc;
  };

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc) => {
    if (srcSet) return srcSet;
    if (!baseSrc) return '';

    const breakpoints = [480, 768, 1024, 1200, 1600];
    const srcSetArray = breakpoints.map(bp => {
      const responsiveSrc = baseSrc.replace(/(\.[^.]+)$/, `_${bp}w$1`);
      return `${responsiveSrc} ${bp}w`;
    });

    return srcSetArray.join(', ');
  };

  // Generate placeholder based on type
  const getPlaceholder = () => {
    switch (placeholder) {
      case 'blur':
        return `data:image/svg+xml;base64,${btoa(`
          <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="blur">
                <feGaussianBlur stdDeviation="2"/>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
          </svg>
        `)}`;
      
      case 'color':
        return `data:image/svg+xml;base64,${btoa(`
          <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#e5e7eb"/>
          </svg>
        `)}`;
      
      case 'skeleton':
        return `data:image/svg+xml;base64,${btoa(`
          <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <rect x="20" y="20" width="60%" height="20" fill="#e5e7eb" rx="4"/>
            <rect x="20" y="50" width="80%" height="20" fill="#e5e7eb" rx="4"/>
            <rect x="20" y="80" width="40%" height="20" fill="#e5e7eb" rx="4"/>
          </svg>
        `)}`;
      
      default:
        return '';
    }
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  // Update current source when in view
  useEffect(() => {
    if (isInView && src) {
      const optimizedSrc = generateWebPSrc(src);
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, src, webp]);

  // Handle image load
  const handleLoad = (event) => {
    setIsLoaded(true);
    setIsError(false);
    if (onLoad) onLoad(event);
  };

  // Handle image error
  const handleError = (event) => {
    setIsError(true);
    
    // Try fallback to original format if WebP fails
    if (webp && currentSrc !== src) {
      setCurrentSrc(src);
      return;
    }
    
    if (onError) onError(event);
  };

  // Generate container classes
  const containerClasses = [
    'optimized-image-container',
    className,
    isLoaded ? 'loaded' : 'loading',
    isError ? 'error' : '',
    lazy ? 'lazy' : ''
  ].filter(Boolean).join(' ');

  // Render error state
  if (isError && !currentSrc) {
    return (
      <div 
        ref={imgRef}
        className={containerClasses}
        style={{ width, height }}
        {...props}
      >
        <div className="image-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <span>Failed to load image</span>
          {fallback && (
            <button 
              className="retry-button"
              onClick={() => {
                setIsError(false);
                setCurrentSrc(fallback);
              }}
            >
              Try fallback
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={containerClasses}
      style={{ width, height }}
      {...props}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder && (
        <img
          className="image-placeholder"
          src={getPlaceholder()}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && currentSrc && (
        <picture>
          {/* WebP source */}
          {webp && (
            <source
              srcSet={generateSrcSet(generateWebPSrc(src))}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback source */}
          <source
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            type={`image/${src?.split('.').pop()}`}
          />
          
          <img
            className="optimized-image"
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            loading={lazy ? 'lazy' : 'eager'}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </picture>
      )}

      {/* Loading indicator */}
      {!isLoaded && !isError && isInView && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

// Compound components for common use cases
OptimizedImage.Avatar = ({ size = 40, ...props }) => (
  <OptimizedImage
    {...props}
    width={size}
    height={size}
    className={`optimized-image-avatar ${props.className || ''}`}
    placeholder="color"
  />
);

OptimizedImage.Hero = ({ ...props }) => (
  <OptimizedImage
    {...props}
    className={`optimized-image-hero ${props.className || ''}`}
    lazy={false}
    placeholder="blur"
    quality={90}
  />
);

OptimizedImage.Thumbnail = ({ size = 150, ...props }) => (
  <OptimizedImage
    {...props}
    width={size}
    height={size}
    className={`optimized-image-thumbnail ${props.className || ''}`}
    placeholder="skeleton"
    quality={70}
  />
);

OptimizedImage.Card = ({ ...props }) => (
  <OptimizedImage
    {...props}
    className={`optimized-image-card ${props.className || ''}`}
    placeholder="blur"
    quality={80}
  />
);

// Preload utility
export const preloadImage = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
    }
    
    img.src = src;
  });
};

// Batch preload utility
export const preloadImages = async (sources, options = {}) => {
  const { concurrent = 3 } = options;
  const results = [];
  
  for (let i = 0; i < sources.length; i += concurrent) {
    const batch = sources.slice(i, i + concurrent);
    const batchPromises = batch.map(src => 
      preloadImage(src, options).catch(error => ({ error, src }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

export default OptimizedImage;