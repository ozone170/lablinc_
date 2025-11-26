import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import BookingForm from '../components/booking/BookingForm';
import { instrumentsAPI } from '../api/instruments.api';
import { bookingsAPI } from '../api/bookings.api';
import { useAuth } from '../hooks/useAuth';
import './BookingPage.css';

const BookingPage = () => {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInstrument();
  }, [instrumentId]);

  const fetchInstrument = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await instrumentsAPI.getInstrument(instrumentId);
      if (response.success) {
        setInstrument(response.data.instrument);
      }
    } catch (err) {
      setError('Failed to load instrument details');
      console.error('Error fetching instrument:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingData) => {
    if (!isAuthenticated) {
      setError('Please login to create a booking');
      return;
    }

    if (user?.role !== 'msme') {
      setError('Only MSME users can create bookings');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await bookingsAPI.createBooking(bookingData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading instrument details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error && !instrument) {
    return (
      <MainLayout>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate('/equipment')} className="btn btn-primary">
            Back to Equipment
          </button>
        </div>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h2>Booking Request Created!</h2>
          <p>Your booking request has been sent to the institute for approval.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="booking-page">
        <div className="booking-container">
          <div className="instrument-details">
            <div className="instrument-header">
              <h1>{instrument.name}</h1>
              <span className="instrument-category">{instrument.category}</span>
            </div>

            {instrument.photos && instrument.photos.length > 0 && (
              <div className="instrument-image">
                <img src={instrument.photos[0]} alt={instrument.name} />
              </div>
            )}

            <div className="instrument-info">
              <h3>Description</h3>
              <p>{instrument.description}</p>

              <h3>Specifications</h3>
              {instrument.specifications && Object.keys(instrument.specifications).length > 0 ? (
                <ul className="specifications-list">
                  {Object.entries(instrument.specifications).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No specifications available</p>
              )}

              <h3>Location</h3>
              <p>{instrument.location}</p>

              <h3>Owner</h3>
              <p>{instrument.owner?.name || instrument.ownerName}</p>
              {instrument.owner?.organization && <p>{instrument.owner.organization}</p>}

              <h3>Pricing</h3>
              <div className="pricing-info">
                {instrument.pricing.hourly && (
                  <div className="price-item">
                    <span>Hourly:</span>
                    <strong>₹{instrument.pricing.hourly}</strong>
                  </div>
                )}
                {instrument.pricing.daily && (
                  <div className="price-item">
                    <span>Daily:</span>
                    <strong>₹{instrument.pricing.daily}</strong>
                  </div>
                )}
                {instrument.pricing.weekly && (
                  <div className="price-item">
                    <span>Weekly:</span>
                    <strong>₹{instrument.pricing.weekly}</strong>
                  </div>
                )}
                {instrument.pricing.monthly && (
                  <div className="price-item">
                    <span>Monthly:</span>
                    <strong>₹{instrument.pricing.monthly}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="booking-form-container">
            {!isAuthenticated ? (
              <div className="auth-required">
                <h3>Login Required</h3>
                <p>Please login to create a booking</p>
                <button onClick={() => navigate('/equipment')} className="btn btn-primary">
                  Back to Equipment
                </button>
              </div>
            ) : user?.role !== 'msme' ? (
              <div className="auth-required">
                <h3>MSME Account Required</h3>
                <p>Only MSME users can create bookings</p>
                <button onClick={() => navigate('/equipment')} className="btn btn-primary">
                  Back to Equipment
                </button>
              </div>
            ) : (
              <>
                <BookingForm
                  instrument={instrument}
                  onSubmit={handleBookingSubmit}
                  loading={submitting}
                />
                {error && <div className="form-error">{error}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
