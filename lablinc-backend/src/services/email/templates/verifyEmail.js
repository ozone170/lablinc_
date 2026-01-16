const emailLayout = require('./layout');

const verifyEmailTemplate = (name, verificationUrl) => {
  const content = `
    <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 24px; font-weight: 600; text-align: center;">
      Verify Your Email
    </h2>
    
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 32px; font-size: 16px; text-align: center;">
      Hi <strong style="color: #1f2937;">${name}</strong>, click the button below to verify your email
    </p>
    
    <!-- Primary CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${verificationUrl}" 
         style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); 
                color: white; 
                padding: 18px 48px; 
                text-decoration: none; 
                border-radius: 12px; 
                display: inline-block; 
                font-weight: 600; 
                font-size: 16px;
                box-shadow: 0 10px 40px rgba(78, 205, 196, 0.3);
                transition: all 0.2s ease;">
        Verify Email Address
      </a>
    </div>
    
    <!-- Fallback Link -->
    <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 32px 0;">
      <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; text-align: center;">
        Button not working? Copy and paste this link:
      </p>
      <p style="margin: 0; color: #4ecdc4; word-break: break-all; background: white; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; text-align: center; border: 1px solid #e5e7eb;">
        ${verificationUrl}
      </p>
    </div>
    
    <!-- Simple Footer Note -->
    <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px;">
      This link expires in 24 hours. Didn't sign up? Ignore this email.
    </p>
  `;

  return emailLayout(content, {
    title: 'Verify Your Email - LabLinc',
    preheader: 'Click to verify your email address and activate your account',
    showSecurityWarning: false
  });
};

module.exports = verifyEmailTemplate;