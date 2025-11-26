const User = require('../models/User');
const Instrument = require('../models/Instrument');
const Booking = require('../models/Booking');
const PartnerApplication = require('../models/PartnerApplication');
const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { getPlatformAnalytics } = require('../services/analytics.service');

// ============ USER MANAGEMENT ============

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

module.exports = {
  getUsers,
  updateUserStatus,
  getInstruments,
  toggleInstrumentFeature,
  getBookings,
  updateBooking,
  getAnalytics,
  getPartnerApplications,
  updatePartnerApplication,
  getContactMessages,
  updateContactMessage
};
