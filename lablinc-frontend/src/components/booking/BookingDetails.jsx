import Badge from '../ui/Badge';
import BookingTimeline from './BookingTimeline';
import { useAuth } from '../../hooks/useAuth';
import { getDisplayAmount, getPricingBreakdown, formatAmount, getAmountLabel } from '../../utils/pricing';

const BookingDetails = ({ booking }) => {
  const { user } = useAuth();
  
  if (!booking) return null;

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

  return (
    <div className="booking-details">
      <div className="details-header">
        <h3>Booking Details</h3>
        <Badge variant={getStatusBadgeVariant(booking.status)}>
          {booking.status?.toUpperCase()}
        </Badge>
      </div>

      <div className="details-section">
        <h4>Booking Information</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Booking ID:</span>
            <span className="detail-value font-mono">{booking._id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {new Date(booking.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h4>Instrument Details</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{booking.instrument?.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">
              {booking.instrument?.category?.name || booking.instrument?.category}
            </span>
          </div>
          {booking.instrument?.owner && (
            <div className="detail-item">
              <span className="detail-label">Owner:</span>
              <span className="detail-value">
                {booking.instrument.owner.name || booking.instrument.owner.email}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="details-section">
        <h4>User Information</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{booking.user?.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{booking.user?.email}</span>
          </div>
          {booking.user?.phone && (
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{booking.user.phone}</span>
            </div>
          )}
          {booking.institute && (
            <div className="detail-item">
              <span className="detail-label">Institute:</span>
              <span className="detail-value">{booking.institute}</span>
            </div>
          )}
        </div>
      </div>

      <div className="details-section">
        <h4>Booking Period</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Start Date:</span>
            <span className="detail-value">
              {new Date(booking.startDate).toLocaleString()}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">End Date:</span>
            <span className="detail-value">
              {new Date(booking.endDate).toLocaleString()}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Duration:</span>
            <span className="detail-value">
              {Math.ceil(
                (new Date(booking.endDate) - new Date(booking.startDate)) / 
                (1000 * 60 * 60 * 24)
              )} days
            </span>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h4>Payment Information</h4>
        <div className="detail-grid">
          {(() => {
            const pricingBreakdown = getPricingBreakdown(booking, user);
            
            return (
              <>
                {pricingBreakdown.showBreakdown && pricingBreakdown.basePrice > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Base Price:</span>
                    <span className="detail-value">{formatAmount(pricingBreakdown.basePrice)}</span>
                  </div>
                )}
                
                {pricingBreakdown.showBreakdown && pricingBreakdown.discount > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Discount:</span>
                    <span className="detail-value text-success">-{formatAmount(pricingBreakdown.discount)}</span>
                  </div>
                )}
                
                {pricingBreakdown.showBreakdown && pricingBreakdown.tax > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Tax (GST):</span>
                    <span className="detail-value">{formatAmount(pricingBreakdown.tax)}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">{getAmountLabel(user)}:</span>
                  <span className="detail-value font-bold text-lg">
                    {formatAmount(getDisplayAmount(booking, user))}
                  </span>
                </div>
                
                {booking.pricing && (
                  <>
                    {booking.pricing.hourlyRate && (
                      <div className="detail-item">
                        <span className="detail-label">Hourly Rate:</span>
                        <span className="detail-value">₹{booking.pricing.hourlyRate}/hr</span>
                      </div>
                    )}
                    {booking.pricing.dailyRate && (
                      <div className="detail-item">
                        <span className="detail-label">Daily Rate:</span>
                        <span className="detail-value">₹{booking.pricing.dailyRate}/day</span>
                      </div>
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
        {user?.role?.toLowerCase() === 'institute' && (
          <div className="info-note" style={{ marginTop: '1rem' }}>
            <small>ℹ️ Institute users see base pricing only</small>
          </div>
        )}
      </div>

      {booking.notes && (
        <div className="details-section">
          <h4>Notes</h4>
          <p className="detail-notes">{booking.notes}</p>
        </div>
      )}

      {booking.timeline && booking.timeline.length > 0 && (
        <div className="details-section">
          <h4>Timeline</h4>
          <BookingTimeline timeline={booking.timeline} />
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
