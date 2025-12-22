import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instrumentsAPI } from '../api/instruments.api';
import { useAuth } from '../hooks/useAuth';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import './InstrumentDetailsPage.css';

const InstrumentDetailsPage = () => {
  const { instrumentId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInstrument();
  }, [instrumentId]);

  const fetchInstrument = async () => {
    try {
      setLoading(true);
      const response = await instrumentsAPI.getInstrument(instrumentId);
      setInstrument(response.data.instrument);
    } catch (err) {
      setError('Failed to load instrument details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      alert('Please login to book this instrument');
      return;
    }

    if (user?.role !== 'msme') {
      alert('Only MSME users can book instruments');
      return;
    }

    navigate(`/booking/${instrumentId}`);
  };

  if (loading) {
    return (
      <NoFooterLayout>
        <div className="instrument-details-loading">Loading...</div>
      </NoFooterLayout>
    );
  }

  if (error || !instrument) {
    return (
      <NoFooterLayout>
        <div className="instrument-details-error">{error || 'Instrument not found'}</div>
      </NoFooterLayout>
    );
  }

  const { name, category, description, pricing, availability, ownerName, location, photos, specifications } = instrument;

  return (
    <NoFooterLayout>
      <div className="instrument-details-page">
        <div className="instrument-details-container">
          <div className="instrument-images">
            {photos && photos.length > 0 ? (
              <img src={photos[0]} alt={name} className="main-image" />
            ) : (
              <div className="image-placeholder">🔬</div>
            )}
          </div>

          <div className="instrument-info">
            <div className="instrument-header">
              <div>
                <span className="instrument-category">{category}</span>
                <h1 className="instrument-title">{name}</h1>
                <p className="instrument-owner">Provided by: {ownerName}</p>
                {location && <p className="instrument-location">📍 {location}</p>}
              </div>
              <div className={`availability-status ${availability}`}>
                {availability === 'available' && '✓ Available'}
                {availability === 'booked' && '⏳ Booked'}
                {availability === 'maintenance' && '🔧 Maintenance'}
                {availability === 'unavailable' && '✕ Unavailable'}
              </div>
            </div>

            <div className="instrument-description">
              <h2>Description</h2>
              <p>{description}</p>
            </div>

            {specifications && (
              <div className="instrument-specifications">
                <h2>Specifications</h2>
                {typeof specifications === 'string' ? (
                  <p>{specifications}</p>
                ) : (
                  <div className="specifications-list">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">{key}:</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="instrument-pricing">
              <h2>Pricing</h2>
              <div className="pricing-grid">
                {pricing?.hourly && (
                  <div className="pricing-item">
                    <span className="pricing-label">Hourly</span>
                    <span className="pricing-value">₹{pricing.hourly}/hour</span>
                  </div>
                )}
                {pricing?.daily && (
                  <div className="pricing-item">
                    <span className="pricing-label">Daily</span>
                    <span className="pricing-value">₹{pricing.daily}/day</span>
                  </div>
                )}
                {pricing?.weekly && (
                  <div className="pricing-item">
                    <span className="pricing-label">Weekly</span>
                    <span className="pricing-value">₹{pricing.weekly}/week</span>
                  </div>
                )}
                {pricing?.monthly && (
                  <div className="pricing-item">
                    <span className="pricing-label">Monthly</span>
                    <span className="pricing-value">₹{pricing.monthly}/month</span>
                  </div>
                )}
              </div>
            </div>

            <div className="instrument-actions">
              <button
                onClick={handleBookNow}
                className="btn btn-primary btn-large"
                disabled={availability !== 'available'}
              >
                {availability === 'available' ? 'Book Now' : 'Not Available'}
              </button>
              <button onClick={() => navigate('/equipment')} className="btn btn-secondary">
                Back to Equipment
              </button>
            </div>
          </div>
        </div>
      </div>
    </NoFooterLayout>
  );
};

export default InstrumentDetailsPage;
