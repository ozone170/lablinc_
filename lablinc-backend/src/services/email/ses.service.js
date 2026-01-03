const { SESClient, SendEmailCommand, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const logger = require('../../utils/logger');

class SESService {
  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    // CRITICAL: Lock down EMAIL_FROM - no fallback, no override
    if (!process.env.EMAIL_FROM || process.env.EMAIL_FROM !== 'noreply@lablinc.in') {
      throw new Error('EMAIL_FROM must be exactly "noreply@lablinc.in" for DMARC alignment');
    }
    
    this.fromEmail = 'noreply@lablinc.in'; // Hardcoded for security
    this.maxRetries = 3;
    
    console.log('🔒 EMAIL_FROM LOCKED TO:', this.fromEmail);
  }

  // TASK G5: Dedicated method for OTP/verification emails (SendEmailCommand)
  async sendEmail(to, subject, html, retryCount = 0) {
    const emailParams = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8'
          }
        }
      }
    };

    try {
      console.log('🚨 SES SEND CALLED', {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        from: this.fromEmail,
        timestamp: new Date().toISOString()
      });

      const command = new SendEmailCommand(emailParams);
      const result = await this.client.send(command);
      
      console.log('✅ SES SEND SUCCESS', {
        messageId: result.MessageId,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        timestamp: new Date().toISOString()
      });

      logger.info('Email sent successfully', {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        messageId: result.MessageId
      });
      return result;
    } catch (error) {
      logger.error('SES Error', {
        attempt: retryCount + 1,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        error: error.message,
        errorName: error.name
      });
      
      // Retry on transient failures
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        logger.info('Retrying email send', {
          to: Array.isArray(to) ? to.join(', ') : to,
          attempt: retryCount + 2,
          maxRetries: this.maxRetries
        });
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.sendEmail(to, subject, html, retryCount + 1);
      }
      
      // Handle specific SES errors
      if (error.name === 'MessageRejected') {
        throw new Error('Email rejected by SES. Check sender verification and content.');
      } else if (error.name === 'SendingPausedException') {
        throw new Error('SES sending is paused for this account.');
      } else if (error.name === 'Throttling') {
        throw new Error('SES sending quota exceeded. Please try again later.');
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // TASK G5: Dedicated method for invoice emails with attachments (SendRawEmailCommand)
  async sendRawEmail(to, subject, html, attachments = [], retryCount = 0) {
    try {
      console.log('🚨 SES SEND RAW CALLED', {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        from: this.fromEmail,
        attachmentCount: attachments.length,
        timestamp: new Date().toISOString()
      });

      // Build raw email with attachments
      const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36)}`;
      let rawMessage = `From: ${this.fromEmail}\r\n`;
      rawMessage += `To: ${Array.isArray(to) ? to.join(', ') : to}\r\n`;
      rawMessage += `Subject: ${subject}\r\n`;
      rawMessage += `MIME-Version: 1.0\r\n`;
      rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
      
      // HTML body
      rawMessage += `--${boundary}\r\n`;
      rawMessage += `Content-Type: text/html; charset=UTF-8\r\n`;
      rawMessage += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
      rawMessage += `${html}\r\n\r\n`;
      
      // Add attachments
      for (const attachment of attachments) {
        const fileContent = require('fs').readFileSync(attachment.path);
        const base64Content = fileContent.toString('base64');
        
        rawMessage += `--${boundary}\r\n`;
        rawMessage += `Content-Type: application/pdf\r\n`;
        rawMessage += `Content-Transfer-Encoding: base64\r\n`;
        rawMessage += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n\r\n`;
        rawMessage += `${base64Content}\r\n\r\n`;
      }
      
      rawMessage += `--${boundary}--\r\n`;

      const command = new SendRawEmailCommand({
        RawMessage: {
          Data: Buffer.from(rawMessage)
        }
      });

      const result = await this.client.send(command);
      
      console.log('✅ SES SEND RAW SUCCESS', {
        messageId: result.MessageId,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        timestamp: new Date().toISOString()
      });

      logger.info('Raw email sent successfully', {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        messageId: result.MessageId,
        attachmentCount: attachments.length
      });
      return result;
    } catch (error) {
      logger.error('SES Raw Email Error', {
        attempt: retryCount + 1,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        error: error.message,
        errorName: error.name
      });
      
      // Retry logic similar to sendEmail
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        await this.delay(1000 * (retryCount + 1));
        return this.sendRawEmail(to, subject, html, attachments, retryCount + 1);
      }
      
      throw new Error(`Failed to send raw email: ${error.message}`);
    }
  }

  isRetryableError(error) {
    const retryableErrors = [
      'Throttling',
      'ServiceUnavailable',
      'InternalFailure',
      'RequestTimeout'
    ];
    return retryableErrors.includes(error.name);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate SES configuration
  validateConfiguration() {
    const requiredEnvVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID', 
      'AWS_SECRET_ACCESS_KEY',
      'EMAIL_FROM'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate region
    if (process.env.AWS_REGION !== 'ap-south-1') {
      logger.warn('AWS region mismatch', {
        current: process.env.AWS_REGION,
        expected: 'ap-south-1'
      });
    }

    // Validate email domain
    if (!process.env.EMAIL_FROM.includes('@lablinc.in')) {
      logger.warn('Email domain not verified', {
        current: process.env.EMAIL_FROM,
        expected: 'domain @lablinc.in'
      });
    }
  }
}

module.exports = new SESService();