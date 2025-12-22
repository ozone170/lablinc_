import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import { authAPI } from '../api/auth.api';
import { useAuth } from '../hooks/useAuth';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import './ProfileEditPage.css';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getCurrentUser();
      setUserData(response.data?.user || response.user || user);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    try {
      await refreshUser();
      navigate('/profile', { 
        state: { message: 'Profile updated successfully!' }
      });
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <NoFooterLayout>
        <div className="profile-edit-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </NoFooterLayout>
    );
  }

  if (error) {
    return (
      <NoFooterLayout>
        <div className="profile-edit-error">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Profile</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchProfile} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={() => navigate('/profile')} className="btn btn-secondary">
              Back to Profile
            </button>
          </div>
        </div>
      </NoFooterLayout>
    );
  }

  return (
    <NoFooterLayout>
      <div className="profile-edit-page">
        <div className="profile-edit-container">
          <div className="profile-edit-header">
            <button 
              onClick={() => navigate('/profile')} 
              className="back-button"
              aria-label="Back to profile"
            >
              ← Back
            </button>
            <div className="header-content">
              <h1>Edit Profile</h1>
              <p>Update your personal information and account details</p>
            </div>
          </div>

          <div className="profile-edit-content">
            <div className="edit-form-section">
              <ProfileEditForm
                user={userData || user}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </NoFooterLayout>
  );
};

export default ProfileEditPage;
