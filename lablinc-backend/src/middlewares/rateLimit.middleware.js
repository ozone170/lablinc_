const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased for development
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

// Strict limiter for public forms
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, message: 'Too many submissions, please try again later.' }
});

// OTP generation rate limiter - prevents spam
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 OTP requests per minute per IP
  message: { 
    success: false, 
    message: 'Too many OTP requests. Please wait before requesting another code.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email-based OTP limiter (more restrictive)
const emailOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 OTP requests per 5 minutes per IP
  message: { 
    success: false, 
    message: 'Too many OTP requests for email verification. Please wait before trying again.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { 
  apiLimiter, 
  authLimiter, 
  formLimiter, 
  otpLimiter, 
  emailOtpLimiter 
};
