const emailLayout = require('./layout');

const bookingConfirmationTemplate = (name, booking) => {
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
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; padding: 24px; margin: 0 0 32px 0; color: white; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Booking Confirmed!</h2>
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your laboratory instrument booking has been successfully confirmed</p>
    </div>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 32px; font-size: 16px;">
      Great news! Your booking request has been confirmed. Here are the complete details of your laboratory equipment reservation:
    </p>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 32px 0;">
      <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; font-weight: 600; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
        📋 Booking Details
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Booking ID</div>
          <div style="color: #333; font-weight: 600; font-family: monospace;">${booking._id.toString().slice(-8).toUpperCase()}</div>
        </div>
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Status</div>
          <div style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block;">
            CONFIRMED
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Instrument</div>
        <div style="color: #333; font-weight: 600; font-size: 16px;">${booking.instrument?.name || 'N/A'}</div>
        <div style="color: #666; font-size: 14px;">${booking.instrument?.category || ''}</div>
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
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Duration</div>
          <div style="color: #333; font-weight: 600;">${booking.duration?.days || 1} day${(booking.duration?.days || 1) > 1 ? 's' : ''}</div>
        </div>
        <div>
          <div style="color: #666; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Total Amount</div>
          <div style="color: #10b981; font-size: 18px; font-weight: bold;">₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}</div>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" style="background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); margin-right: 12px;">
        📋 View Booking Details
      </a>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #6b7280; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);">
        🏠 Go to Dashboard
      </a>
    </div>
    
    <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 32px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">📋 Important Reminders</h3>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 8px;">Please arrive <strong>15 minutes before</strong> your scheduled time</li>
        <li style="margin-bottom: 8px;">Bring a valid ID and any required safety equipment</li>
        <li style="margin-bottom: 8px;">Contact the facility if you need to reschedule</li>
        <li>Payment confirmation will be required before equipment access</li>
      </ul>
    </div>
    
    <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
      <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 16px; font-weight: 600;">Questions About Your Booking?</h3>
      <p style="margin: 0 0 16px 0; color: #0284c7; font-size: 14px;">
        Our support team is here to help with any questions or concerns.
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
    title: `Booking Confirmed - ${booking.instrument?.name || 'LabLinc'}`,
    preheader: `Your booking for ${booking.instrument?.name || 'laboratory equipment'} has been confirmed. Total: ₹${booking.totalAmount?.toLocaleString('en-IN') || 'N/A'}`,
    showSecurityWarning: false
  });
};

module.exports = bookingConfirmationTemplate;