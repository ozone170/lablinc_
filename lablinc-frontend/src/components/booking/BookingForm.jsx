import { useState } from 'react';
import './BookingForm.css';

const BookingForm = ({ instrument, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    notes: '',
  });
  const [error, setError] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  const calculatePrice = (startDate, startTime, endDate, endTime) => {
    if (!startDate || !endDate || !startTime || !endTime) return null;

    // Combine date and time
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    // Calculate total hours
    const totalMilliseconds = end - start;
    if (totalMilliseconds <= 0) return null;

    const totalHours = totalMilliseconds / (1000 * 60 * 60);
    const totalDays = totalMilliseconds / (1000 * 60 * 60 * 24);

    const { pricing } = instrument;
    let rate = 0;
    let rateType = '';
    let duration = '';

    // Choose best pricing option based on duration
    if (totalDays >= 30 && pricing.monthly) {
      const months = Math.ceil(totalDays / 30);
      rate = pricing.monthly * months;
      rateType = 'monthly';
      duration = `${months} month${months > 1 ? 's' : ''}`;
    } else if (totalDays >= 7 && pricing.weekly) {
      const weeks = Math.ceil(totalDays / 7);
      rate = pricing.weekly * weeks;
      rateType = 'weekly';
      duration = `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (totalDays >= 1 && pricing.daily) {
      const days = Math.ceil(totalDays);
      rate = pricing.daily * days;
      rateType = 'daily';
      duration = `${days} day${days > 1 ? 's' : ''}`;
    } else if (pricing.hourly) {
      // For less than a day, use hourly rate
      const hours = Math.ceil(totalHours);
      rate = pricing.hourly * hours;
      rateType = 'hourly';
      duration = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (pricing.daily) {
      // Fallback to daily if no hourly rate
      const days = Math.ceil(totalDays);
      rate = pricing.daily * days;
      rateType = 'daily';
      duration = `${days} day${days > 1 ? 's' : ''}`;
    }

    // Calculate fees
    const baseAmount = rate;
    const securityFee = Math.round(baseAmount * 0.10); // 10% security fee
    const gst = Math.round(baseAmount * 0.18); // 18% GST
    const totalAmount = baseAmount + securityFee + gst;

    return { 
      baseAmount,
      securityFee,
      gst,
      total: totalAmount,
      duration, 
      rateType,
      hours: Math.ceil(totalHours),
      days: Math.ceil(totalDays)
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setError('');

    // Calculate price when dates or times change
    if (name === 'startDate' || name === 'endDate' || name === 'startTime' || name === 'endTime') {
      const price = calculatePrice(
        newFormData.startDate,
        newFormData.startTime,
        newFormData.endDate,
        newFormData.endTime
      );
      setEstimatedPrice(price);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Combine date and time for validation
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();

    if (start < now) {
      setError('Start date and time must be in the future');
      return;
    }

    if (end <= start) {
      setError('End date and time must be after start date and time');
      return;
    }

    // Check minimum duration (1 hour)
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours < 1) {
      setError('Minimum booking duration is 1 hour');
      return;
    }

    if (!estimatedPrice) {
      setError('Please select valid dates and times');
      return;
    }

    // Combine date and time
    const startDateTime = `${formData.startDate}T${formData.startTime}`;
    const endDateTime = `${formData.endDate}T${formData.endTime}`;

    onSubmit({
      instrumentId: instrument._id,
      startDate: startDateTime,
      endDate: endDateTime,
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

      <div className="form-row">
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
          <label htmlFor="startTime">Start Time *</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
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

        <div className="form-group">
          <label htmlFor="endTime">End Time *</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {estimatedPrice && (
        <div className="price-estimate">
          <div className="estimate-row">
            <span>Duration:</span>
            <strong>{estimatedPrice.duration}</strong>
          </div>
          <div className="estimate-row">
            <span>Rate Type:</span>
            <strong>{estimatedPrice.rateType}</strong>
          </div>
          {estimatedPrice.hours < 24 && (
            <div className="estimate-row">
              <span>Total Hours:</span>
              <strong>{estimatedPrice.hours} hour{estimatedPrice.hours > 1 ? 's' : ''}</strong>
            </div>
          )}
          <div className="estimate-row">
            <span>Base Amount:</span>
            <strong>₹{estimatedPrice.baseAmount.toLocaleString()}</strong>
          </div>
          <div className="estimate-row">
            <span>Security Fee (10%):</span>
            <strong>₹{estimatedPrice.securityFee.toLocaleString()}</strong>
          </div>
          <div className="estimate-row">
            <span>GST (18%):</span>
            <strong>₹{estimatedPrice.gst.toLocaleString()}</strong>
          </div>
          <div className="estimate-row total">
            <span>Total Amount:</span>
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
