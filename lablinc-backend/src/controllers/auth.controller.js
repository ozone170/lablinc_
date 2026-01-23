const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Log email service to verify import
console.log("EMAIL SERVICE:", emailService);
console.log("EMAIL SERVICE FUNCTIONS:", Object.keys(emailService));

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, organization, address } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  // Prevent direct admin registration
  if (role === 'admin') {
    const error = new Error('Cannot register as admin');
    error.statusCode = 403;
    throw error;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'msme',
    phone,
    organization,
    address,
    emailVerified: false
  });

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user, verificationToken);
    logger.logAuth('registration_email_sent', user._id, user.email, true);
  } catch (error) {
    logger.logAuth('registration_email_failed', user._id, user.email, false, { error: error.message });
    // Don't fail registration if email fails, but log the error
    console.error('Failed to send verification email during registration:', error);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Hash refresh token before storing
  const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // Save hashed refresh token to user
  user.refreshToken = hashedRefreshToken;
  await user.save();

  logger.logAuth('registration', user._id, user.email, true, { role: user.role });

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes for access token
  };

  const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
      // Tokens are now in secure cookies, not in response body
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if user is active
  if (user.status !== 'active') {
    const error = new Error('Account is not active');
    error.statusCode = 403;
    throw error;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    // Allow authentication but return specific error code for unverified users
    const error = new Error('Email verification required. Please verify your email address to access all features.');
    error.statusCode = 403;
    error.code = 'EMAIL_NOT_VERIFIED'; // Specific error code for frontend handling
    throw error;
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Hash refresh token before storing
  const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Save hashed refresh token
  user.refreshToken = hashedRefreshToken;
  await user.save();

  logger.logAuth('login', user._id, user.email, true);

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes for access token
  };

  const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      // Tokens are now in secure cookies, not in response body
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    const error = new Error('Refresh token required');
    error.statusCode = 401;
    throw error;
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user with refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    // Hash the refresh token for comparison
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Check both hashed and unhashed tokens for backward compatibility
    const isValidToken = user.refreshToken === hashedRefreshToken || user.refreshToken === refreshToken;

    if (!isValidToken) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Account is not active');
      error.statusCode = 403;
      throw error;
    }

    // Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Hash new refresh token before storing
    const hashedNewRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // Save new hashed refresh token
    user.refreshToken = hashedNewRefreshToken;
    await user.save();

    // Set new secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes for access token
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
    };

    res.cookie('accessToken', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
      // Tokens are now in secure cookies, not in response body
    });
  } catch (err) {
    // Clear cookies on any refresh token error
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    if (err.name === 'JsonWebTokenError') {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Refresh token expired');
      error.statusCode = 401;
      throw error;
    }
    throw err;
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from database
  const user = await User.findById(req.user.id);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  // Clear secure cookies
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshToken');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        address: user.address,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists or not for security
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save hashed token and expiry to user
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  try {
    // Send email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error) {
    // Clear reset fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.error('Email send error:', error);
    const err = new Error('Failed to send password reset email');
    err.statusCode = 500;
    throw err;
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    const error = new Error('Token and new password are required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  // Hash the token from URL
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshToken = undefined; // Invalidate existing sessions
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. Please login with your new password'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists or not for security
    res.json({
      success: true,
      message: 'If an account exists with this email and is unverified, a verification email has been sent'
    });
    return;
  }

  if (user.emailVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  try {
    await emailService.sendVerificationEmail(user, verificationToken);
    logger.logAuth('resend_verification_email_sent', user._id, user.email, true);

    res.json({
      success: true,
      message: 'If an account exists with this email and is unverified, a verification email has been sent'
    });
  } catch (error) {
    logger.logAuth('resend_verification_email_failed', user._id, user.email, false, { error: error.message });
    console.error('Failed to send verification email:', error);
    
    const err = new Error('Failed to send verification email. Please try again later.');
    err.statusCode = 500;
    throw err;
  }
});

// @desc    Request OTP for password change
// @route   POST /api/auth/request-password-change-otp
// @access  Private
const requestPasswordChangeOTP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+lastPasswordOTPRequest');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check cooldown (60 seconds between requests)
  const now = Date.now();
  const cooldownPeriod = 60 * 1000; // 60 seconds
  
  if (user.lastPasswordOTPRequest && (now - user.lastPasswordOTPRequest.getTime()) < cooldownPeriod) {
    const remainingTime = Math.ceil((cooldownPeriod - (now - user.lastPasswordOTPRequest.getTime())) / 1000);
    const error = new Error(`Please wait ${remainingTime} seconds before requesting another OTP`);
    error.statusCode = 429;
    throw error;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  // Save OTP to user
  user.passwordChangeOTP = hashedOTP;
  user.passwordChangeOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.passwordChangeOTPAttempts = 0;
  user.lastPasswordOTPRequest = new Date();
  await user.save();

  try {
    await emailService.sendPasswordChangeOTP(user, otp);
    logger.logAuth('password_change_otp_sent', user._id, user.email, true);

    res.json({
      success: true,
      message: 'OTP sent to your email address'
    });
  } catch (error) {
    // Clear OTP fields if email fails
    user.passwordChangeOTP = undefined;
    user.passwordChangeOTPExpires = undefined;
    user.passwordChangeOTPAttempts = 0;
    await user.save();

    logger.logAuth('password_change_otp_failed', user._id, user.email, false, { error: error.message });
    console.error('Failed to send OTP email:', error);
    const err = new Error('Failed to send OTP email');
    err.statusCode = 500;
    throw err;
  }
});

// @desc    Change password with OTP
// @route   POST /api/auth/change-password-with-otp
// @access  Private
const changePasswordWithOTP = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  if (!otp || !newPassword) {
    const error = new Error('OTP and new password are required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  // Get user with OTP fields
  const user = await User.findById(req.user.id).select('+passwordChangeOTP +passwordChangeOTPExpires +passwordChangeOTPAttempts');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if OTP exists and not expired
  if (!user.passwordChangeOTP || !user.passwordChangeOTPExpires || user.passwordChangeOTPExpires < Date.now()) {
    const error = new Error('OTP has expired. Please request a new one');
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (user.passwordChangeOTPAttempts >= 3) {
    // Clear OTP fields
    user.passwordChangeOTP = undefined;
    user.passwordChangeOTPExpires = undefined;
    user.passwordChangeOTPAttempts = 0;
    await user.save();

    const error = new Error('Too many failed attempts. Please request a new OTP');
    error.statusCode = 429;
    throw error;
  }

  // Verify OTP
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  if (user.passwordChangeOTP !== hashedOTP) {
    // Increment attempt counter
    user.passwordChangeOTPAttempts += 1;
    await user.save();

    const error = new Error(`Invalid OTP. ${3 - user.passwordChangeOTPAttempts} attempts remaining`);
    error.statusCode = 400;
    throw error;
  }

  // Update password
  user.password = newPassword;
  user.passwordChangeOTP = undefined;
  user.passwordChangeOTPExpires = undefined;
  user.passwordChangeOTPAttempts = 0;
  user.refreshToken = undefined; // Invalidate existing sessions
  await user.save();

  // Send password change confirmation email (non-blocking)
  try {
    const timestamp = new Date();
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    await emailService.sendPasswordChangeConfirmation(user, timestamp, ipAddress);
  } catch (error) {
    console.error('Failed to send password change confirmation email:', error);
    // Don't fail the password change if email fails
  }

  // Generate new tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Hash refresh token before storing
  const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  user.refreshToken = hashedRefreshToken;
  await user.save();

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes for access token
  };

  const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for refresh token
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    message: 'Password changed successfully'
    // Tokens are now in secure cookies, not in response body
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    const error = new Error('Verification token is required');
    error.statusCode = 400;
    throw error;
  }

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  }).select('+emailVerificationToken +emailVerificationExpires +refreshToken');

  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  // CRITICAL: Invalidate existing refresh tokens for security
  user.refreshToken = undefined;
  
  await user.save();

  logger.logAuth('email_verified_via_link', user._id, user.email, true);

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Update user profile
// @route   PATCH /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, organization, address } = req.body;

  // Find user
  const user = await User.findById(req.user.id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already in use');
      error.statusCode = 400;
      throw error;
    }
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (organization !== undefined) user.organization = organization;
  if (address !== undefined) user.address = address;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        address: user.address,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Send email OTP for registration (before user exists)
// @route   POST /api/auth/send-registration-otp
// @access  Public
const sendRegistrationOTP = asyncHandler(async (req, res) => {
  console.log("🔥 ENTERED send-registration-otp controller");
  
  const { email } = req.body;

  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  console.log("🔥 Generating registration OTP for email:", email);

  // TASK L2: Enforce Single Email Source
  const recipientEmail = email; // From request body for registration
  console.log("📧 REGISTRATION OTP TARGET:", recipientEmail);

  // TASK L5: Add Guardrail Log (Permanent)
  if (!recipientEmail) {
    throw new Error("Registration OTP attempted with no recipient email");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP temporarily in session/cache (for now, we'll use a simple in-memory store)
  // In production, use Redis or similar
  global.registrationOTPs = global.registrationOTPs || {};
  global.registrationOTPs[email] = {
    otp: crypto.createHash('sha256').update(otp).digest('hex'),
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0
  };

  console.log("🔥 ABOUT TO CALL SES SEND FOR REGISTRATION");

  try {
    // Create a temporary user object for the email service
    const tempUser = { name: 'New User', email: recipientEmail };
    await emailService.sendEmailVerificationOTP(tempUser, otp);

    console.log("🔥 REGISTRATION EMAIL SENT SUCCESSFULLY");

    res.json({
      success: true,
      message: 'Registration OTP sent to your email address'
    });
  } catch (error) {
    console.log("🔥 REGISTRATION EMAIL SEND FAILED:", error.message);
    
    // Clear OTP from memory
    if (global.registrationOTPs && global.registrationOTPs[email]) {
      delete global.registrationOTPs[email];
    }

    console.error('Failed to send registration OTP:', error);
    
    // TASK L3: Prevent Silent Success - NEVER return 200 if email not sent
    const err = new Error('Failed to send registration OTP. Please try again later.');
    err.statusCode = 500;
    throw err;
  }
});

// @desc    Verify registration OTP (before user exists)
// @route   POST /api/auth/verify-registration-otp
// @access  Public
const verifyRegistrationOTP = asyncHandler(async (req, res) => {
  console.log("🔥 ENTERED verify-registration-otp controller");
  
  const { email, otp } = req.body;

  if (!email || !otp) {
    const error = new Error('Email and OTP are required');
    error.statusCode = 400;
    throw error;
  }

  // Check if OTP exists in memory
  if (!global.registrationOTPs || !global.registrationOTPs[email]) {
    const error = new Error('No OTP found for this email. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  const otpData = global.registrationOTPs[email];

  // Check if OTP expired
  if (otpData.expires < Date.now()) {
    delete global.registrationOTPs[email];
    const error = new Error('OTP has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (otpData.attempts >= 3) {
    delete global.registrationOTPs[email];
    const error = new Error('Too many failed attempts. Please request a new OTP.');
    error.statusCode = 429;
    throw error;
  }

  // Verify OTP
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  if (otpData.otp !== hashedOTP) {
    otpData.attempts += 1;
    const error = new Error(`Invalid OTP. ${3 - otpData.attempts} attempts remaining`);
    error.statusCode = 400;
    throw error;
  }

  // OTP verified successfully
  delete global.registrationOTPs[email];

  console.log("🔥 REGISTRATION OTP VERIFIED SUCCESSFULLY");

  res.json({
    success: true,
    message: 'Email verified successfully. You can now complete registration.'
  });
});

// @desc    Send email OTP for verification
// @route   POST /api/auth/send-email-otp
// @access  Public
const sendEmailOTP = asyncHandler(async (req, res) => {
  console.log("🔥 ENTERED send-email-otp controller");
  
  const { email } = req.body;

  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email }).select('+lastEmailOTPRequest');

  if (!user) {
    console.log("🔥 USER NOT FOUND - NO EMAIL WILL BE SENT");
    // Don't reveal if user exists or not for security
    res.json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent'
    });
    return;
  }

  console.log("🔥 USER FOUND:", user.email);

  if (user.emailVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  // Check cooldown (60 seconds between requests)
  const now = Date.now();
  const cooldownPeriod = 60 * 1000; // 60 seconds
  
  if (user.lastEmailOTPRequest && (now - user.lastEmailOTPRequest.getTime()) < cooldownPeriod) {
    const remainingTime = Math.ceil((cooldownPeriod - (now - user.lastEmailOTPRequest.getTime())) / 1000);
    const error = new Error(`Please wait ${remainingTime} seconds before requesting another OTP`);
    error.statusCode = 429;
    throw error;
  }

  console.log("🔥 Generating OTP for user:", user?.email);

  // TASK L2: Enforce Single Email Source
  const recipientEmail = user.email; // NOT req.body.email
  console.log("📧 OTP TARGET:", recipientEmail);

  // TASK L5: Add Guardrail Log (Permanent)
  if (!recipientEmail) {
    throw new Error("OTP attempted with no recipient email");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  // Save OTP to user
  user.emailOTP = hashedOTP;
  user.emailOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  user.emailOTPAttempts = 0;
  user.lastEmailOTPRequest = new Date();
  await user.save();

  console.log("🔥 ABOUT TO CALL SES SEND");

  try {
    await emailService.sendEmailVerificationOTP(user, otp);
    logger.logAuth('email_otp_sent', user._id, user.email, true);

    console.log("🔥 EMAIL SENT SUCCESSFULLY");

    res.json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent'
    });
  } catch (error) {
    console.log("🔥 EMAIL SEND FAILED:", error.message);
    
    // Clear OTP fields if email fails
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    user.emailOTPAttempts = 0;
    await user.save();

    logger.logAuth('email_otp_failed', user._id, user.email, false, { error: error.message });
    console.error('Failed to send email OTP:', error);
    
    // TASK L3: Prevent Silent Success - NEVER return 200 if email not sent
    const err = new Error('Failed to send OTP email. Please try again later.');
    err.statusCode = 500;
    throw err;
  }
});

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    const error = new Error('Email and OTP are required');
    error.statusCode = 400;
    throw error;
  }

  // Get user with OTP fields
  const user = await User.findOne({ email }).select('+emailOTP +emailOTPExpires +emailOTPAttempts +refreshToken');

  if (!user) {
    const error = new Error('Invalid email or OTP');
    error.statusCode = 400;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  // Check if OTP exists and not expired
  if (!user.emailOTP || !user.emailOTPExpires || user.emailOTPExpires < Date.now()) {
    const error = new Error('OTP has expired. Please request a new one');
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (user.emailOTPAttempts >= 3) {
    // Clear OTP fields
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    user.emailOTPAttempts = 0;
    await user.save();

    const error = new Error('Too many failed attempts. Please request a new OTP');
    error.statusCode = 429;
    throw error;
  }

  // Verify OTP
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  if (user.emailOTP !== hashedOTP) {
    // Increment attempt counter
    user.emailOTPAttempts += 1;
    await user.save();

    const error = new Error(`Invalid OTP. ${3 - user.emailOTPAttempts} attempts remaining`);
    error.statusCode = 400;
    throw error;
  }

  // Mark email as verified - THIS IS THE KEY FIX
  user.emailVerified = true;
  user.emailOTP = undefined;
  user.emailOTPExpires = undefined;
  user.emailOTPAttempts = 0;
  // Also clear any existing email verification token (fallback becomes inactive)
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  // CRITICAL: Invalidate existing refresh tokens for security
  user.refreshToken = undefined;
  
  await user.save();

  logger.logAuth('email_verified_via_otp', user._id, user.email, true);

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword: changePasswordWithOTP,
  requestPasswordChangeOTP,
  verifyEmail,
  resendVerificationEmail,
  sendEmailOTP,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  verifyEmailOTP,
  updateProfile
};
