/**
 * Global Email Layout Template
 * Base template for all LabLinc emails with consistent branding
 */

const emailLayout = (content, options = {}) => {
  const {
    title = 'LabLinc',
    preheader = '',
    showSecurityWarning = true
  } = options;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table, td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        
        /* Base styles */
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #333333;
        }
        
        /* Container */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        
        /* Header */
        .email-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
          text-align: center;
          position: relative;
        }
        
        .email-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="white" opacity="0.1"><polygon points="0,0 1000,0 1000,100 0,80"/></svg>') no-repeat bottom;
          background-size: cover;
        }
        
        .logo-container {
          position: relative;
          z-index: 1;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
          margin: 0;
        }
        
        .brand-name {
          color: white;
          font-size: 32px;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .brand-tagline {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          margin: 8px 0 0 0;
          font-weight: 300;
        }
        
        /* Content */
        .email-content {
          padding: 40px 30px;
        }
        
        /* Footer */
        .email-footer {
          background-color: #1a1a2e;
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
        }
        
        .footer-brand {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #667eea;
        }
        
        .footer-links {
          margin: 16px 0;
        }
        
        .footer-link {
          color: #667eea;
          text-decoration: none;
          margin: 0 12px;
          font-size: 14px;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
        
        .security-warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-size: 14px;
          color: #856404;
        }
        
        .security-warning strong {
          color: #533f03;
        }
        
        .footer-text {
          font-size: 12px;
          color: #9ca3af;
          margin: 16px 0 0 0;
          line-height: 1.4;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
          }
          
          .email-header {
            padding: 30px 20px !important;
          }
          
          .brand-name {
            font-size: 28px !important;
          }
          
          .email-content {
            padding: 30px 20px !important;
          }
          
          .footer-link {
            display: block;
            margin: 8px 0 !important;
          }
        }
      </style>
    </head>
    <body>
      ${preheader ? `<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
      
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <div class="logo-container">
            <div class="logo">
              <div class="logo-text">LL</div>
            </div>
            <h1 class="brand-name">LabLinc</h1>
            <p class="brand-tagline">Bridging Academia & Industry</p>
          </div>
        </div>
        
        <!-- Content -->
        <div class="email-content">
          ${content}
          
          ${showSecurityWarning ? `
          <div class="security-warning">
            <strong>🔒 Security Notice:</strong> This email contains sensitive information. Never share verification codes or personal details with anyone. LabLinc support will never ask for your passwords or verification codes.
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
          <div class="footer-brand">LabLinc</div>
          <div class="footer-links">
            <a href="${process.env.FRONTEND_URL}" class="footer-link">Visit Website</a>
            <a href="${process.env.FRONTEND_URL}/contact" class="footer-link">Contact Support</a>
            <a href="${process.env.FRONTEND_URL}/about" class="footer-link">About Us</a>
          </div>
          <p class="footer-text">
            © ${new Date().getFullYear()} LabLinc. All rights reserved.<br>
            Connecting researchers with cutting-edge laboratory equipment.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = emailLayout;