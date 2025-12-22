import { Link } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { getDisplayAmount, formatAmount, getAmountLabel } from '../../utils/pricing';

const BookingCard = ({ booking, onCancel, showActions = true }) => {
  const { user } = useAuth();
  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="booking-card" hoverable>
      <CardBody>
        <div className="booking-header">
          <h3>{booking.instrumentName}</h3>
          <Badge variant={getStatusVariant(booking.status)}>
            {booking.status}
          </Badge>
        </div>

        <div className="booking-details">
          <p>
            <strong>Booking ID:</strong> {booking._id?.slice(-8)}
          </p>
          <p>
            <strong>Duration:</strong> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
          </p>
          <p>
            <strong>{getAmountLabel(user)}:</strong> {formatAmount(getDisplayAmount(booking, user))}
          </p>
          {booking.userName && (
            <p>
              <strong>Booked by:</strong> {booking.userName}
            </p>
          )}
        </div>
      </CardBody>

      {showActions && (
        <CardFooter>
          <div className="booking-actions">
            <Link to={`/bookings/${booking._id}`} className="btn btn-sm btn-primary">
              View Details
            </Link>
            {booking.status === 'pending' && onCancel && (
              <button 
                onClick={() => onCancel(booking._id)} 
                className="btn btn-sm btn-danger"
              >
                Cancel
              </button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default BookingCard;
