import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [emailOTP, setEmailOTP] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

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

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      await authAPI.resendVerificationEmail(profile.email);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resend verification email', 'error');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSendOTPForVerification = async () => {
    try {
      setOtpLoading(true);
      setOtpError('');
      await authAPI.sendEmailOTP(profile.email);
      setShowOTPVerification(true);
      showToast('OTP sent to your email address', 'success');
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');
      await authAPI.verifyEmailOTP(profile.email, emailOTP);
      
      // Refresh profile to get updated verification status
      await fetchProfile();
      await refreshUser();
      
      setShowOTPVerification(false);
      setEmailOTP('');
      showToast('Email verified successfully!', 'success');
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
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
                      <div className="verification-status">
                        <span className={`verification-badge ${profile?.emailVerified ? 'verified' : 'unverified'}`}>
                          {profile?.emailVerified ? '✅ Verified' : '❌ Not Verified'}
                        </span>
                        {!profile?.emailVerified && (
                          <div className="verification-actions">
                            <button
                              onClick={handleResendVerification}
                              disabled={resendingVerification}
                              className="btn btn-small btn-secondary"
                            >
                              {resendingVerification ? 'Sending...' : 'Resend Email'}
                            </button>
                            <span style={{ margin: '0 8px', color: '#6b7280' }}>or</span>
                            <button
                              onClick={handleSendOTPForVerification}
                              disabled={otpLoading}
                              className="btn btn-small btn-primary"
                            >
                              {otpLoading ? 'Sending...' : 'Verify with OTP'}
                            </button>
                          </div>
                        )}
                        
                        {showOTPVerification && !profile?.emailVerified && (
                          <div className="otp-verification-section" style={{ marginTop: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '14px', color: '#374151', marginBottom: '5px', display: 'block' }}>
                                  Enter OTP sent to your email
                                </label>
                                <input
                                  type="text"
                                  placeholder="6-digit OTP"
                                  value={emailOTP}
                                  onChange={(e) => {
                                    setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    setOtpError('');
                                  }}
                                  maxLength={6}
                                  style={{ 
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    letterSpacing: '2px',
                                    fontSize: '16px'
                                  }}
                                />
                              </div>
                              <button
                                onClick={handleVerifyEmailOTP}
                                disabled={otpLoading || emailOTP.length !== 6}
                                className="btn btn-small btn-primary"
                              >
                                {otpLoading ? 'Verifying...' : 'Verify'}
                              </button>
                            </div>
                            {otpError && (
                              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px' }}>
                                {otpError}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setShowOTPVerification(false);
                                setEmailOTP('');
                                setOtpError('');
                              }}
                              style={{ 
                                background: 'none',
                                border: 'none',
                                color: '#6b7280',
                                fontSize: '14px',
                                marginTop: '10px',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              Cancel OTP verification
                            </button>
                          </div>
                        )}
                      </div>
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
