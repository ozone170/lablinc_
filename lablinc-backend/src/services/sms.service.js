// SMS Service using Twilio or similar provider
// This is a placeholder implementation - configure with your SMS provider

const sendSms = async (to, message) => {
  // Check if SMS is enabled
  if (!process.env.SMS_ENABLED || process.env.SMS_ENABLED !== 'true') {
    console.log('SMS disabled. Would have sent:', { to, message });
    return { success: true, message: 'SMS disabled in config' };
  }

  try {
    // Example with Twilio (uncomment and configure when ready)
    /*
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    return { success: true, messageId: result.sid };
    */

    // Placeholder implementation
    console.log(`SMS to ${to}: ${message}`);
    return { success: true, message: 'SMS sent (placeholder)' };
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error('Failed to send SMS');
  }
};

// Send booking notification SMS
const sendBookingNotificationSms = async (user, booking) => {
  const message = `LabLinc: Your booking for ${booking.instrumentName} has been confirmed. Booking ID: ${booking._id}`;
  return await sendSms(user.phone, message);
};

// Send OTP SMS
const sendOtpSms = async (phone, otp) => {
  const message = `Your LabLinc verification code is: ${otp}. Valid for 10 minutes.`;
  return await sendSms(phone, message);
};

module.exports = {
  sendSms,
  sendBookingNotificationSms,
  sendOtpSms
};
