import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NoFooterLayout from '../../components/layout/NoFooterLayout';
import { bookingsAPI } from '../../api/bookings.api';
import { BookingDetails, InvoiceViewer } from '../../components/booking';
import { ReviewForm } from '../../components/reviews';

const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingsAPI.getBooking(id);
      setBooking(data.data || data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      alert('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <NoFooterLayout>
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </NoFooterLayout>
    );
  }

  if (!booking) {
    return (
      <NoFooterLayout>
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Booking Not Found</h2>
          <p>The booking you're looking for doesn't exist.</p>
        </div>
      </NoFooterLayout>
    );
  }

  return (
    <NoFooterLayout>
      <div className="container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <BookingDetails booking={booking} />
        
        <div style={{ marginTop: '2rem' }}>
          <InvoiceViewer bookingId={id} booking={booking} />
        </div>

        {booking.status === 'completed' && !booking.review && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
            {!showReviewForm ? (
              <div style={{ textAlign: 'center' }}>
                <h3>How was your experience?</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Share your feedback about this instrument
                </p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn btn-primary"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <div>
                <h3>Write a Review</h3>
                <ReviewForm
                  bookingId={id}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    fetchBooking();
                    alert('Thank you for your review!');
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}
          </div>
        )}

        {booking.review && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <h3>Your Review</h3>
            <div className="star-display">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`star ${star <= booking.review.rating ? 'filled' : ''}`}>
                  ★
                </span>
              ))}
            </div>
            <p style={{ marginTop: '0.5rem' }}>{booking.review.comment}</p>
          </div>
        )}
      </div>
    </NoFooterLayout>
  );
};

export default BookingDetailPage;
