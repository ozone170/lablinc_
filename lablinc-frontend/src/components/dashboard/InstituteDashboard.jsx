import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api/bookings.api';
import { instrumentsAPI } from '../../api/instruments.api';
import './InstituteDashboard.css';

const InstituteDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [newInstrument, setNewInstrument] = useState({
    name: '',
    category: '',
    description: '',
    pricing: { daily: '', weekly: '', monthly: '' },
    photos: [''],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookingsRes, instrumentsRes] = await Promise.all([
        bookingsAPI.getMyBookings(),
        instrumentsAPI.getInstruments({ limit: 100 }),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data.bookings);
      }
      if (instrumentsRes.success) {
        setInstruments(instrumentsRes.data.instruments);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await bookingsAPI.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b._id === bookingId ? { ...b, status: newStatus } : b
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteInstrument = async (instrumentId) => {
    if (!window.confirm('Are you sure you want to delete this instrument?')) {
      return;
    }

    try {
      await instrumentsAPI.deleteInstrument(instrumentId);
      setInstruments(instruments.filter(i => i._id !== instrumentId));
    } catch (err) {
      console.error('Error deleting instrument:', err);
      alert('Failed to delete instrument');
    }
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();
    
    try {
      const response = await instrumentsAPI.createInstrument(newInstrument);
      if (response.success) {
        setInstruments([...instruments, response.data]);
        setShowAddInstrument(false);
        setNewInstrument({
          name: '',
          category: '',
          description: '',
          pricing: { daily: '', weekly: '', monthly: '' },
          photos: [''],
        });
      }
    } catch (err) {
      console.error('Error adding instrument:', err);
      alert('Failed to add instrument');
    }
  };

  const calculateStats = () => {
    const activeBookings = bookings.filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    ).length;
    
    // For institutes, show base amount only (without GST and security deposit)
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.pricing?.baseAmount || b.pricing?.totalAmount || 0), 0);

    return { activeBookings, totalEarnings };
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

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="institute-dashboard">
      <div className="dashboard-header">
        <h3 style={{ color: 'black' }}>Institute Dashboard</h3>
        <p style={{ color: 'black' }}>Manage your instruments and bookings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings ({bookings.length})
        </button>
        <button
          className={`tab ${activeTab === 'instruments' ? 'active' : ''}`}
          onClick={() => setActiveTab('instruments')}
        >
          My Instruments ({instruments.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>💰 Total Earnings</h4>
              <div className="stat-value">₹{stats.totalEarnings.toLocaleString()}</div>
              <p className="stat-label">From completed bookings</p>
            </div>
            <div className="stat-card">
              <h4>📅 Active Bookings</h4>
              <div className="stat-value">{stats.activeBookings}</div>
              <p className="stat-label">Pending & confirmed</p>
            </div>
            <div className="stat-card">
              <h4>🔬 Total Instruments</h4>
              <div className="stat-value">{instruments.length}</div>
              <p className="stat-label">Listed equipment</p>
            </div>
            <div className="stat-card">
              <h4>✅ Completed</h4>
              <div className="stat-value">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <p className="stat-label">Successfully completed</p>
            </div>
          </div>

          <div className="recent-section">
            <h3>Recent Bookings</h3>
            {bookings.slice(0, 3).length === 0 ? (
              <div className="empty-state">
                <p>No recent bookings</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.slice(0, 3).map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  return (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-header">
                        <div>
                          <h3>{booking.instrumentName}</h3>
                          <p className="booking-user">Booked by: {booking.userName}</p>
                        </div>
                        <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                      </div>
                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="label">Dates:</span>
                          <span>
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Amount:</span>
                          <span className="amount">₹{(booking.pricing.baseAmount || booking.pricing.totalAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bookings-section">
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => {
                const badge = getStatusBadge(booking.status);
                return (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{booking.instrumentName}</h3>
                        <p className="booking-user">Booked by: {booking.userName}</p>
                      </div>
                      <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span className="label">Dates:</span>
                        <span>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Duration:</span>
                        <span>{booking.duration.days} days</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Amount:</span>
                        <span className="amount">₹{(booking.pricing.baseAmount || booking.pricing.totalAmount).toLocaleString()}</span>
                      </div>
                      {booking.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span>{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="btn btn-primary"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                          className="btn btn-secondary"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="booking-actions">
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="btn btn-primary"
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'instruments' && (
        <div className="instruments-section">
          <div className="section-header">
            <h3>My Instruments</h3>
            <button
              onClick={() => setShowAddInstrument(!showAddInstrument)}
              className="btn btn-primary"
            >
              {showAddInstrument ? '✕ Cancel' : '+ Add Instrument'}
            </button>
          </div>

          {showAddInstrument && (
            <div className="add-instrument-form">
              <h4>Add New Instrument</h4>
              <form onSubmit={handleAddInstrument}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Instrument Name *</label>
                    <input
                      type="text"
                      value={newInstrument.name}
                      onChange={(e) => setNewInstrument({...newInstrument, name: e.target.value})}
                      required
                      placeholder="e.g., CNC Lathe Machine"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newInstrument.category}
                      onChange={(e) => setNewInstrument({...newInstrument, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="CNC Machines">CNC Machines</option>
                      <option value="3D Printers">3D Printers</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Material Testing">Material Testing</option>
                      <option value="GPU Workstations">GPU Workstations</option>
                      <option value="AI Servers">AI Servers</option>
                      <option value="Civil">Civil</option>
                      <option value="Environmental">Environmental</option>
                      <option value="Prototyping">Prototyping</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newInstrument.description}
                    onChange={(e) => setNewInstrument({...newInstrument, description: e.target.value})}
                    placeholder="Brief description of the instrument"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={newInstrument.photos[0]}
                    onChange={(e) => setNewInstrument({
                      ...newInstrument,
                      photos: [e.target.value]
                    })}
                    placeholder="https://example.com/image.jpg"
                  />
                  <small className="form-hint">Enter a direct link to an image of the instrument</small>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Daily Rate (₹) *</label>
                    <input
                      type="number"
                      value={newInstrument.pricing.daily}
                      onChange={(e) => setNewInstrument({
                        ...newInstrument,
                        pricing: {...newInstrument.pricing, daily: e.target.value}
                      })}
                      required
                      placeholder="1000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Weekly Rate (₹)</label>
                    <input
                      type="number"
                      value={newInstrument.pricing.weekly}
                      onChange={(e) => setNewInstrument({
                        ...newInstrument,
                        pricing: {...newInstrument.pricing, weekly: e.target.value}
                      })}
                      placeholder="6000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Rate (₹)</label>
                    <input
                      type="number"
                      value={newInstrument.pricing.monthly}
                      onChange={(e) => setNewInstrument({
                        ...newInstrument,
                        pricing: {...newInstrument.pricing, monthly: e.target.value}
                      })}
                      placeholder="20000"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Add Instrument
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddInstrument(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {instruments.length === 0 ? (
            <div className="empty-state">
              <p>No instruments added yet</p>
              <button
                onClick={() => setShowAddInstrument(true)}
                className="btn btn-primary"
              >
                Add Your First Instrument
              </button>
            </div>
          ) : (
            <div className="instruments-grid">
              {instruments.map((instrument) => (
                <div key={instrument._id} className="instrument-card">
                  {instrument.photos && instrument.photos.length > 0 && instrument.photos[0] ? (
                    <div className="instrument-image">
                      <img 
                        src={instrument.photos[0]} 
                        alt={instrument.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="instrument-image-placeholder" style={{ display: 'none' }}>
                        <span className="placeholder-icon">🔬</span>
                      </div>
                    </div>
                  ) : (
                    <div className="instrument-image">
                      <div className="instrument-image-placeholder">
                        <span className="placeholder-icon">🔬</span>
                      </div>
                    </div>
                  )}
                  <div className="instrument-card-content">
                    <div className="instrument-card-header">
                      <h3>{instrument.name}</h3>
                      <button
                        onClick={() => handleDeleteInstrument(instrument._id)}
                        className="btn-delete"
                        title="Delete instrument"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="instrument-category">{instrument.category}</p>
                    {instrument.description && (
                      <p className="instrument-description">{instrument.description}</p>
                    )}
                    <div className="instrument-info">
                      <span className={`availability ${instrument.availability}`}>
                        {instrument.availability}
                      </span>
                      {instrument.pricing.daily && (
                        <span className="price">₹{instrument.pricing.daily}/day</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;
