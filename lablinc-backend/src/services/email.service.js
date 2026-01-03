const sesService = require('./email/ses.service');
const verifyEmailTemplate = require('./email/templates/verifyEmail');
const resetPasswordTemplate = require('./email/templates/resetPassword');
const otpEmailTemplate = require('./email/templates/otpEmail');
const emailVerificationOTPTemplate = require('./email/templates/emailVerificationOTP');
const bookingConfirmationTemplate = require('./email/templates/bookingConfirmation');
const invoiceEmailTemplate = require('./email/templates/invoiceEmail');

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = verifyEmailTemplate(user.name, verificationUrl);
  
  await sesService.sendEmail(
    user.email,
    'Verify Your Email - LabLinc',
    html
  );
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = resetPasswordTemplate(user.name, resetUrl);
  
  await sesService.sendEmail(
    user.email,
    'Password Reset Request - LabLinc',
    html
  );
};

// Send OTP email for password change
const sendPasswordChangeOTP = async (user, otp) => {
  console.log('📧 SENDING PASSWORD CHANGE OTP', {
    recipientEmail: user.email,
    recipientName: user.name,
    userId: user._id,
    timestamp: new Date().toISOString()
  });

  const html = otpEmailTemplate(user.name, otp);
  
  const result = await sesService.sendEmail(
    user.email, // CRITICAL: Using user.email from DB, NOT req.body.email
    'Password Change Verification - LabLinc',
    html // Using branded template
  );

  // TASK H1: MANDATORY - Log and store MessageId
  console.log('📨 PASSWORD CHANGE OTP - SES MESSAGE ID:', result.MessageId);
  
  // Optional: Store in database for tracking
  // await EmailLog.create({
  //   userId: user._id,
  //   email: user.email,
  //   type: 'password_change_otp',
  //   messageId: result.MessageId,
  //   timestamp: new Date()
  // });
};

// Send booking confirmation email
const sendBookingConfirmation = async (user, booking) => {
  const html = bookingConfirmationTemplate(user.name, booking);
  
  await sesService.sendEmail(
    user.email,
    'Booking Confirmation - LabLinc',
    html
  );
};

// Send OTP email for email verification
const sendEmailVerificationOTP = async (user, otp) => {
  console.log('📧 SENDING EMAIL VERIFICATION OTP', {
    recipientEmail: user.email,
    recipientName: user.name,
    userId: user._id,
    timestamp: new Date().toISOString()
  });

  const html = emailVerificationOTPTemplate(user.name, otp);
  
  const result = await sesService.sendEmail(
    user.email, // CRITICAL: Using user.email from DB, NOT req.body.email
    'Email Verification Code - LabLinc',
    html // Using branded template
  );

  // TASK H1: MANDATORY - Log and store MessageId
  console.log('📨 EMAIL VERIFICATION OTP - SES MESSAGE ID:', result.MessageId);
  
  // Optional: Store in database for tracking
  // await EmailLog.create({
  //   userId: user._id,
  //   email: user.email,
  //   type: 'email_verification_otp',
  //   messageId: result.MessageId,
  //   timestamp: new Date()
  // });
};

// Send invoice email with PDF attachment
const sendInvoiceEmail = async (user, booking, invoicePath) => {
  console.log('📧 SENDING INVOICE EMAIL', {
    recipientEmail: user.email,
    recipientName: user.name,
    bookingId: booking._id,
    invoiceId: booking.invoiceId,
    timestamp: new Date().toISOString()
  });

  const html = invoiceEmailTemplate(user.name, booking);
  
  const result = await sesService.sendRawEmail(
    user.email,
    `Invoice for Booking ${booking._id.toString().slice(-8).toUpperCase()} - LabLinc`,
    html,
    [{
      filename: `invoice-${booking.invoiceId}.pdf`,
      path: invoicePath
    }]
  );

  // TASK H1: MANDATORY - Log and store MessageId
  console.log('📨 INVOICE EMAIL - SES MESSAGE ID:', result.MessageId);
  
  return result;
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangeOTP,
  sendEmailVerificationOTP,
  sendBookingConfirmation,
  sendInvoiceEmail
};
