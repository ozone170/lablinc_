const emailLayout = require('./layout');

const otpEmailTemplate = (name, otp) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 24px; font-size: 24px; font-weight: 600;">Password Change Verification</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 32px; font-size: 16px;">
      We received a request to change your LabLinc account password. To proceed with this change, please use the verification code below:
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px; padding: 32px; display: inline-block; box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);">
        <p style="margin: 0 0 12px 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Password Change Code</p>
        <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">
          <p style="margin: 0; font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${otp}
          </p>
        </div>
      </div>
    </div>
    
    <div style="background: #fef3c7; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">🔐 Security Information:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 8px;">This code expires in <strong>10 minutes</strong> for your security</li>
        <li style="margin-bottom: 8px;">Enter this code to verify your identity and complete the password change</li>
        <li style="margin-bottom: 8px;">Your existing sessions will be logged out after password change</li>
        <li>If you didn't request this change, please secure your account immediately</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_URL}/change-password" style="background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); transition: all 0.2s ease;">
        Change Password →
      </a>
    </div>
    
    <div style="background: #fee2e2; border-radius: 12px; padding: 20px; margin: 32px 0; border-left: 4px solid #ef4444;">
      <h3 style="margin: 0 0 12px 0; color: #dc2626; font-size: 16px; font-weight: 600;">⚠️ Didn't Request This?</h3>
      <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.6;">
        If you didn't request a password change, please:
      </p>
      <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #dc2626; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 4px;">Ignore this email (your password remains unchanged)</li>
        <li style="margin-bottom: 4px;">Consider changing your password as a precaution</li>
        <li>Contact our support team if you're concerned about account security</li>
      </ul>
    </div>
  `;

  return emailLayout(content, {
    title: 'Password Change Verification - LabLinc',
    preheader: `Your password change verification code is ${otp}. This code expires in 10 minutes.`,
    showSecurityWarning: true
  });
};

module.exports = otpEmailTemplate;