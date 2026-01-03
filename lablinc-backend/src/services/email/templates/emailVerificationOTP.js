const emailLayout = require('./layout');

const emailVerificationOTPTemplate = (name, otp) => {
  const content = `
    <h2 style="color: #333; margin-bottom: 24px; font-size: 24px; font-weight: 600;">Welcome to LabLinc!</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
      Hi <strong>${name}</strong>,
    </p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 32px; font-size: 16px;">
      Thank you for joining LabLinc! To complete your registration and start accessing cutting-edge laboratory equipment, please verify your email address using the code below:
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; display: inline-block; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);">
        <p style="margin: 0 0 12px 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
        <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">
          <p style="margin: 0; font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${otp}
          </p>
        </div>
      </div>
    </div>
    
    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid #667eea;">
      <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px; font-weight: 600;">⏰ Important Details:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 8px;">This code expires in <strong>10 minutes</strong> for your security</li>
        <li style="margin-bottom: 8px;">Enter this code in the registration form to activate your account</li>
        <li>If you didn't create a LabLinc account, please ignore this email</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_URL}/signup" style="background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s ease;">
        Complete Registration →
      </a>
    </div>
    
    <p style="color: #666; line-height: 1.6; margin-top: 32px; font-size: 16px;">
      Once verified, you'll have access to:
    </p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔬</div>
        <div style="font-size: 14px; color: #666; font-weight: 500;">Premium Equipment</div>
      </div>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🏢</div>
        <div style="font-size: 14px; color: #666; font-weight: 500;">Institute Network</div>
      </div>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">📅</div>
        <div style="font-size: 14px; color: #666; font-weight: 500;">Easy Booking</div>
      </div>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
        <div style="font-size: 14px; color: #666; font-weight: 500;">Transparent Pricing</div>
      </div>
    </div>
  `;

  return emailLayout(content, {
    title: 'Verify Your Email - LabLinc',
    preheader: `Your verification code is ${otp}. Complete your LabLinc registration now.`,
    showSecurityWarning: true
  });
};

module.exports = emailVerificationOTPTemplate;