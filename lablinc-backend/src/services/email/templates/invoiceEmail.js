const emailLayout = require('./layout');

const invoiceEmailTemplate = (name, booking) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const content = `
    <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 24px; font-weight: 600; text-align: center;">
      Your Invoice is Ready
    </h2>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 32px; font-size: 16px; text-align: center;">
      Hi <strong style="color: #1f2937;">${name}</strong>, your booking is confirmed!
    </p>
    
    <!-- Invoice Summary Card -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; padding: 32px; margin: 32px 0; color: white; text-align: center; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);">
      <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
      <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; opacity: 0.95;">Invoice #${booking.invoiceId || booking._id.toString().slice(-8).toUpperCase()}</h3>
      <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; margin-top: 20px; backdrop-filter: blur(10px);">
        <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Total Amount</p>
        <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 1px;">
          ₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}
        </p>
      </div>
    </div>
    
    <!-- Booking Details -->
    <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
        Booking Details
      </h3>
      
      <div style="margin-bottom: 12px;">
        <span style="color: #6b7280; font-size: 14px;">Instrument:</span><br>
        <strong style="color: #1f2937; font-size: 15px;">${booking.instrument?.name || 'N/A'}</strong>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
        <div>
          <span style="color: #6b7280; font-size: 13px;">Start Date</span><br>
          <strong style="color: #1f2937; font-size: 14px;">${formatDate(booking.startDate)}</strong>
        </div>
        <div>
          <span style="color: #6b7280; font-size: 13px;">End Date</span><br>
          <strong style="color: #1f2937; font-size: 14px;">${formatDate(booking.endDate)}</strong>
        </div>
      </div>
    </div>
    
    <!-- Download Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" 
         style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); 
                color: white; 
                padding: 16px 40px; 
                text-decoration: none; 
                border-radius: 12px; 
                display: inline-block; 
                font-weight: 600; 
                font-size: 15px;
                box-shadow: 0 8px 32px rgba(78, 205, 196, 0.3);">
        📥 Download Invoice
      </a>
    </div>
    
    <!-- Simple Note -->
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 500;">
        💡 Keep this invoice for your records and expense claims
      </p>
    </div>
  `;

  return emailLayout(content, {
    title: `Invoice #${booking.invoiceId || booking._id.toString().slice(-8)} - LabLinc`,
    preheader: `Your invoice is ready. Amount: ₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}`,
    showSecurityWarning: false
  });
};

module.exports = invoiceEmailTemplate;