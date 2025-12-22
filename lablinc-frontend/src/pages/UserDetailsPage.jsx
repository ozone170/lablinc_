import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { adminAPI } from '../api/admin.api';
import Badge from '../components/ui/Badge';
import '../styles/admin.css';

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({ limit: 1000 });
      const usersData = Array.isArray(response?.data?.users) 
        ? response.data.users 
        : Array.isArray(response?.data) 
        ? response.data 
        : [];
      
      const foundUser = usersData.find(u => u._id === id);
      setUser(foundUser);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await adminAPI.updateUserStatus(id, newStatus);
      fetchUserDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update user status');
    }
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      admin: 'danger',
      msme: 'primary',
      institute: 'info',
      user: 'default',
    };
    return variants[role] || 'default';
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      active: 'success',
      suspended: 'warning',
      inactive: 'default',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div className="loading-spinner">⏳</div>
          <div>Loading user details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div>User not found</div>
          <button onClick={() => navigate('/admin?tab=users')} className="btn btn-primary">
            Back to Users
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="user-details-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button 
              onClick={() => navigate('/admin?tab=users')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Users
            </button>
            <h1 style={{ margin: 0 }}>User Details - {user.name}</h1>
          </div>
          <Badge variant={getStatusBadgeVariant(user.status)}>
            {user.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        <div className="user-details">
          <div className="detail-section">
            <h4 className="section-title">👤 Personal Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="font-semibold">{user.name}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span>{user.email}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role?.toUpperCase()}
              </Badge>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Organization:</span>
              <span>{user.organization || '-'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span>{user.phone || '-'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status?.toUpperCase()}
              </Badge>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Joined:</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            {user.address && (
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span>{user.address}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            {user.status === 'active' ? (
              <button
                onClick={() => handleStatusChange('suspended')}
                className="btn btn-warning"
              >
                ⚠️ Suspend User
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                className="btn btn-success"
              >
                ✅ Activate User
              </button>
            )}
            <button
              onClick={() => navigate('/admin?tab=users')}
              className="btn btn-secondary"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetailsPage;
