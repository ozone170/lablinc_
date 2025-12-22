import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import './AdminDashboardSummary.css';

const AdminDashboardSummary = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      const data = response?.data || response || {};
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: '👥',
      label: 'Total Users',
      value: analytics?.totalUsers || analytics?.users?.total || 0,
      link: '/admin?tab=users'
    },
    {
      icon: '🔬',
      label: 'Total Instruments',
      value: analytics?.totalInstruments || analytics?.instruments?.total || 0,
      link: '/admin?tab=instruments'
    },
    {
      icon: '📅',
      label: 'Total Bookings',
      value: analytics?.totalBookings || analytics?.bookings?.total || 0,
      link: '/admin?tab=bookings'
    },
    {
      icon: '💰',
      label: 'Total Revenue',
      value: `₹${analytics?.totalRevenue || analytics?.revenue?.total || 0}`,
      link: '/admin?tab=analytics'
    },
    {
      icon: '✅',
      label: 'Active Bookings',
      value: analytics?.activeBookings || analytics?.bookings?.confirmed || 0,
      link: '/admin?tab=bookings'
    },
    {
      icon: '⏳',
      label: 'Pending Bookings',
      value: analytics?.pendingBookings || analytics?.bookings?.pending || 0,
      link: '/admin?tab=bookings'
    }
  ];

  return (
    <div className="admin-dashboard-summary">
      <div className="dashboard-header">
        <h3 style={{ color: 'black' }}>📊 Analytics Dashboard</h3>
        <p style={{ color: 'black' }}>Quick overview and access to admin panel</p>
      </div>

      {loading ? (
        <div className="analytics-loading" style={{ color: 'grey', textAlign: 'center', padding: '2rem' }}>
          <div>Loading analytics...</div>
        </div>
      ) : (
        <>
          <div className="admin-stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {stats.map((stat, index) => (
              <Link 
                key={index}
                to={stat.link} 
                className="stat-card-link"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'black',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'black' }}>
                  {stat.value}
                </div>
              </Link>
            ))}
          </div>

          <div className="admin-cards">
            <Link to="/admin?tab=users" className="admin-card">
              <div className="card-icon">👥</div>
              <h3>User Management</h3>
              <p>Manage users, roles, permissions, and account status across the platform</p>
            </Link>

            <Link to="/admin?tab=instruments" className="admin-card">
              <div className="card-icon">🔬</div>
              <h3>Instruments</h3>
              <p>Oversee all instruments, listings, and featured equipment</p>
            </Link>

            <Link to="/admin?tab=bookings" className="admin-card">
              <div className="card-icon">📅</div>
              <h3>Bookings</h3>
              <p>Monitor and manage all bookings, schedules, and reservations</p>
            </Link>

            <Link to="/admin?tab=analytics" className="admin-card">
              <div className="card-icon">📊</div>
              <h3>Analytics</h3>
              <p>View comprehensive platform statistics, metrics, and insights</p>
            </Link>

            <Link to="/admin?tab=partners" className="admin-card">
              <div className="card-icon">🤝</div>
              <h3>Partner Applications</h3>
              <p>Review and approve institute partnership requests</p>
            </Link>

            <Link to="/admin?tab=messages" className="admin-card">
              <div className="card-icon">✉️</div>
              <h3>Contact Messages</h3>
              <p>View and respond to user inquiries and support requests</p>
            </Link>
          </div>
        </>
      )}

      <div className="admin-cta">
        <Link to="/admin" className="btn btn-primary btn-large">
          Go to Full Admin Panel
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardSummary;
