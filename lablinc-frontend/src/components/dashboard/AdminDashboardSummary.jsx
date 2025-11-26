import { Link } from 'react-router-dom';
import './AdminDashboardSummary.css';

const AdminDashboardSummary = () => {
  return (
    <div className="admin-dashboard-summary">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Quick overview and access to admin panel</p>
      </div>

      <div className="admin-cards">
        <Link to="/admin" className="admin-card">
          <div className="card-icon">👥</div>
          <h3>User Management</h3>
          <p>Manage users, roles, and permissions</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">🔬</div>
          <h3>Instruments</h3>
          <p>Oversee all instruments and listings</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">📅</div>
          <h3>Bookings</h3>
          <p>Monitor and manage all bookings</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">📊</div>
          <h3>Analytics</h3>
          <p>View platform statistics and insights</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">🤝</div>
          <h3>Partner Applications</h3>
          <p>Review institute partnership requests</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">✉️</div>
          <h3>Contact Messages</h3>
          <p>View and respond to inquiries</p>
        </Link>
      </div>

      <div className="admin-cta">
        <Link to="/admin" className="btn btn-primary btn-large">
          Go to Full Admin Panel
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardSummary;
