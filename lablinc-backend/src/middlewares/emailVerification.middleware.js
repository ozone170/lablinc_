const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Middleware to check if user's email is verified for protected routes
const requireEmailVerification = asyncHandler(async (req, res, next) => {
  // This middleware should run after authMiddleware
  if (!req.user || !req.user.id) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    throw error;
  }

  // Get full user data to check email verification status
  const user = await User.findById(req.user.id).select('emailVerified');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error('Email verification required. Please verify your email address to access this feature.');
    error.statusCode = 403;
    error.code = 'EMAIL_NOT_VERIFIED';
    throw error;
  }

  next();
});

// Middleware that allows access but adds verification status to request
const checkEmailVerification = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.id) {
    const user = await User.findById(req.user.id).select('emailVerified');
    req.user.emailVerified = user ? user.emailVerified : false;
  }
  next();
});

module.exports = {
  requireEmailVerification,
  checkEmailVerification
};