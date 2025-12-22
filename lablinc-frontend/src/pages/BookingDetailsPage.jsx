import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { adminAPI } from '../api/admin.api';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { getDisplayAmount, getPricingBreakdown, formatAmount, getAmountLabel } from '../utils/pricing';
import '../styles/admin.css';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBookings({ limit: 1000 });
      const bookingsData = Array.isArray(response?.data?.bookings) 
        ? response.data.bookings 
        : Array.isArray(response?.data) 
        ? response.data 
        : [];
      
      const foundBooking = bookingsData.find(b => b._id === id);
      setBooking(foundBooking);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await adminAPI.updateBookingStatus(id, newStatus);
      fetchBookingDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const blob = await adminAPI.downloadInvoice(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      active: 'primary',
      completed: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div className="loading-spinner">⏳</div>
          <div>Loading booking details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div>Booking not found</div>
          <button onClick={() => navigate('/admin?tab=bookings')} className="btn btn-primary">
            Back to Bookings
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="booking-details-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button 
              onClick={() => navigate('/admin?tab=bookings')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Bookings
            </button>
            <h1 style={{ margin: 0 }}>Booking Details - {booking._id?.slice(-8) || 'N/A'}</h1>
          </div>
          <Badge variant={getStatusBadgeVariant(booking.status)}>
            {booking.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        <div className="booking-details">
          {/* Booking Information Section */}
          <div className="detail-section">
            <h4 className="section-title">📋 Booking Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Booking ID:</span>
              <span className="font-mono">{booking._id || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <Badge variant={getStatusBadgeVariant(booking.status)}>
                {booking.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span>{booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>

          {/* Instrument Information Section */}
          <div className="detail-section">
            <h4 className="section-title">🔬 Instrument Details</h4>
            
            <div className="detail-row">
              <span className="detail-label">Instrument:</span>
              <span className="font-semibold">{booking.instrument?.name || 'N/A'}</span>
            </div>
            
            {booking.instrument?.category && (
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span>{booking.instrument.category?.name || booking.instrument.category}</span>
              </div>
            )}
            
            {booking.instrument?.model && (
              <div className="detail-row">
                <span className="detail-label">Model:</span>
                <span>{booking.instrument.model}</span>
              </div>
            )}
          </div>

          {/* User Information Section */}
          <div className="detail-section">
            <h4 className="section-title">👤 User Details</h4>
            
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span>{booking.user?.name || 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span>{booking.user?.email || 'N/A'}</span>
            </div>
            
            {booking.user?.phone && (
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span>{booking.user.phone}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label">Institute:</span>
              <span>{booking.institute || booking.user?.institute || 'N/A'}</span>
            </div>
          </div>

          {/* Booking Period Section */}
          <div className="detail-section">
            <h4 className="section-title">📅 Booking Period</h4>
            
            <div className="detail-row">
              <span className="detail-label">Start Date:</span>
              <span className="font-semibold">{booking.startDate ? new Date(booking.startDate).toLocaleString() : 'N/A'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">End Date:</span>
              <span className="font-semibold">{booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'}</span>
            </div>
            
            {booking.startDate && booking.endDate && (
              <div className="detail-row">
                <span className="detail-label">Duration:</span>
                <span>
                  {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            )}
          </div>

          {/* Payment Information Section */}
          <div className="detail-section highlight-section">
            <h4 className="section-title">💰 Payment Details</h4>
            
            {(() => {
              const pricingBreakdown = getPricingBreakdown(booking, user);
              
              return (
                <>
                  {pricingBreakdown.showBreakdown && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Base Price:</span>
                        <span>{formatAmount(pricingBreakdown.basePrice)}</span>
                      </div>
                      
                      {pricingBreakdown.securityDeposit > 0 && (
                        <div className="detail-row">
                          <span className="detail-label">Security Deposit (10%):</span>
                          <span>{formatAmount(pricingBreakdown.securityDeposit)}</span>
                        </div>
                      )}
                      
                      {pricingBreakdown.gst > 0 && (
                        <div className="detail-row">
                          <span className="detail-label">GST (18%):</span>
                          <span>{formatAmount(pricingBreakdown.gst)}</span>
                        </div>
                      )}
                      
                      {pricingBreakdown.discount > 0 && (
                        <div className="detail-row">
                          <span className="detail-label">Discount:</span>
                          <span className="text-success">-{formatAmount(pricingBreakdown.discount)}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="detail-row total-amount">
                    <span className="detail-label">{getAmountLabel(user)}:</span>
                    <span className="amount-value">{formatAmount(getDisplayAmount(booking, user))}</span>
                  </div>
                  
                  {!pricingBreakdown.showBreakdown && user?.role?.toLowerCase() === 'institute' && (
                    <div className="info-note">
                      <small>ℹ️ Institute users see base pricing only</small>
                    </div>
                  )}
                </>
              );
            })()}
            
            {booking.paymentStatus && (
              <div className="detail-row">
                <span className="detail-label">Payment Status:</span>
                <Badge variant={booking.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {booking.paymentStatus?.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {booking.notes && (
            <div className="detail-section">
              <h4 className="section-title">📝 Notes</h4>
              <div className="notes-content">
                {booking.notes}
              </div>
            </div>
          )}
          
          {booking.purpose && (
            <div className="detail-section">
              <h4 className="section-title">🎯 Purpose</h4>
              <div className="notes-content">
                {booking.purpose}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="modal-actions">
            {booking.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('confirmed')}
                className="btn btn-success"
              >
                ✅ Confirm Booking
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={() => handleStatusChange('active')}
                className="btn btn-primary"
              >
                ▶️ Mark Active
              </button>
            )}
            {booking.status === 'active' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="btn btn-success"
              >
                ✔️ Mark Completed
              </button>
            )}
            <button
              onClick={handleDownloadInvoice}
              className="btn btn-secondary"
            >
              📥 Download Invoice
            </button>
            <button
              onClick={() => navigate('/admin?tab=bookings')}
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

export default BookingDetailsPage;
