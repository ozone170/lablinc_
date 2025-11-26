import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api/bookings.api';
import { instrumentsAPI } from '../../api/instruments.api';
import './InstituteDashboard.css';

const InstituteDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookingsRes, instrumentsRes] = await Promise.all([
        bookingsAPI.getMyBookings(),
        instrumentsAPI.getInstruments({ limit: 100 }),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data.bookings);
      }
      if (instrumentsRes.success) {
        setInstruments(instrumentsRes.data.instruments);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await bookingsAPI.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b._id === bookingId ? { ...b, status: newStatus } : b
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update booking status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'status-pending' },
      confirmed: { text: 'Confirmed', class: 'status-confirmed' },
      completed: { text: 'Completed', class: 'status-completed' },
      cancelled: { text: 'Cancelled', class: 'status-cancelled' },
      rejected: { text: 'Rejected', class: 'status-rejected' },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="institute-dashboard">
      <div className="dashboard-header">
        <h2>Institute Dashboard</h2>
        <p>Manage your instruments and bookings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings ({bookings.length})
        </button>
        <button
          className={`tab ${activeTab === 'instruments' ? 'active' : ''}`}
          onClick={() => setActiveTab('instruments')}
        >
          My Instruments ({instruments.length})
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="bookings-section">
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                const badge = getStatusBadge(booking.status);
                return (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{booking.instrumentName}</h3>
                        <p className="booking-user">Booked by: {booking.userName}</p>
                      </div>
                      <span className={`status-badge ${badge.class}`}>{badge.text}</span>
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
                        <span>{booking.duration.days} days</span>
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
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="btn btn-primary"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                          className="btn btn-secondary"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="btn btn-primary"
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'instruments' && (
        <div className="instruments-section">
          {instruments.length === 0 ? (
            <div className="empty-state">
              <p>No instruments added yet</p>
            </div>
          ) : (
            <div className="instruments-grid">
              {instruments.map((instrument) => (
                <div key={instrument._id} className="instrument-card">
                  <h3>{instrument.name}</h3>
                  <p className="instrument-category">{instrument.category}</p>
                  <div className="instrument-info">
                    <span className={`availability ${instrument.availability}`}>
                      {instrument.availability}
                    </span>
                    {instrument.pricing.daily && (
                      <span className="price">₹{instrument.pricing.daily}/day</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;
