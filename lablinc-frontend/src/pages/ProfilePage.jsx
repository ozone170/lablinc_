import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth.api';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getCurrentUser();
      setProfile(response.data?.user || response.user || user);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setActiveTab('profile');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'msme':
        return 'MSME User';
      case 'institute':
        return 'Institute User';
      default:
        return role;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full platform access with administrative privileges';
      case 'msme':
        return 'Access to browse and book equipment from institutes';
      case 'institute':
        return 'Ability to list equipment and manage bookings';
      default:
        return 'Platform user';
    }
  };

  if (loading) {
    return (
      <NoFooterLayout>
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </NoFooterLayout>
    );
  }

  if (error) {
    return (
      <NoFooterLayout>
        <div className="profile-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Profile</h2>
          <p>{error}</p>
          <button onClick={fetchProfile} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </NoFooterLayout>
    );
  }

  return (
    <NoFooterLayout>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="profile-info">
              <h1>{profile?.name || 'User'}</h1>
              <p className="profile-role">{getRoleDisplayName(profile?.role)}</p>
              <p className="profile-email">{profile?.email}</p>
            </div>
            <div className="profile-actions">
              <Link to="/profile/edit" className="btn btn-primary">
                <span className="btn-icon">✏️</span>
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="tab-icon">👤</span>
              Profile Information
            </button>
            <button
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="tab-icon">🔒</span>
              Security
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'profile' && (
              <div className="profile-tab">
                <div className="profile-section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <span>{profile?.name || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email Address</label>
                      <span>{profile?.email || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <span>{profile?.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Organization</label>
                      <span>{profile?.organization || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Account Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Account Type</label>
                      <div className="role-info">
                        <span className={`role-badge role-${profile?.role}`}>
                          {getRoleDisplayName(profile?.role)}
                        </span>
                        <small>{getRoleDescription(profile?.role)}</small>
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Account Status</label>
                      <span className={`status-badge status-${profile?.status}`}>
                        {profile?.status || 'Active'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Email Verification</label>
                      <span className={`verification-badge ${profile?.emailVerified ? 'verified' : 'unverified'}`}>
                        {profile?.emailVerified ? '✅ Verified' : '❌ Not Verified'}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Member Since</label>
                      <span>
                        {profile?.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not available'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="security-tab">
                <div className="profile-section">
                  <h3>Change Password</h3>
                  <p className="section-description">
                    Update your password to keep your account secure. Make sure to use a strong password.
                  </p>
                  <PasswordChangeForm onSuccess={handlePasswordChangeSuccess} />
                </div>

                <div className="profile-section">
                  <h3>Security Tips</h3>
                  <div className="security-tips">
                    <div className="tip-item">
                      <span className="tip-icon">🔐</span>
                      <div>
                        <strong>Use a strong password</strong>
                        <p>Include uppercase, lowercase, numbers, and special characters</p>
                      </div>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">🔄</span>
                      <div>
                        <strong>Change passwords regularly</strong>
                        <p>Update your password every 3-6 months for better security</p>
                      </div>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">📧</span>
                      <div>
                        <strong>Verify your email</strong>
                        <p>Keep your email verified to receive important notifications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </NoFooterLayout>
  );
};

export default ProfilePage;
