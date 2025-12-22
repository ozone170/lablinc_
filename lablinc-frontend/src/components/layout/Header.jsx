import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import NavThemeToggle from '../ui/NavThemeToggle';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            <img src="/logo.png" alt="LabLinc Logo" className="logo-image" />
            <span className="logo-text">LabLinc</span>
          </Link>

          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>

          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/equipment" 
              className={`nav-link ${location.pathname.startsWith('/equipment') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Equipment
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link 
              to="/partner" 
              className={`nav-link ${location.pathname === '/partner' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Partner
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            {isAuthenticated && (
              <div className="mobile-user-section">
                <span className="mobile-user-name">{user?.name} ({user?.role})</span>
                <div className="mobile-user-actions">
                  <NavThemeToggle />
                  <button onClick={handleLogout} className="btn btn-secondary mobile-logout">
                    Logout
                  </button>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mobile-auth-buttons">
                <NavThemeToggle />
                <Link to="/login" className="btn btn-secondary" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary" onClick={closeMobileMenu}>
                  Register
                </Link>
              </div>
            )}
          </nav>

          <div className="auth-section">
            <NavThemeToggle />
            {isAuthenticated ? (
              <div className="user-menu">
                <NotificationBell />
                <span className="user-name">
                  {user?.name} ({user?.role})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
