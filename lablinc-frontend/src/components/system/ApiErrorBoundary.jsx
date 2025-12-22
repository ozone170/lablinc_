import React from 'react';
import { getConfigurationHealth, isDevelopment } from '../../config/environment.js';
import { getConnectionStatus } from '../../api/client.js';

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      configHealth: null,
      connectionStatus: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Get system status for debugging
    const configHealth = getConfigurationHealth();
    const connectionStatus = getConnectionStatus();

    this.setState({
      error,
      errorInfo,
      configHealth,
      connectionStatus
    });

    // Log error in development
    if (isDevelopment()) {
      console.group('🚨 API Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.log('Config Health:', configHealth);
      console.log('Connection Status:', connectionStatus);
      console.groupEnd();
    }

    // Report error to monitoring service in production
    if (!isDevelopment() && this.props.onError) {
      this.props.onError(error, errorInfo, {
        configHealth,
        connectionStatus,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      configHealth: null,
      connectionStatus: null
    });

    // Reload the page if retry callback is not provided
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  handleReportIssue = () => {
    const { error, errorInfo, configHealth, connectionStatus } = this.state;
    
    const errorReport = {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      configHealth,
      connectionStatus,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please share this with support.');
      })
      .catch(() => {
        // Fallback: show error report in a new window
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
          <html>
            <head><title>Error Report</title></head>
            <body>
              <h1>Error Report</h1>
              <pre>${JSON.stringify(errorReport, null, 2)}</pre>
            </body>
          </html>
        `);
      });
  };

  render() {
    if (this.state.hasError) {
      const { error, configHealth, connectionStatus } = this.state;
      const isConfigError = !configHealth?.isValid;
      const isNetworkError = !connectionStatus?.isOnline;
      
      return (
        <div className="api-error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <div className="error-content">
              <h2>Something went wrong</h2>
              
              {isNetworkError ? (
                <div className="error-message network-error">
                  <p>You appear to be offline. Please check your internet connection and try again.</p>
                </div>
              ) : isConfigError ? (
                <div className="error-message config-error">
                  <p>There's a configuration issue preventing the application from working properly.</p>
                  {isDevelopment() && configHealth?.errors && (
                    <details className="error-details">
                      <summary>Configuration Errors</summary>
                      <ul>
                        {configHealth.errors.map((err, index) => (
                          <li key={index}>{err}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ) : (
                <div className="error-message general-error">
                  <p>An unexpected error occurred. This might be a temporary issue.</p>
                  {isDevelopment() && error && (
                    <details className="error-details">
                      <summary>Error Details</summary>
                      <pre>{error.message}</pre>
                    </details>
                  )}
                </div>
              )}

              <div className="error-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={this.handleRetry}
                >
                  Try Again
                </button>
                
                {!isNetworkError && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={this.handleReportIssue}
                  >
                    Report Issue
                  </button>
                )}
              </div>

              {/* Troubleshooting Tips */}
              <div className="troubleshooting-tips">
                <h3>Troubleshooting Tips</h3>
                <ul>
                  {isNetworkError ? (
                    <>
                      <li>Check your internet connection</li>
                      <li>Try refreshing the page</li>
                      <li>Disable any VPN or proxy</li>
                    </>
                  ) : isConfigError ? (
                    <>
                      <li>Contact your system administrator</li>
                      <li>Check environment configuration</li>
                      <li>Verify API server is running</li>
                    </>
                  ) : (
                    <>
                      <li>Refresh the page</li>
                      <li>Clear your browser cache</li>
                      <li>Try again in a few minutes</li>
                      <li>Contact support if the issue persists</li>
                    </>
                  )}
                </ul>
              </div>

              {/* System Status (Development Only) */}
              {isDevelopment() && (
                <div className="system-status">
                  <h3>System Status</h3>
                  <div className="status-grid">
                    <div className="status-item">
                      <span className="status-label">Environment:</span>
                      <span className="status-value">{configHealth?.environment || 'Unknown'}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Config Valid:</span>
                      <span className={`status-value ${configHealth?.isValid ? 'success' : 'error'}`}>
                        {configHealth?.isValid ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Network:</span>
                      <span className={`status-value ${connectionStatus?.isOnline ? 'success' : 'error'}`}>
                        {connectionStatus?.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">API URL:</span>
                      <span className="status-value">{connectionStatus?.apiUrl || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;