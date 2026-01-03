const emailLayout = require('./layout');

const invoiceEmailTemplate = (name, booking) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const content = `
    <h2 style="color: #333; margin-bottom: 24px; font-size: 24px; font-weight: 600;">Invoice Ready for Download</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 32px; font-size: 16px;">
      Your booking has been confirmed and your invoice is ready for download. Please find the details below and your invoice attached to this email.
    </p>
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; padding: 24px; margin: 32px 0; color: white; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Booking Confirmed!</h3>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your laboratory instrument booking is all set</p>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 32px 0;">
      <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
        📋 Booking Summary
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Booking ID</div>
          <div style="color: #333; font-weight: 600; font-family: monospace;">${booking._id.toString().slice(-8).toUpperCase()}</div>
        </div>
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Invoice ID</div>
          <div style="color: #333; font-weight: 600; font-family: monospace;">${booking.invoiceId || 'N/A'}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Instrument</div>
        <div style="color: #333; font-weight: 600; font-size: 16px;">${booking.instrument?.name || 'N/A'}</div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Start Date & Time</div>
          <div style="color: #333; font-weight: 600;">${formatDate(booking.startDate)}</div>
          <div style="color: #666; font-size: 14px;">${formatTime(booking.startDate)}</div>
        </div>
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">End Date & Time</div>
          <div style="color: #333; font-weight: 600;">${formatDate(booking.endDate)}</div>
          <div style="color: #666; font-size: 14px;">${formatTime(booking.endDate)}</div>
        </div>
      </div>
      
      <div style="background: white; border-radius: 8px; padding: 16px; border: 2px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="color: #666; font-size: 16px; font-weight: 500;">Total Amount</div>
          <div style="color: #10b981; font-size: 24px; font-weight: bold;">₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}</div>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" style="background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); margin-right: 12px;">
        📄 Download Invoice
      </a>
      <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" style="background: #6b7280; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);">
        📋 View Booking
      </a>
    </div>
    
    <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 32px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">📋 Important Reminders</h3>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 8px;">Please arrive <strong>15 minutes before</strong> your scheduled time</li>
        <li style="margin-bottom: 8px;">Bring a valid ID and any required safety equipment</li>
        <li style="margin-bottom: 8px;">Payment confirmation will be required before equipment access</li>
        <li style="margin-bottom: 8px;">Contact the facility if you need to reschedule</li>
        <li>Keep this invoice for your records and expense claims</li>
      </ul>
    </div>
    
    <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
      <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 16px; font-weight: 600;">Need Help?</h3>
      <p style="margin: 0 0 16px 0; color: #0284c7; font-size: 14px;">
        Our support team is here to help with any questions about your booking or invoice.
      </p>
      <a href="mailto:support@lablinc.in" style="color: #0369a1; text-decoration: none; font-weight: 600;">
        📧 support@lablinc.in
      </a>
      <span style="color: #6b7280; margin: 0 12px;">|</span>
      <a href="tel:+91-XXXX-XXXX-XX" style="color: #0369a1; text-decoration: none; font-weight: 600;">
        📞 +91-XXXX-XXXX-XX
      </a>
    </div>
  `;

  return emailLayout(content, {
    title: `Invoice for Booking ${booking._id} - LabLinc`,
    preheader: `Your booking invoice is ready. Total amount: ₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}`,
    showSecurityWarning: false
  });
};

module.exports = invoiceEmailTemplate;