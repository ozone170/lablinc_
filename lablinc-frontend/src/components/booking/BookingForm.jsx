import { useState } from 'react';
import './BookingForm.css';

const BookingForm = ({ instrument, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const calculatePrice = (start, end) => {
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (days <= 0) return null;

    const { pricing } = instrument;
    let rate = 0;
    let rateType = '';

    // Choose best pricing option
    if (days >= 30 && pricing.monthly) {
      rate = pricing.monthly * Math.ceil(days / 30);
      rateType = 'monthly';
    } else if (days >= 7 && pricing.weekly) {
      rate = pricing.weekly * Math.ceil(days / 7);
      rateType = 'weekly';
    } else if (pricing.daily) {
      rate = pricing.daily * days;
      rateType = 'daily';
    } else if (pricing.hourly) {
      rate = pricing.hourly * days * 24;
      rateType = 'hourly';
    }

    return { total: rate, days, rateType };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setError('');

    // Calculate price when dates change
    if (name === 'startDate' || name === 'endDate') {
      const price = calculatePrice(newFormData.startDate, newFormData.endDate);
      setEstimatedPrice(price);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date must be in the future');
      return;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    if (!estimatedPrice) {
      setError('Please select valid dates');
      return;
    }

    onSubmit({
      instrumentId: instrument._id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      notes: formData.notes,
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h3>Book this Instrument</h3>

      <div className="form-group">
        <label htmlFor="startDate">Start Date *</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          min={getTodayDate()}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date *</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          min={formData.startDate || getTodayDate()}
          required
        />
      </div>

      {estimatedPrice && (
        <div className="price-estimate">
          <div className="estimate-row">
            <span>Duration:</span>
            <strong>{estimatedPrice.days} days</strong>
          </div>
          <div className="estimate-row">
            <span>Rate Type:</span>
            <strong>{estimatedPrice.rateType}</strong>
          </div>
          <div className="estimate-row total">
            <span>Estimated Total:</span>
            <strong>₹{estimatedPrice.total.toLocaleString()}</strong>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="notes">Additional Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          placeholder="Any special requirements or notes..."
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !estimatedPrice}>
          {loading ? 'Creating Booking...' : 'Create Booking Request'}
        </button>
      </div>

      <div className="booking-note">
        <p>
          <strong>Note:</strong> Your booking request will be sent to the institute for approval.
          You will be notified once it's confirmed.
        </p>
      </div>
    </form>
  );
};

export default BookingForm;
