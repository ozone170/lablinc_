const verifyEmailTemplate = (name, verificationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4F46E5; margin: 0;">LabLinc</h1>
      </div>
      
      <h2 style="color: #333; margin-bottom: 20px;">Welcome to LabLinc, ${name}!</h2>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Thank you for registering with LabLinc. To complete your account setup and start accessing our laboratory instruments, please verify your email address.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
          Verify Email Address
        </a>
      </div>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #4F46E5; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
        ${verificationUrl}
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; line-height: 1.4;">
          <strong>Security Notice:</strong> This verification link will expire in 24 hours for your security. 
          If you didn't create an account with LabLinc, please ignore this email.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 15px;">
          Need help? Contact us at support@lablinc.in
        </p>
      </div>
    </div>
  `;
};

module.exports = verifyEmailTemplate;