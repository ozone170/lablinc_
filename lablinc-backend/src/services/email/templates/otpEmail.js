const emailLayout = require('./layout');

const otpEmailTemplate = (name, otp) => {
  const content = `
    <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 24px; font-weight: 600; text-align: center;">
      Password Change Request
    </h2>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 32px; font-size: 16px; text-align: center;">
      Hi <strong style="color: #1f2937;">${name}</strong>, use this code to change your password
    </p>
    
    <!-- OTP Code - Large and Centered -->
    <div style="text-align: center; margin: 40px 0;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px; padding: 40px 32px; display: inline-block; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3); min-width: 280px;">
        <p style="margin: 0 0 16px 0; color: rgba(255,255,255,0.95); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
          Your Code
        </p>
        <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 24px 16px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3);">
          <p style="margin: 0; font-size: 48px; font-weight: bold; color: white; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            ${otp}
          </p>
        </div>
        <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">
          Expires in 10 minutes
        </p>
      </div>
    </div>
    
    <!-- Simple Instructions -->
    <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 32px 0; text-align: center;">
      <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
        Enter this code to verify your identity and change your password.<br>
        <span style="color: #9ca3af; font-size: 13px;">Your existing sessions will be logged out after the change.</span>
      </p>
    </div>
    
    <!-- Security Warning -->
    <div style="background: #fef2f2; border-radius: 12px; padding: 16px; margin: 24px 0; border-left: 4px solid #ef4444;">
      <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 500;">
        ⚠️ Didn't request this? Ignore this email and your password remains unchanged.
      </p>
    </div>
  `;

  return emailLayout(content, {
    title: 'Password Change Verification - LabLinc',
    preheader: `Your verification code is ${otp}`,
    showSecurityWarning: false
  });
};

module.exports = otpEmailTemplate;