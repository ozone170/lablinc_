import { useState } from 'react';
import { bookingsAPI } from '../../api/bookings.api';
import './InvoiceViewer.css';

const InvoiceViewer = ({ bookingId, booking }) => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError('');
      const blob = await bookingsAPI.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LabLinc-Invoice-${bookingId}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError('');
      const blob = await bookingsAPI.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(blob);
      setInvoiceUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to load invoice:', error);
      setError('Failed to load invoice preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (invoiceUrl) {
      const printWindow = window.open(invoiceUrl);
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  const calculateDuration = () => {
    if (!booking?.startDate || !booking?.endDate) return 'N/A';
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  return (
    <div className="invoice-viewer">
      <div className="invoice-header">
        <h3>📄 Invoice & Billing</h3>
        <div className="invoice-status">
          <span className={`status-badge ${booking?.paymentStatus || 'pending'}`}>
            {booking?.paymentStatus?.toUpperCase() || 'PENDING'}
          </span>
        </div>
      </div>

      {error && (
        <div className="invoice-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="invoice-actions">
        <button
          onClick={handlePreview}
          className="btn btn-secondary invoice-btn"
          disabled={loading}
        >
          <span className="btn-icon">👁️</span>
          {loading ? 'Loading...' : 'Preview Invoice'}
        </button>
        
        <button
          onClick={handleDownload}
          className="btn btn-primary invoice-btn"
          disabled={loading}
        >
          <span className="btn-icon">📥</span>
          {loading ? 'Downloading...' : 'Download PDF'}
        </button>
        
        {showPreview && (
          <button
            onClick={handlePrint}
            className="btn btn-secondary invoice-btn"
          >
            <span className="btn-icon">🖨️</span>
            Print Invoice
          </button>
        )}
      </div>

      {showPreview && invoiceUrl && (
        <div className="invoice-preview">
          <div className="preview-header">
            <h4>Invoice Preview</h4>
            <button 
              onClick={() => setShowPreview(false)}
              className="close-preview-btn"
            >
              ✕
            </button>
          </div>
          <iframe
            src={invoiceUrl}
            title="Invoice Preview"
            width="100%"
            height="600px"
            className="invoice-iframe"
          />
        </div>
      )}

      {!showPreview && booking && (
        <div className="invoice-summary">
          <h4>📊 Billing Summary</h4>
          
          <div className="summary-grid">
            <div className="summary-section">
              <h5>Booking Details</h5>
              <div className="summary-item">
                <span className="label">Booking ID:</span>
                <span className="value font-mono">{bookingId}</span>
              </div>
              <div className="summary-item">
                <span className="label">Instrument:</span>
                <span className="value">{booking.instrument?.name || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Category:</span>
                <span className="value">{booking.instrument?.category?.name || booking.instrument?.category || 'N/A'}</span>
              </div>
            </div>

            <div className="summary-section">
              <h5>Duration & Dates</h5>
              <div className="summary-item">
                <span className="label">Start Date:</span>
                <span className="value">
                  {booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">End Date:</span>
                <span className="value">
                  {booking.endDate ? new Date(booking.endDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Duration:</span>
                <span className="value">{calculateDuration()}</span>
              </div>
            </div>

            <div className="summary-section">
              <h5>Payment Information</h5>
              <div className="summary-item">
                <span className="label">Hourly Rate:</span>
                <span className="value">₹{booking.instrument?.pricing?.hourly || booking.hourlyRate || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Daily Rate:</span>
                <span className="value">₹{booking.instrument?.pricing?.daily || booking.dailyRate || 0}</span>
              </div>
              <div className="summary-item total-amount">
                <span className="label">Total Amount:</span>
                <span className="value">₹{booking.totalAmount || 0}</span>
              </div>
            </div>
          </div>

          <div className="invoice-footer">
            <p className="invoice-note">
              💡 <strong>Note:</strong> This invoice is generated automatically. 
              For any billing queries, please contact our support team.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewer;
