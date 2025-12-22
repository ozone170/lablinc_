import React, { useState, useEffect } from 'react';
import { getConfigurationHealth, isProduction } from '../../config/environment.js';
import { checkApiHealth, getConnectionStatus } from '../../api/client.js';

const ConfigurationStatus = ({ showDetails = false, onConfigError = null }) => {
  const [configHealth, setConfigHealth] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSystemHealth = async () => {
      setIsLoading(true);
      
      try {
        // Get configuration health
        const config = getConfigurationHealth();
        setConfigHealth(config);

        // Get connection status
        const connection = getConnectionStatus();
        setConnectionStatus(connection);

        // Check API health (only if config is valid)
        if (config.isValid && connection.isOnline) {
          try {
            const api = await checkApiHealth();
            setApiHealth(api);
          } catch (error) {
            setApiHealth({
              isHealthy: false,
              error: error.message,
              status: 'error'
            });
          }
        }

        // Notify parent of configuration errors
        if (!config.isValid && onConfigError) {
          onConfigError(config.errors);
        }
      } catch (error) {
        console.error('System health check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemHealth();

    // Set up periodic health checks (every 30 seconds)
    const interval = setInterval(checkSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, [onConfigError]);

  // Don't show in production unless there are errors
  if (isProduction() && configHealth?.isValid && !showDetails) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="config-status loading">
        <div className="loading-spinner"></div>
        <span>Checking system status...</span>
      </div>
    );
  }

  const hasErrors = !configHealth?.isValid || !apiHealth?.isHealthy || !connectionStatus?.isOnline;
  const hasWarnings = configHealth?.warnings?.length > 0;

  return (
    <div className={`config-status ${hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'}`}>
      {/* Status Indicator */}
      <div className="status-indicator">
        <div className={`status-dot ${hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'}`}></div>
        <span className="status-text">
          {hasErrors ? 'System Issues Detected' : hasWarnings ? 'System Warnings' : 'System Healthy'}
        </span>
      </div>

      {/* Detailed Status (if requested or if there are issues) */}
      {(showDetails || hasErrors || hasWarnings) && (
        <div className="status-details">
          {/* Configuration Status */}
          <div className="status-section">
            <h4>Configuration</h4>
            <div className={`status-item ${configHealth?.isValid ? 'success' : 'error'}`}>
              <span className="status-label">Environment:</span>
              <span className="status-value">{configHealth?.environment}</span>
            </div>
            
            {configHealth?.errors?.length > 0 && (
              <div className="error-list">
                <strong>Errors:</strong>
                <ul>
                  {configHealth.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {configHealth?.warnings?.length > 0 && (
              <div className="warning-list">
                <strong>Warnings:</strong>
                <ul>
                  {configHealth.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Connection Status */}
          <div className="status-section">
            <h4>Connection</h4>
            <div className={`status-item ${connectionStatus?.isOnline ? 'success' : 'error'}`}>
              <span className="status-label">Network:</span>
              <span className="status-value">{connectionStatus?.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="status-item">
              <span className="status-label">API URL:</span>
              <span className="status-value">{connectionStatus?.apiUrl}</span>
            </div>
          </div>

          {/* API Health */}
          {apiHealth && (
            <div className="status-section">
              <h4>API Health</h4>
              <div className={`status-item ${apiHealth.isHealthy ? 'success' : 'error'}`}>
                <span className="status-label">Status:</span>
                <span className="status-value">
                  {apiHealth.isHealthy ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
              {apiHealth.responseTime && (
                <div className="status-item">
                  <span className="status-label">Response Time:</span>
                  <span className="status-value">{apiHealth.responseTime}</span>
                </div>
              )}
              {apiHealth.error && (
                <div className="error-message">
                  <strong>Error:</strong> {apiHealth.error}
                </div>
              )}
            </div>
          )}

          {/* Troubleshooting Tips */}
          {hasErrors && (
            <div className="status-section troubleshooting">
              <h4>Troubleshooting</h4>
              <ul>
                {!connectionStatus?.isOnline && (
                  <li>Check your internet connection</li>
                )}
                {!configHealth?.isValid && (
                  <li>Verify environment variables are set correctly</li>
                )}
                {!apiHealth?.isHealthy && connectionStatus?.isOnline && (
                  <li>Check if the API server is running</li>
                )}
                <li>Try refreshing the page</li>
                <li>Contact support if issues persist</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurationStatus;