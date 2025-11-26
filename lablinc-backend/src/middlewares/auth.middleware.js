const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    throw error;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('User account is not active');
      error.statusCode = 403;
      throw error;
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      const error = new Error('Invalid token');
      error.statusCode = 401;
      throw error;
    }
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Token expired');
      error.statusCode = 401;
      throw error;
    }
    throw err;
  }
});

module.exports = authMiddleware;
