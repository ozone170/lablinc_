import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api/bookings.api';
import './MsmeDashboard.css';

const MsmeDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await bookingsAPI.getMyBookings();
      if (response.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const blob = await bookingsAPI.downloadInvoice(bookingId);
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
      alert('Failed to download invoice');
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
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="msme-dashboard">
      <div className="dashboard-header">
        <h3 style={{ color: 'black' }}>My Bookings</h3>
        <p style={{ color: 'black' }}>View and manage your equipment bookings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>You haven't made any bookings yet</p>
          <a href="/equipment" className="btn btn-primary">
            Browse Equipment
          </a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const badge = getStatusBadge(booking.status);
            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.instrumentName}</h3>
                  <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Owner:</span>
                    <span>{booking.ownerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span>{booking.duration.days} days</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="amount">₹{booking.pricing.totalAmount.toLocaleString()}</span>
                  </div>
                  {booking.notes && (
                    <div className="detail-row">
                      <span className="label">Notes:</span>
                      <span>{booking.notes}</span>
                    </div>
                  )}
                </div>

                <div className="booking-actions">
                  {booking.invoiceId && (
                    <button
                      onClick={() => handleDownloadInvoice(booking._id)}
                      className="btn btn-secondary"
                    >
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MsmeDashboard;
