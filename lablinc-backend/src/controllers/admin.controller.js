const User = require('../models/User');
const Instrument = require('../models/Instrument');
const Booking = require('../models/Booking');
const PartnerApplication = require('../models/PartnerApplication');
const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { getPlatformAnalytics } = require('../services/analytics.service');
const bcrypt = require('bcryptjs');

// ============ USER MANAGEMENT ============

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, organization, phone, status } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  // Validate role - allow admin creation
  const allowedRoles = ['msme', 'institute', 'admin'];
  if (role && !allowedRoles.includes(role)) {
    const error = new Error('Invalid role specified');
    error.statusCode = 400;
    throw error;
  }

  // Create user (password will be hashed by pre-save middleware)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'msme',
    organization,
    phone,
    status: status || 'active',
    emailVerified: true // Admin created users are auto-verified
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user: userResponse }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent admin from changing their own status
  if (user._id.toString() === req.user.id.toString()) {
    const error = new Error('Cannot change your own status');
    error.statusCode = 400;
    throw error;
  }

  user.status = status;
  await user.save();

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: { user }
  });
});

// ============ INSTRUMENT MANAGEMENT ============

// @desc    Create new instrument
// @route   POST /api/admin/instruments
// @access  Private (admin)
const createInstrument = asyncHandler(async (req, res) => {
  const { 
    name, 
    description, 
    category, 
    location, 
    pricing, 
    specifications, 
    status, 
    featured 
  } = req.body;

  // Create instrument with admin as owner
  const instrument = await Instrument.create({
    name,
    description,
    category,
    location,
    pricing: {
      hourly: pricing?.hourly || null,
      daily: pricing?.daily || null,
      weekly: pricing?.weekly || null,
      monthly: pricing?.monthly || null
    },
    specifications,
    status: status || 'available',
    featured: featured || false,
    owner: req.user.id, // Admin becomes the owner
    availability: 'available'
  });

  await instrument.populate('owner', 'name email organization');

  res.status(201).json({
    success: true,
    message: 'Instrument created successfully',
    data: { instrument }
  });
});

// @desc    Get categories
// @route   GET /api/admin/categories
// @access  Private (admin)
const getCategories = asyncHandler(async (req, res) => {
  // Get unique categories from existing instruments
  const categories = await Instrument.distinct('category', { 
    status: 'active', 
    deletedAt: null 
  });

  // Add default categories if none exist
  const defaultCategories = [
    'CNC Machines',
    '3D Printers', 
    'Electronics',
    'Mechanical',
    'Material Testing',
    'GPU Workstations',
    'AI Servers',
    'Civil',
    'Environmental',
    'Prototyping'
  ];

  const allCategories = [...new Set([...categories, ...defaultCategories])];

  res.json({
    success: true,
    data: allCategories
  });
});

// @desc    Get all instruments (admin view)
// @route   GET /api/admin/instruments
// @access  Private (admin)
const getInstruments = asyncHandler(async (req, res) => {
  const { status, category, featured, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const instruments = await Instrument.find(query)
    .populate('owner', 'name email organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Instrument.countDocuments(query);

  res.json({
    success: true,
    data: {
      instruments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Toggle instrument featured status
// @route   PATCH /api/admin/instruments/:id/feature
// @access  Private (admin)
const toggleInstrumentFeature = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);

  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  instrument.featured = !instrument.featured;
  await instrument.save();

  res.json({
    success: true,
    message: `Instrument ${instrument.featured ? 'featured' : 'unfeatured'} successfully`,
    data: { instrument }
  });
});

// ============ BOOKING MANAGEMENT ============

// @desc    Create new booking
// @route   POST /api/admin/bookings
// @access  Private (admin)
const createBooking = asyncHandler(async (req, res) => {
  const { 
    userId, 
    instrumentId, 
    startDate, 
    endDate, 
    startTime, 
    endTime, 
    purpose, 
    notes, 
    status,
    totalAmount 
  } = req.body;

  // Validate user exists
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate instrument exists and is available
  const instrument = await Instrument.findById(instrumentId);
  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  // Check for conflicting bookings
  const conflictingBooking = await Booking.findOne({
    instrument: instrumentId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      }
    ]
  });

  if (conflictingBooking) {
    const error = new Error('Instrument is already booked for the selected dates');
    error.statusCode = 400;
    throw error;
  }

  // Calculate pricing if not provided
  let calculatedAmount = totalAmount;
  if (!calculatedAmount) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (instrument.pricing?.daily) {
      calculatedAmount = instrument.pricing.daily * diffDays;
    } else if (instrument.pricing?.hourly) {
      calculatedAmount = instrument.pricing.hourly * 8 * diffDays;
    } else {
      calculatedAmount = 0;
    }
  }

  // Create booking
  const booking = await Booking.create({
    user: userId,
    instrument: instrumentId,
    owner: instrument.owner,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    startTime,
    endTime,
    purpose,
    notes,
    status: status || 'pending',
    pricing: {
      totalAmount: calculatedAmount,
      currency: 'INR'
    },
    instrumentName: instrument.name,
    userName: user.name,
    userEmail: user.email,
    statusHistory: [{
      status: status || 'pending',
      changedAt: new Date(),
      changedBy: req.user.id,
      note: 'Booking created by admin'
    }]
  });

  await booking.populate([
    { path: 'user', select: 'name email organization' },
    { path: 'instrument', select: 'name category' },
    { path: 'owner', select: 'name email organization' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: { booking }
  });
});

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private (admin)
const getBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate('instrument', 'name category')
    .populate('user', 'name email organization')
    .populate('owner', 'name email organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Update booking (admin override)
// @route   PATCH /api/admin/bookings/:id
// @access  Private (admin)
const updateBooking = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (status) booking.status = status;
  if (notes !== undefined) booking.notes = notes;

  await booking.save();

  res.json({
    success: true,
    message: 'Booking updated successfully',
    data: { booking }
  });
});

// ============ ANALYTICS ============

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getPlatformAnalytics();

  res.json({
    success: true,
    data: analytics
  });
});

// ============ PARTNER APPLICATIONS ============

// @desc    Get partner applications
// @route   GET /api/admin/partners
// @access  Private (admin)
const getPartnerApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const applications = await PartnerApplication.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await PartnerApplication.countDocuments(query);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Update partner application status
// @route   PATCH /api/admin/partners/:id
// @access  Private (admin)
const updatePartnerApplication = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const application = await PartnerApplication.findById(req.params.id);

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  if (status) application.status = status;
  if (adminNotes !== undefined) application.adminNotes = adminNotes;

  await application.save();

  res.json({
    success: true,
    message: 'Application updated successfully',
    data: { application }
  });
});

// ============ CONTACT MESSAGES ============

// @desc    Get contact messages
// @route   GET /api/admin/contacts
// @access  Private (admin)
const getContactMessages = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await ContactMessage.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ContactMessage.countDocuments(query);

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Update contact message status
// @route   PATCH /api/admin/contacts/:id
// @access  Private (admin)
const updateContactMessage = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    const error = new Error('Message not found');
    error.statusCode = 404;
    throw error;
  }

  if (status) message.status = status;
  if (adminNotes !== undefined) message.adminNotes = adminNotes;

  await message.save();

  res.json({
    success: true,
    message: 'Contact message updated successfully',
    data: { message }
  });
});

// @desc    Delete user (hard delete or deactivate)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const { reason, hardDelete } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user.id.toString()) {
    const error = new Error('Cannot delete your own account');
    error.statusCode = 400;
    throw error;
  }

  if (hardDelete === true) {
    // Hard delete - remove from database
    await user.deleteOne();
    res.json({
      success: true,
      message: 'User permanently deleted'
    });
  } else {
    // Soft delete - deactivate
    user.status = 'inactive';
    user.deactivationReason = reason || 'Deactivated by admin';
    user.deactivatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  }
});

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (admin)
const resetUserPassword = asyncHandler(async (req, res) => {
  const crypto = require('crypto');
  const emailService = require('../services/email.service');

  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save to user
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  try {
    // Send email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'Password reset link sent to user email'
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

// @desc    Verify user email (admin override)
// @route   PATCH /api/admin/users/:id/verify-email
// @access  Private (admin)
const verifyUserEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.emailVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  // Mark email as verified
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  // Clear any OTP fields
  user.emailOTP = undefined;
  user.emailOTPExpires = undefined;
  user.emailOTPAttempts = 0;
  
  // Invalidate refresh tokens for security
  user.refreshToken = undefined;
  
  await user.save();

  // Log the admin action
  const logger = require('../utils/logger');
  logger.logAuth('admin_email_verification_override', user._id, user.email, true, { 
    adminId: req.user.id,
    adminEmail: req.user.email 
  });

  res.json({
    success: true,
    message: 'User email verified successfully',
    data: { 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    }
  });
});

// @desc    Get revenue report
// @route   GET /api/admin/reports/revenue
// @access  Private (admin)
const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'month' } = req.query;

  const matchStage = {
    status: { $in: ['confirmed', 'completed'] }
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Aggregate revenue by time period
  let groupByFormat;
  switch (groupBy) {
    case 'day':
      groupByFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case 'week':
      groupByFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
      break;
    case 'year':
      groupByFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      break;
    default: // month
      groupByFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  }

  const revenueData = await Booking.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupByFormat,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        bookingCount: { $sum: 1 },
        averageBookingValue: { $avg: '$pricing.totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Calculate totals
  const totals = await Booking.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        totalBookings: { $sum: 1 },
        averageBookingValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      revenueByPeriod: revenueData,
      totals: totals[0] || { totalRevenue: 0, totalBookings: 0, averageBookingValue: 0 }
    }
  });
});

// @desc    Get usage statistics
// @route   GET /api/admin/reports/usage
// @access  Private (admin)
const getUsageReport = asyncHandler(async (req, res) => {
  // Get counts
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const msmeUsers = await User.countDocuments({ role: 'msme' });
  const instituteUsers = await User.countDocuments({ role: 'institute' });

  const totalInstruments = await Instrument.countDocuments({ status: 'active', deletedAt: null });
  const availableInstruments = await Instrument.countDocuments({ 
    status: 'active', 
    availability: 'available',
    deletedAt: null 
  });

  const totalBookings = await Booking.countDocuments();
  const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } });
  const completedBookings = await Booking.countDocuments({ status: 'completed' });

  // Get recent activity
  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('instrumentName userName status createdAt');

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email role createdAt');

  // Category distribution
  const categoryDistribution = await Instrument.aggregate([
    { $match: { status: 'active', deletedAt: null } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        msme: msmeUsers,
        institute: instituteUsers
      },
      instruments: {
        total: totalInstruments,
        available: availableInstruments,
        categoryDistribution
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings
      },
      recentActivity: {
        bookings: recentBookings,
        users: recentUsers
      }
    }
  });
});

// @desc    Get audit logs
// @route   GET /api/admin/logs
// @access  Private (admin)
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, entityType } = req.query;

  // For now, we'll return booking status history as logs
  // In Phase 2, we'll implement a proper AuditLog model
  const query = {};
  
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get bookings with status history
  const bookings = await Booking.find({ 'statusHistory.0': { $exists: true } })
    .populate('statusHistory.changedBy', 'name email')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Flatten status history into log entries
  const logs = [];
  bookings.forEach(booking => {
    if (booking.statusHistory) {
      booking.statusHistory.forEach(history => {
        logs.push({
          entityType: 'Booking',
          entityId: booking._id,
          action: `status_changed_to_${history.status}`,
          actor: history.changedBy,
          timestamp: history.changedAt,
          metadata: {
            bookingId: booking._id,
            instrumentName: booking.instrumentName,
            status: history.status,
            note: history.note
          }
        });
      });
    }
  });

  // Sort by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length
      }
    }
  });
});

// @desc    Delete instrument (hard delete)
// @route   DELETE /api/admin/instruments/:id
// @access  Private (admin)
const deleteInstrument = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);

  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  // Check for active bookings
  const activeBookings = await Booking.countDocuments({
    instrument: req.params.id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (activeBookings > 0) {
    const error = new Error(`Cannot delete instrument with ${activeBookings} active booking(s)`);
    error.statusCode = 400;
    throw error;
  }

  // Hard delete
  await instrument.deleteOne();

  res.json({
    success: true,
    message: 'Instrument permanently deleted'
  });
});

// @desc    Send broadcast notification
// @route   POST /api/admin/broadcast
// @access  Private (admin)
const sendBroadcast = asyncHandler(async (req, res) => {
  const { title, message, roles, userIds } = req.body;

  if (!title || !message) {
    const error = new Error('Title and message are required');
    error.statusCode = 400;
    throw error;
  }

  const Notification = require('../models/Notification');

  let recipients = [];

  // Get recipients based on roles or specific user IDs
  if (userIds && userIds.length > 0) {
    recipients = await User.find({ _id: { $in: userIds }, status: 'active' });
  } else if (roles && roles.length > 0) {
    recipients = await User.find({ role: { $in: roles }, status: 'active' });
  } else {
    // Send to all active users
    recipients = await User.find({ status: 'active' });
  }

  if (recipients.length === 0) {
    const error = new Error('No recipients found');
    error.statusCode = 400;
    throw error;
  }

  // Create notifications for all recipients
  const notifications = recipients.map(user => ({
    recipient: user._id,
    sender: req.user.id,
    type: 'system',
    title,
    message,
    read: false
  }));

  await Notification.insertMany(notifications);

  res.json({
    success: true,
    message: `Broadcast sent to ${recipients.length} user(s)`,
    data: {
      recipientCount: recipients.length
    }
  });
});

module.exports = {
  createUser,
  getUsers,
  updateUserStatus,
  verifyUserEmail,
  createInstrument,
  getCategories,
  getInstruments,
  toggleInstrumentFeature,
  createBooking,
  getBookings,
  updateBooking,
  getAnalytics,
  getPartnerApplications,
  updatePartnerApplication,
  getContactMessages,
  updateContactMessage,
  deleteUser,
  resetUserPassword,
  getRevenueReport,
  getUsageReport,
  getAuditLogs,
  deleteInstrument,
  sendBroadcast
};
