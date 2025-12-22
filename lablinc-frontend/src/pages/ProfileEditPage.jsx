import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import { authAPI } from '../api/auth.api';
import { useAuth } from '../hooks/useAuth';
import { ProfileEditForm } from '../components/profile';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUserData(response.data?.user || response.user || user);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <NoFooterLayout>
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </NoFooterLayout>
    );
  }

  return (
    <NoFooterLayout>
      <div className="container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Edit Profile</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Update your personal information
        </p>
        
        <ProfileEditForm
          user={userData || user}
          onSuccess={async () => {
            await refreshUser();
            alert('Profile updated successfully!');
            navigate('/profile');
          }}
        />
      </div>
    </NoFooterLayout>
  );
};

export default ProfileEditPage;
