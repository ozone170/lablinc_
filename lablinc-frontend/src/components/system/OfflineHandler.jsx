import React, { useState, useEffect } from 'react';
import './OfflineHandler.css';

const OfflineHandler = ({ 
  showBanner = true, 
  showToast = false,
  onOnline = null,
  onOffline = null,
  children 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Show reconnected message if was previously offline
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
        setWasOffline(false);
      }

      if (onOnline) {
        onOnline();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);

      if (onOffline) {
        onOffline();
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, onOnline, onOffline]);

  // Periodic connectivity check
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        const actuallyOnline = response.ok;
        
        // Update state if there's a discrepancy
        if (actuallyOnline !== isOnline) {
          setIsOnline(actuallyOnline);
          
          if (actuallyOnline && wasOffline) {
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
            setWasOffline(false);
            
            if (onOnline) {
              onOnline();
            }
          } else if (!actuallyOnline) {
            setWasOffline(true);
            
            if (onOffline) {
              onOffline();
            }
          }
        }
      } catch (error) {
        // If fetch fails, we're likely offline
        if (isOnline) {
          setIsOnline(false);
          setWasOffline(true);
          
          if (onOffline) {
            onOffline();
          }
        }
      }
    };

    // Check connectivity every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);
    
    return () => clearInterval(interval);
  }, [isOnline, wasOffline, onOnline, onOffline]);

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && showBanner && (
        <div className="offline-banner">
          <div className="offline-banner-content">
            <div className="offline-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.26 21L12 18.26L14.74 21L12 23.74L9.26 21Z"/>
                <path d="M12 2L14.74 4.74L12 7.48L9.26 4.74L12 2Z"/>
                <path d="M21 12L18.26 9.26L15.52 12L18.26 14.74L21 12Z"/>
                <path d="M7.48 12L4.74 9.26L2 12L4.74 14.74L7.48 12Z"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            </div>
            <div className="offline-text">
              <strong>You're offline</strong>
              <span>Some features may not be available until you reconnect.</span>
            </div>
            <div className="offline-status">
              <div className="connection-indicator offline"></div>
            </div>
          </div>
        </div>
      )}

      {/* Reconnected Toast */}
      {showReconnected && (showBanner || showToast) && (
        <div className="reconnected-toast">
          <div className="reconnected-content">
            <div className="reconnected-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12A10 10 0 1 1 5.93 7.25"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <span>Back online</span>
          </div>
        </div>
      )}

      {/* Connection Status Indicator (always rendered for programmatic access) */}
      <div className={`connection-status ${isOnline ? 'online' : 'offline'}`} data-online={isOnline}>
        {children}
      </div>
    </>
  );
};

// Hook for using offline state in components
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Component for wrapping content that should be disabled when offline
export const OnlineOnly = ({ children, fallback = null, showOfflineMessage = true }) => {
  const isOnline = useOfflineStatus();

  if (!isOnline) {
    if (fallback) {
      return fallback;
    }

    if (showOfflineMessage) {
      return (
        <div className="offline-content">
          <div className="offline-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.26 21L12 18.26L14.74 21L12 23.74L9.26 21Z"/>
              <path d="M12 2L14.74 4.74L12 7.48L9.26 4.74L12 2Z"/>
              <path d="M21 12L18.26 9.26L15.52 12L18.26 14.74L21 12Z"/>
              <path d="M7.48 12L4.74 9.26L2 12L4.74 14.74L7.48 12Z"/>
              <line x1="2" y1="2" x2="22" y2="22"/>
            </svg>
            <span>This feature requires an internet connection</span>
          </div>
        </div>
      );
    }

    return null;
  }

  return children;
};

export default OfflineHandler;