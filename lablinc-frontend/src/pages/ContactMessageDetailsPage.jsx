import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { adminAPI } from '../api/admin.api';
import Badge from '../components/ui/Badge';
import '../styles/admin.css';

const ContactMessageDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessageDetails();
  }, [id]);

  const fetchMessageDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContactMessages({ limit: 1000 });
      const messagesData = Array.isArray(response?.data?.messages) 
        ? response.data.messages 
        : Array.isArray(response?.data) 
        ? response.data 
        : [];
      
      const foundMessage = messagesData.find(m => m._id === id);
      setMessage(foundMessage);
    } catch (error) {
      console.error('Failed to fetch message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await adminAPI.updateContactMessage(id, { status: newStatus });
      await fetchMessageDetails();
      alert(`Message marked as ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update message status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      new: 'primary',
      read: 'info',
      responded: 'success',
      archived: 'default',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div className="loading-spinner">⏳</div>
          <div>Loading message details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!message) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div>Message not found</div>
          <button onClick={() => navigate('/admin?tab=messages')} className="btn btn-primary">
            Back to Messages
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="message-details-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button 
              onClick={() => navigate('/admin?tab=messages')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Messages
            </button>
            <h1 style={{ margin: 0 }}>Contact Message Details</h1>
          </div>
          <Badge variant={getStatusBadgeVariant(message.status)}>
            {message.status?.toUpperCase() || 'NEW'}
          </Badge>
        </div>

        <div className="message-details">
          {/* Sender Information */}
          <div className="detail-section">
            <h4 className="section-title">👤 Sender Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="font-semibold">{message.name}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <a href={`mailto:${message.email}`} style={{ color: '#4f46e5' }}>
                {message.email}
              </a>
            </div>
            
            {message.phone && (
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <a href={`tel:${message.phone}`} style={{ color: '#4f46e5' }}>
                  {message.phone}
                </a>
              </div>
            )}
            
            {message.organization && (
              <div className="detail-row">
                <span className="detail-label">Organization:</span>
                <span>{message.organization}</span>
              </div>
            )}
          </div>

          {/* Message Details */}
          <div className="detail-section">
            <h4 className="section-title">📋 Message Details</h4>
            
            {message.subject && (
              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span className="font-semibold">{message.subject}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <Badge variant={getStatusBadgeVariant(message.status)}>
                {message.status?.toUpperCase() || 'NEW'}
              </Badge>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Received:</span>
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
            
            {message.updatedAt && message.updatedAt !== message.createdAt && (
              <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span>{new Date(message.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="detail-section highlight-section">
            <h4 className="section-title">💬 Message</h4>
            <div className="notes-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {message.message}
            </div>
          </div>

          {/* Admin Notes */}
          {message.adminNotes && (
            <div className="detail-section">
              <h4 className="section-title">📝 Admin Notes</h4>
              <div className="notes-content">
                {message.adminNotes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            {message.status === 'new' && (
              <button
                onClick={() => handleStatusUpdate('read')}
                className="btn btn-primary"
                disabled={updating}
              >
                👁️ Mark as Read
              </button>
            )}
            {(message.status === 'new' || message.status === 'read') && (
              <button
                onClick={() => handleStatusUpdate('responded')}
                className="btn btn-success"
                disabled={updating}
              >
                ✅ Mark as Responded
              </button>
            )}
            <button
              onClick={() => handleStatusUpdate('archived')}
              className="btn btn-secondary"
              disabled={updating}
            >
              📦 Archive
            </button>
            <button
              onClick={() => navigate('/admin?tab=messages')}
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

export default ContactMessageDetailsPage;
