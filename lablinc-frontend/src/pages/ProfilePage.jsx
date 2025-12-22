import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth.api';
import { useToast } from '../hooks/useToast';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      setProfile(response.data.user);
    } catch (error) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="container profile-page">
      <h1>My Profile</h1>
      {profile && (
        <div className="profile-card">
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
            <p><strong>Organization:</strong> {profile.organization || 'Not provided'}</p>
            <p><strong>Status:</strong> {profile.status}</p>
            <p><strong>Email Verified:</strong> {profile.emailVerified ? 'Yes' : 'No'}</p>
          </div>
          <div className="profile-actions">
            <a href="/profile/edit" className="btn btn-primary">Edit Profile</a>
            <a href="/settings" className="btn btn-secondary">Settings</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
