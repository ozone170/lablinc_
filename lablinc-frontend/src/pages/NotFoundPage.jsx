import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [isAutoRedirect, setIsAutoRedirect] = useState(true);

  // Auto redirect countdown
  useEffect(() => {
    if (!isAutoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isAutoRedirect]);

  // Stop auto redirect
  const handleStopRedirect = () => {
    setIsAutoRedirect(false);
  };

  // Get suggested pages based on current path
  const getSuggestedPages = () => {
    const path = location.pathname.toLowerCase();
    const suggestions = [];

    if (path.includes('admin')) {
      suggestions.push({ name: 'Admin Dashboard', path: '/admin', icon: '🔧' });
    }
    if (path.includes('equipment') || path.includes('instrument')) {
      suggestions.push({ name: 'Equipment Catalog', path: '/equipment', icon: '🔬' });
    }
    if (path.includes('booking')) {
      suggestions.push({ name: 'My Bookings', path: '/bookings', icon: '📅' });
    }
    if (path.includes('profile') || path.includes('account')) {
      suggestions.push({ name: 'User Profile', path: '/profile', icon: '👤' });
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Equipment Catalog', path: '/equipment', icon: '🔬' },
        { name: 'About Us', path: '/about', icon: 'ℹ️' }
      );
    }

    return suggestions;
  };

  const suggestedPages = getSuggestedPages();

  return (
    <NoFooterLayout>
      <div className="not-found-content">
        <div className="not-found-container">
          {/* Animated 404 */}
          <div className="error-animation">
            <div className="error-number">
              <span className="digit">4</span>
              <span className="digit zero">0</span>
              <span className="digit">4</span>
            </div>
            <div className="error-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="error-message">
            <h1>Oops! Page Not Found</h1>
            <p>
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, it happens to the best of us!
            </p>
            <div className="error-details">
              <strong>Requested URL:</strong> <code>{location.pathname}</code>
            </div>
          </div>

          {/* Auto Redirect Notice */}
          {isAutoRedirect && (
            <div className="auto-redirect">
              <div className="redirect-message">
                <span className="redirect-icon">🔄</span>
                Redirecting to home page in <strong>{countdown}</strong> seconds
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleStopRedirect}
              >
                Cancel Auto-redirect
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              <span className="btn-icon">🏠</span>
              Go to Home
            </Link>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              <span className="btn-icon">⬅️</span>
              Go Back
            </button>
          </div>

          {/* Suggested Pages */}
          <div className="suggested-pages">
            <h3>You might be looking for:</h3>
            <div className="suggestions-grid">
              {suggestedPages.map((page, index) => (
                <Link 
                  key={index}
                  to={page.path} 
                  className="suggestion-card"
                >
                  <span className="suggestion-icon">{page.icon}</span>
                  <span className="suggestion-name">{page.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="help-section">
            <h3>Need Help?</h3>
            <div className="help-options">
              <Link to="/contact" className="help-option">
                <span className="help-icon">📧</span>
                <div>
                  <strong>Contact Support</strong>
                  <p>Get in touch with our team</p>
                </div>
              </Link>
              <Link to="/faq" className="help-option">
                <span className="help-icon">❓</span>
                <div>
                  <strong>FAQ</strong>
                  <p>Find answers to common questions</p>
                </div>
              </Link>
              <button 
                className="help-option"
                onClick={() => window.location.reload()}
              >
                <span className="help-icon">🔄</span>
                <div>
                  <strong>Refresh Page</strong>
                  <p>Try loading the page again</p>
                </div>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="search-section">
            <h3>Search for what you need:</h3>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search equipment, services, or information..."
                className="search-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/equipment?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
              />
              <button className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21L16.65 16.65"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </NoFooterLayout>
  );
};

export default NotFoundPage;