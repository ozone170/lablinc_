const emailLayout = require('./layout');

const passwordChangeConfirmationTemplate = (name, timestamp, ipAddress) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const content = `
    <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 24px; font-weight: 600; text-align: center;">
      Password Changed Successfully
    </h2>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 32px; font-size: 16px; text-align: center;">
      Hi <strong style="color: #1f2937;">${name}</strong>, your password has been updated
    </p>
    
    <!-- Success Icon -->
    <div style="text-align: center; margin: 32px 0;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);">
        <div style="color: white; font-size: 40px;">✓</div>
      </div>
    </div>
    
    <!-- Details Card -->
    <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
        Change Details
      </h3>
      
      <div style="margin-bottom: 12px;">
        <span style="color: #6b7280; font-size: 14px;">Time:</span><br>
        <strong style="color: #1f2937; font-size: 15px;">${formatDate(timestamp)}</strong>
      </div>
      
      ${ipAddress ? `
      <div>
        <span style="color: #6b7280; font-size: 14px;">IP Address:</span><br>
        <strong style="color: #1f2937; font-size: 15px;">${ipAddress}</strong>
      </div>
      ` : ''}
    </div>
    
    <!-- Security Note -->
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
        🔒 If you didn't make this change, please contact our support team immediately
      </p>
    </div>
    
    <!-- Action Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_URL}/profile" 
         style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); 
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 12px; 
                display: inline-block; 
                font-weight: 600; 
                font-size: 15px;
                box-shadow: 0 8px 32px rgba(78, 205, 196, 0.3);">
        View Account Settings
      </a>
    </div>
  `;

  return emailLayout(content, {
    title: 'Password Changed - LabLinc',
    preheader: 'Your password has been successfully updated',
    showSecurityWarning: true
  });
};

module.exports = passwordChangeConfirmationTemplate;