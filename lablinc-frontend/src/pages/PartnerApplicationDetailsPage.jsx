import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { adminAPI } from '../api/admin.api';
import Badge from '../components/ui/Badge';
import '../styles/admin.css';

const PartnerApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPartnerApplications({ limit: 1000 });
      const applicationsData = Array.isArray(response?.data?.applications) 
        ? response.data.applications 
        : Array.isArray(response?.data) 
        ? response.data 
        : [];
      
      const foundApplication = applicationsData.find(a => a._id === id);
      setApplication(foundApplication);
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await adminAPI.updatePartnerApplication(id, { status: newStatus });
      await fetchApplicationDetails();
      alert(`Application ${newStatus} successfully`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div className="loading-spinner">⏳</div>
          <div>Loading application details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="analytics-loading">
          <div>Application not found</div>
          <button onClick={() => navigate('/admin?tab=partners')} className="btn btn-primary">
            Back to Applications
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="application-details-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button 
              onClick={() => navigate('/admin?tab=partners')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to Applications
            </button>
            <h1 style={{ margin: 0 }}>Partner Application Details</h1>
          </div>
          <Badge variant={getStatusBadgeVariant(application.status)}>
            {application.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        <div className="application-details">
          {/* Institute Information */}
          <div className="detail-section">
            <h4 className="section-title">🏛️ Institute Information</h4>
            
            <div className="detail-row">
              <span className="detail-label">Institute Name:</span>
              <span className="font-semibold">{application.instituteName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Type:</span>
              <span>{application.instituteType}</span>
            </div>
            
            {application.website && (
              <div className="detail-row">
                <span className="detail-label">Website:</span>
                <a href={application.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>
                  {application.website}
                </a>
              </div>
            )}
            
            {application.establishedYear && (
              <div className="detail-row">
                <span className="detail-label">Established:</span>
                <span>{application.establishedYear}</span>
              </div>
            )}
          </div>

          {/* Contact Person */}
          <div className="detail-section">
            <h4 className="section-title">👤 Contact Person</h4>
            
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span>{application.contactPerson}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span>{application.email}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span>{application.phone}</span>
            </div>
            
            {application.designation && (
              <div className="detail-row">
                <span className="detail-label">Designation:</span>
                <span>{application.designation}</span>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="detail-section">
            <h4 className="section-title">📍 Address</h4>
            
            <div className="detail-row">
              <span className="detail-label">Full Address:</span>
              <span>{application.address}</span>
            </div>
            
            {application.city && (
              <div className="detail-row">
                <span className="detail-label">City:</span>
                <span>{application.city}</span>
              </div>
            )}
            
            {application.state && (
              <div className="detail-row">
                <span className="detail-label">State:</span>
                <span>{application.state}</span>
              </div>
            )}
            
            {application.pincode && (
              <div className="detail-row">
                <span className="detail-label">Pincode:</span>
                <span>{application.pincode}</span>
              </div>
            )}
          </div>

          {/* Application Details */}
          <div className="detail-section">
            <h4 className="section-title">📋 Application Details</h4>
            
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <Badge variant={getStatusBadgeVariant(application.status)}>
                {application.status?.toUpperCase()}
              </Badge>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Submitted:</span>
              <span>{new Date(application.createdAt).toLocaleString()}</span>
            </div>
            
            {application.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">Last Updated:</span>
                <span>{new Date(application.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Message/Reason */}
          {application.message && (
            <div className="detail-section">
              <h4 className="section-title">💬 Message</h4>
              <div className="notes-content">
                {application.message}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {application.adminNotes && (
            <div className="detail-section highlight-section">
              <h4 className="section-title">📝 Admin Notes</h4>
              <div className="notes-content">
                {application.adminNotes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="btn btn-success"
                  disabled={updating}
                >
                  ✅ Approve Application
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="btn btn-danger"
                  disabled={updating}
                >
                  ❌ Reject Application
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/admin?tab=partners')}
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

export default PartnerApplicationDetailsPage;
