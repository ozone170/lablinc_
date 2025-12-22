import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { adminAPI } from '../api/admin.api';
import Badge from '../components/ui/Badge';
import '../styles/admin.css';

const InstrumentDetailsAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstrumentDetails();
  }, [id]);

  const fetchInstrumentDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getInstruments({ limit: 1000 });
      const instrumentsData = Array.isArray(response?.data?.instruments) 
        ? response.data.instruments 
        : Array.isArray(response?.data) 
        ? response.data 
        : [];
      
      const foundInstrument = instrumentsData.find(i => i._id === id);
      setInstrument(foundInstrument);
    } catch (error) {
      console.error('Failed to fetch instrument:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async () => {
    try {
      await adminAPI.toggleInstrumentFeature(id);
      fetchInstrumentDetails();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      alert('Failed to update instrument');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this instrument?')) return;
    
    try {
      await adminAPI.deleteInstrument(id);
      navigate('/admin?tab=instruments');
    } catch (error) {
      console.error('Failed to delete instrument:', error);
      alert('Failed to delete instrument');
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      available: 'success',
      booked: 'warning',
      maintenance: 'danger',
      unavailable: 'default',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div className="loading-spinner">⏳</div>
          <div>Loading instrument details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!instrument) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div>Instrument not found</div>
          <button onClick={() => navigate('/admin?tab=instruments')} className="btn btn-primary">
            Back to Instruments
          </button>
        </div>
      </AdminLayout>
    );
  }

  const isFeatured = instrument.featured || instrument.isFeatured;

  return (
    <AdminLayout>
      <div className="instrument-details-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button 
              onClick={() => navigate('/admin?tab=instruments')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Instruments
            </button>
            <h1 style={{ margin: 0 }}>Instrument Details - {instrument.name}</h1>
          </div>
          <Badge variant={getStatusBadgeVariant(instrument.status)}>
            {instrument.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        <div className="instrument-details">
          {instrument.photos && instrument.photos.length > 0 && (
            <div className="detail-section">
              <h4 className="section-title">📷 Photos</h4>
              <div className="detail-photos" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {instrument.photos.map((photo, idx) => (
                  <img 
                    key={idx}
                    src={photo} 
                    alt={`${instrument.name} ${idx + 1}`}
                    style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4 className="section-title">🔬 Basic Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="font-semibold">{instrument.name}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span>{instrument.description}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span>{instrument.category?.name || instrument.category}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <Badge variant={getStatusBadgeVariant(instrument.status)}>
                {instrument.status?.toUpperCase()}
              </Badge>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Featured:</span>
              <Badge variant={isFeatured ? 'primary' : 'default'}>
                {isFeatured ? 'YES' : 'NO'}
              </Badge>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">👤 Owner Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Owner:</span>
              <span>{instrument.owner?.name || instrument.owner?.email || '-'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span>{instrument.location?.address || instrument.location || '-'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-title">💰 Pricing</h4>
            
            <div className="detail-row">
              <span className="detail-label">Hourly Rate:</span>
              <span>₹{instrument.pricing?.hourly || instrument.pricing?.hourlyRate || 0}/hr</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Daily Rate:</span>
              <span>₹{instrument.pricing?.daily || instrument.pricing?.dailyRate || 0}/day</span>
            </div>
            
            {instrument.pricing?.weekly && (
              <div className="detail-row">
                <span className="detail-label">Weekly Rate:</span>
                <span>₹{instrument.pricing.weekly}/week</span>
              </div>
            )}
            
            {instrument.pricing?.monthly && (
              <div className="detail-row">
                <span className="detail-label">Monthly Rate:</span>
                <span>₹{instrument.pricing.monthly}/month</span>
              </div>
            )}
          </div>

          {instrument.specifications && Object.keys(instrument.specifications).length > 0 && (
            <div className="detail-section">
              <h4 className="section-title">⚙️ Specifications</h4>
              {Object.entries(instrument.specifications).map(([key, value]) => (
                <div key={key} className="detail-row">
                  <span className="detail-label">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              onClick={handleToggleFeature}
              className={`btn ${isFeatured ? 'btn-warning' : 'btn-primary'}`}
            >
              {isFeatured ? '⭐ Unfeature' : '⭐ Feature'}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              🗑️ Delete Instrument
            </button>
            <button
              onClick={() => navigate('/admin?tab=instruments')}
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

export default InstrumentDetailsAdminPage;
