import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import NotificationBell from '../notifications/NotificationBell';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const openLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const openRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="LabLinc Logo" className="logo-image" />
            <span className="logo-text">LabLinc</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/equipment" className="nav-link">Equipment</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/partner" className="nav-link">Partner</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link">Admin</Link>
                )}
              </>
            )}
          </nav>

          <div className="auth-section">
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
                <button onClick={openLogin} className="btn btn-secondary">
                  Login
                </button>
                <button onClick={openRegister} className="btn btn-primary">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={openRegister}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={openLogin}
      />
    </>
  );
};

export default Header;
