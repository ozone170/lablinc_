import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { adminAPI } from '../api/admin.api';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');

    try {
      switch (activeTab) {
        case 'analytics':
          const analyticsRes = await adminAPI.getAnalytics();
          if (analyticsRes.success) setAnalytics(analyticsRes.data);
          break;
        case 'users':
          const usersRes = await adminAPI.getUsers({ limit: 50 });
          if (usersRes.success) setUsers(usersRes.data.users);
          break;
        case 'instruments':
          const instrumentsRes = await adminAPI.getInstruments({ limit: 50 });
          if (instrumentsRes.success) setInstruments(instrumentsRes.data.instruments);
          break;
        case 'bookings':
          const bookingsRes = await adminAPI.getBookings({ limit: 50 });
          if (bookingsRes.success) setBookings(bookingsRes.data.bookings);
          break;
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId, status) => {
    try {
      await adminAPI.updateUserStatus(userId, status);
      loadTabData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleToggleFeature = async (instrumentId) => {
    try {
      await adminAPI.toggleInstrumentFeature(instrumentId);
      loadTabData();
    } catch (err) {
      alert('Failed to toggle feature status');
    }
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await adminAPI.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b._id === bookingId ? { ...b, status: newStatus } : b
        ));
        // Optional: Show success message
        // alert('Booking status updated successfully');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update booking status';
      alert(errorMessage);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const blob = await adminAPI.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice. Invoice may not be available yet.');
    }
  };

  return (
    <MainLayout>
      <div className="admin-page">
        <div className="dashboard-header">
          <h3 style={{ color: 'white' }}>Admin Panel</h3>
          <p style={{ color: 'white' }}>Platform management and oversight</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`admin-tab ${activeTab === 'instruments' ? 'active' : ''}`}
            onClick={() => setActiveTab('instruments')}
          >
            Instruments
          </button>
          <button
            className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && activeTab === 'analytics' && analytics && (
          <div className="admin-section">
            <h3>📊 Platform Analytics</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h4>👥 Total Users</h4>
                <div className="stat-value">{analytics.users?.total || 0}</div>
              </div>
              <div className="stat-card">
                <h4>🏢 MSME Users</h4>
                <div className="stat-value">{analytics.users?.msme || 0}</div>
              </div>
              <div className="stat-card">
                <h4>🎓 Institutes</h4>
                <div className="stat-value">{analytics.users?.institute || 0}</div>
              </div>
              <div className="stat-card">
                <h4>🔬 Total Instruments</h4>
                <div className="stat-value">{analytics.instruments?.total || 0}</div>
              </div>
              <div className="stat-card">
                <h4>📅 Total Bookings</h4>
                <div className="stat-value">{analytics.bookings?.total || 0}</div>
              </div>
              <div className="stat-card">
                <h4>✅ Completed Bookings</h4>
                <div className="stat-value">{analytics.bookings?.completed || 0}</div>
              </div>
              <div className="stat-card">
                <h4>💰 Total Revenue</h4>
                <div className="stat-value">₹{analytics.revenue?.total?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-card">
                <h4>📈 Avg Booking Value</h4>
                <div className="stat-value">₹{analytics.revenue?.average?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h3>👥 User Management</h3>
            </div>
            <div className="table-container">
              <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.status === 'active' && (
                          <button
                            onClick={() => handleUserStatusUpdate(user._id, 'suspended')}
                            className="btn btn-secondary btn-small"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => handleUserStatusUpdate(user._id, 'active')}
                            className="btn btn-primary btn-small"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'instruments' && (
          <div className="admin-section">
            <div className="section-header">
              <h3>🔬 Instrument Management</h3>
            </div>
            <div className="table-container">
              <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((instrument) => (
                  <tr key={instrument._id}>
                    <td>{instrument.name}</td>
                    <td>{instrument.category}</td>
                    <td>{instrument.owner?.name}</td>
                    <td>{instrument.availability}</td>
                    <td>{instrument.featured ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleFeature(instrument._id)}
                        className="btn btn-secondary btn-small"
                      >
                        {instrument.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'bookings' && (
          <div className="admin-section">
            <div className="section-header">
              <h3>📅 Booking Management</h3>
            </div>
            
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{booking.instrumentName}</h3>
                        <p className="booking-meta">
                          <span>👤 User: {booking.user?.name}</span>
                          <span>🏢 Owner: {booking.owner?.name}</span>
                        </p>
                      </div>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="label">Dates:</span>
                        <span>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Duration:</span>
                        <span>{booking.duration?.days || 0} days</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Amount:</span>
                        <span className="amount">₹{booking.pricing.totalAmount.toLocaleString()}</span>
                      </div>
                      {booking.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span>{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'confirmed')}
                          className="btn btn-primary"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'rejected')}
                          className="btn btn-secondary"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'completed')}
                          className="btn btn-primary"
                        >
                          ✓ Mark as Completed
                        </button>
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'cancelled')}
                          className="btn btn-secondary"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}

                    {booking.invoiceId && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleDownloadInvoice(booking._id)}
                          className="btn btn-secondary"
                        >
                          📄 View Invoice
                        </button>
                      </div>
                    )}

                    {(booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'rejected') && (
                      <div className="booking-info">
                        <p className="info-text">
                          {booking.status === 'completed' && '✓ This booking has been completed'}
                          {booking.status === 'cancelled' && '✕ This booking was cancelled'}
                          {booking.status === 'rejected' && '✕ This booking was rejected'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
