import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin.api';
import '../../styles/admin.css';

const CreateBookingForm = ({ onBookingCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: '',
    instrumentId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    purpose: '',
    notes: '',
    status: 'pending'
  });
  const [users, setUsers] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchInstruments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ limit: 100 });
      let usersData = [];
      if (response?.data?.users) {
        usersData = response.data.users;
      } else if (response?.users) {
        usersData = response.users;
      } else if (Array.isArray(response?.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchInstruments = async () => {
    try {
      const response = await adminAPI.getInstruments({ limit: 100 });
      
      let instrumentsData = [];
      if (response?.data?.instruments) {
        instrumentsData = response.data.instruments;
      } else if (response?.instruments) {
        instrumentsData = response.instruments;
      } else if (Array.isArray(response?.data)) {
        instrumentsData = response.data;
      } else if (Array.isArray(response)) {
        instrumentsData = response;
      }
      
      // Filter for available instruments on frontend since backend doesn't filter by availability
      const availableInstruments = instrumentsData.filter(inst => 
        inst.availability === 'available' || inst.status === 'available'
      );
      
      setInstruments(availableInstruments);
    } catch (error) {
      console.error('Failed to fetch instruments:', error);
      setInstruments([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'instrumentId') {
      const instrument = instruments.find(inst => inst._id === value);
      setSelectedInstrument(instrument);
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId) {
      newErrors.userId = 'User is required';
    }
    
    if (!formData.instrumentId) {
      newErrors.instrumentId = 'Instrument is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAmount = () => {
    if (!selectedInstrument || !formData.startDate || !formData.endDate) {
      return 0;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const pricing = selectedInstrument.pricing || {};
    
    if (pricing.daily) {
      return pricing.daily * diffDays;
    } else if (pricing.hourly) {
      return pricing.hourly * 8 * diffDays;
    }
    
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const bookingData = {
        ...formData,
        totalAmount: calculateTotalAmount()
      };
      
      await adminAPI.createBooking(bookingData);
      
      // Reset form
      setFormData({
        userId: '',
        instrumentId: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        purpose: '',
        notes: '',
        status: 'pending'
      });
      setSelectedInstrument(null);
      setErrors({});
      
      if (onBookingCreated) {
        onBookingCreated();
      }
      
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create booking'
      });
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="inline-form-container">
      <div className="inline-form-header">
        <h3>📅 Create New Booking</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="inline-form">
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="userId">Select User *</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={errors.userId ? 'error' : ''}
            >
              <option value="">Choose User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && <span className="field-error">{errors.userId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="instrumentId">Select Instrument *</label>
            <select
              id="instrumentId"
              name="instrumentId"
              value={formData.instrumentId}
              onChange={handleChange}
              className={errors.instrumentId ? 'error' : ''}
            >
              <option value="">Choose Instrument</option>
              {instruments.map((instrument) => (
                <option key={instrument._id} value={instrument._id}>
                  {instrument.name} - {instrument.category}
                </option>
              ))}
            </select>
            {errors.instrumentId && <span className="field-error">{errors.instrumentId}</span>}
          </div>
        </div>

        {selectedInstrument && (
          <div className="instrument-info">
            <h4>📋 Instrument Details</h4>
            <div className="info-grid">
              <div><strong>Name:</strong> {selectedInstrument.name}</div>
              <div><strong>Category:</strong> {selectedInstrument.category}</div>
              <div><strong>Location:</strong> {selectedInstrument.location}</div>
              <div><strong>Pricing:</strong> 
                {selectedInstrument.pricing?.hourly && ` ₹${selectedInstrument.pricing.hourly}/hr`}
                {selectedInstrument.pricing?.daily && ` ₹${selectedInstrument.pricing.daily}/day`}
              </div>
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={errors.startDate ? 'error' : ''}
              min={minDate}
            />
            {errors.startDate && <span className="field-error">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={errors.endDate ? 'error' : ''}
              min={formData.startDate || minDate}
            />
            {errors.endDate && <span className="field-error">{errors.endDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose *</label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className={errors.purpose ? 'error' : ''}
            placeholder="Enter the purpose of booking"
            rows="2"
          />
          {errors.purpose && <span className="field-error">{errors.purpose}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes or requirements"
              rows="2"
            />
          </div>

          {selectedInstrument && formData.startDate && formData.endDate && (
            <div className="form-group">
              <label>Estimated Total</label>
              <div className="total-amount">
                ₹{calculateTotalAmount().toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Creating...' : '✅ Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBookingForm;