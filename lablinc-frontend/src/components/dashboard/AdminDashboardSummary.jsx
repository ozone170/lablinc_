import { Link } from 'react-router-dom';
import './AdminDashboardSummary.css';

const AdminDashboardSummary = () => {
  return (
    <div className="admin-dashboard-summary">
      <div className="dashboard-header">
        <h3 style={{ color: 'white' }}>Admin Dashboard</h3>
        <p style={{ color: 'white' }}>Quick overview and access to admin panel</p>
      </div>

      <div className="admin-cards">
        <Link to="/admin" className="admin-card">
          <div className="card-icon">👥</div>
          <h3>User Management</h3>
          <p>Manage users, roles, permissions, and account status across the platform</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">🔬</div>
          <h3>Instruments</h3>
          <p>Oversee all instruments, listings, and featured equipment</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">📅</div>
          <h3>Bookings</h3>
          <p>Monitor and manage all bookings, schedules, and reservations</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">📊</div>
          <h3>Analytics</h3>
          <p>View comprehensive platform statistics, metrics, and insights</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">🤝</div>
          <h3>Partner Applications</h3>
          <p>Review and approve institute partnership requests</p>
        </Link>

        <Link to="/admin" className="admin-card">
          <div className="card-icon">✉️</div>
          <h3>Contact Messages</h3>
          <p>View and respond to user inquiries and support requests</p>
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
