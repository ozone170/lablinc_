import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin.api';
import Card from '../ui/Card';
import '../../styles/admin.css';

// Clickable stat card component
const StatCard = ({ label, value, link }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div 
      className={`stat-card ${link ? 'stat-card-clickable' : ''}`}
      onClick={handleClick}
      role={link ? 'button' : 'presentation'}
      tabIndex={link ? 0 : undefined}
      onKeyPress={(e) => {
        if (link && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {link && <div className="stat-card-arrow">→</div>}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueReport, setRevenueReport] = useState(null);
  const [usageReport, setUsageReport] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, usageData] = await Promise.all([
        adminAPI.getAnalytics().catch(err => {
          console.error('Analytics error:', err);
          return null;
        }),
        adminAPI.getUsageReport().catch(err => {
          console.error('Usage error:', err);
          return null;
        }),
      ]);
      
      // Extract data from response (handle different response formats)
      const analytics = analyticsData?.data || analyticsData || {};
      const usage = usageData?.data || usageData || {};
      
      console.log('Analytics Data:', analytics);
      console.log('Usage Data:', usage);
      
      setAnalytics(analytics);
      // Use revenue breakdown from analytics instead of separate call
      setRevenueReport(analytics?.revenueBreakdown || {});
      setUsageReport(usage);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set empty data to show 0s instead of loading forever
      setAnalytics({});
      setRevenueReport({});
      setUsageReport({});
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    // Validate data exists and is an array with items
    if (!data || !Array.isArray(data) || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Ensure first item exists and has properties
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') {
      alert('Invalid data format for export');
      return;
    }

    const headers = Object.keys(firstItem);
    if (headers.length === 0) {
      alert('No data fields to export');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportBookings = async () => {
    try {
      const response = await adminAPI.getBookings({ limit: 1000 });
      // Handle different response structures
      let bookingsData = [];
      if (response?.data?.bookings) {
        bookingsData = response.data.bookings;
      } else if (response?.bookings) {
        bookingsData = response.bookings;
      } else if (Array.isArray(response?.data)) {
        bookingsData = response.data;
      } else if (Array.isArray(response)) {
        bookingsData = response;
      }
      
      exportToCSV(bookingsData, 'bookings');
    } catch (error) {
      console.error('Failed to export bookings:', error);
      alert('Failed to export bookings');
    }
  };

  const handleExportInstruments = async () => {
    try {
      const response = await adminAPI.getInstruments({ limit: 1000 });
      // Handle different response structures
      let instrumentsData = [];
      if (response?.data?.instruments) {
        instrumentsData = response.data.instruments;
      } else if (response?.instruments) {
        instrumentsData = response.instruments;
      } else if (Array.isArray(response?.data)) {
        instrumentsData = response.data;
      } else if (Array.isArray(response)) {
        instrumentsData = response;
      }
      
      exportToCSV(instrumentsData, 'instruments');
    } catch (error) {
      console.error('Failed to export instruments:', error);
      alert('Failed to export instruments');
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ limit: 1000 });
      // Handle different response structures
      let usersData = [];
      if (response?.data?.users) {
        usersData = response.data.users;
      } else if (response?.users) {
        usersData = response.users;
      } else if (Array.isArray(response?.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      
      exportToCSV(usersData, 'users');
    } catch (error) {
      console.error('Failed to export users:', error);
      alert('Failed to export users');
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">⏳</div>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div>
          <h2><span className="icon-emoji">📊</span> Analytics Dashboard</h2>
          <button onClick={fetchAnalytics} className="btn btn-sm btn-secondary" style={{ marginTop: '0.5rem' }}>
            🔄 Refresh Data
          </button>
        </div>
        <div className="export-buttons">
          <button onClick={handleExportBookings} className="btn btn-secondary">
            📥 Export Bookings
          </button>
          <button onClick={handleExportInstruments} className="btn btn-secondary">
            📥 Export Instruments
          </button>
          <button onClick={handleExportUsers} className="btn btn-secondary">
            📥 Export Users
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          label="👥 Total Users" 
          value={analytics?.totalUsers || analytics?.users?.total || 0}
          link="/admin?tab=users"
        />

        <StatCard 
          label="🔬 Total Instruments" 
          value={analytics?.totalInstruments || analytics?.instruments?.total || 0}
          link="/admin?tab=instruments"
        />

        <StatCard 
          label="📅 Total Bookings" 
          value={analytics?.totalBookings || analytics?.bookings?.total || 0}
          link="/admin?tab=bookings"
        />

        <StatCard 
          label="💰 Total Revenue" 
          value={`₹${analytics?.totalRevenue || analytics?.revenue?.total || 0}`}
          link="/admin?tab=bookings"
        />

        <StatCard 
          label="✅ Active Bookings" 
          value={analytics?.activeBookings || analytics?.bookings?.confirmed || 0}
          link="/admin?tab=bookings"
        />

        <StatCard 
          label="⏳ Pending Bookings" 
          value={analytics?.pendingBookings || analytics?.bookings?.pending || 0}
          link="/admin?tab=bookings"
        />
      </div>

      {revenueReport && (
        <div className="report-card">
          <h3>💵 Revenue Report</h3>
          <div className="report-content">
            <div className="report-row">
              <span>This Month:</span>
              <span className="font-bold">₹{revenueReport.thisMonth || 0}</span>
            </div>
            <div className="report-row">
              <span>Last Month:</span>
              <span>₹{revenueReport.lastMonth || 0}</span>
            </div>
            <div className="report-row">
              <span>This Year:</span>
              <span>₹{revenueReport.thisYear || 0}</span>
            </div>
          </div>
        </div>
      )}

      {usageReport && usageReport.topInstruments && (
        <div className="report-card">
          <h3>🏆 Top Instruments</h3>
          <div className="report-content">
            {usageReport.topInstruments.slice(0, 5).map((item, idx) => (
              <div key={idx} className="report-row">
                <span>{item.name || item.instrument?.name}</span>
                <span className="font-bold">{item.bookings || item.count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {usageReport && usageReport.topUsers && (
        <div className="report-card">
          <h3>⭐ Top Users</h3>
          <div className="report-content">
            {usageReport.topUsers.slice(0, 5).map((item, idx) => (
              <div key={idx} className="report-row">
                <span>{item.name || item.user?.name}</span>
                <span className="font-bold">{item.bookings || item.count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
