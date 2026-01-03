const resetPasswordTemplate = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4F46E5; margin: 0;">LabLinc</h1>
      </div>
      
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Hi ${name},
      </p>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password for your LabLinc account. If you made this request, click the button below to create a new password.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #4F46E5; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
        ${resetUrl}
      </p>
      
      <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
        <p style="color: #999; font-size: 12px; line-height: 1.4;">
          <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security. 
          If you didn't request a password reset, please ignore this email - your account is still secure.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 15px;">
          For security reasons, we recommend using a strong, unique password that you don't use elsewhere.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 15px;">
          Need help? Contact us at support@lablinc.in
        </p>
      </div>
    </div>
  `;
};

module.exports = resetPasswordTemplate;