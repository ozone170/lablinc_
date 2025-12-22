import { Link } from 'react-router-dom';
import Card, { CardBody } from '../ui/Card';
import Badge from '../ui/Badge';

const ProfileCard = ({ user }) => {
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'institute': return 'primary';
      case 'msme': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card className="profile-card">
      <CardBody>
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-info">
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          
          <div className="profile-meta">
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role?.toUpperCase()}
            </Badge>
            <Badge variant={user.emailVerified ? 'success' : 'warning'}>
              {user.emailVerified ? '✓ Verified' : 'Not Verified'}
            </Badge>
          </div>

          {user.organization && (
            <p className="profile-organization">
              <strong>Organization:</strong> {user.organization}
            </p>
          )}

          {user.phone && (
            <p className="profile-phone">
              <strong>Phone:</strong> {user.phone}
            </p>
          )}
        </div>

        <div className="profile-actions">
          <Link to="/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
          <Link to="/settings" className="btn btn-secondary">
            Settings
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
