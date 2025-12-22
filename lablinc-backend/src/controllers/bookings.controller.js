const Booking = require('../models/Booking');
const Instrument = require('../models/Instrument');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { calculateDays, isDateRangeValid } = require('../utils/date.utils');
const { generateInvoice, getInvoicePath } = require('../services/invoice.service');
const { notifyBookingCreated, notifyBookingConfirmed, notifyBookingCancelled, notifyBookingCompleted } = require('../services/notification.service');
const fs = require('fs');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (msme only)
const createBooking = asyncHandler(async (req, res) => {
  const { instrumentId, startDate, endDate, notes } = req.body;

  // Validate user role
  if (req.user.role !== 'msme') {
    const error = new Error('Only MSME users can create bookings');
    error.statusCode = 403;
    throw error;
  }

  // Validate dates
  if (!isDateRangeValid(startDate, endDate)) {
    const error = new Error('Invalid date range. End date must be after start date and dates must be in the future');
    error.statusCode = 400;
    throw error;
  }

  // Get instrument
  const instrument = await Instrument.findOne({ _id: instrumentId, status: 'active' });
  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if user is trying to book their own instrument
  if (instrument.owner.toString() === req.user.id.toString()) {
    const error = new Error('You cannot book your own instrument');
    error.statusCode = 400;
    throw error;
  }

  // Check for overlapping bookings
  const overlappingBookings = await Booking.find({
    instrument: instrumentId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  });

  if (overlappingBookings.length > 0) {
    const error = new Error('Instrument is not available for the selected dates');
    error.statusCode = 400;
    throw error;
  }

  // Calculate duration and pricing
  const days = calculateDays(startDate, endDate);
  let rateType = 'daily';
  let rate = instrument.pricing.daily || 0;
  let baseAmount = rate * days;

  // Optimize pricing based on duration
  if (days >= 30 && instrument.pricing.monthly) {
    rateType = 'monthly';
    rate = instrument.pricing.monthly;
    baseAmount = rate * Math.ceil(days / 30);
  } else if (days >= 7 && instrument.pricing.weekly) {
    rateType = 'weekly';
    rate = instrument.pricing.weekly;
    baseAmount = rate * Math.ceil(days / 7);
  }

  // Calculate complete pricing breakdown
  // Base amount + Security Deposit (10%) + GST (18%)
  const securityDeposit = Math.round(baseAmount * 0.10);
  const gst = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + securityDeposit + gst;

  // Get user details
  const user = await User.findById(req.user.id);
  const owner = await User.findById(instrument.owner);

  // Create booking
  const booking = await Booking.create({
    instrument: instrumentId,
    instrumentName: instrument.name,
    user: req.user.id,
    userName: req.user.name,
    owner: instrument.owner,
    ownerName: instrument.ownerName,
    startDate,
    endDate,
    duration: { days },
    pricing: { 
      rateType, 
      rate, 
      basePrice: baseAmount,
      securityDeposit,
      gst,
      totalAmount 
    },
    notes,
    agreementAccepted: true
  });

  // Generate invoice
  const { invoiceId } = await generateInvoice(booking, user, instrument);
  booking.invoiceId = invoiceId;
  await booking.save();

  // Send notification to owner
  await notifyBookingCreated(booking, user, instrument, owner);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: { booking }
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = {};

  // Filter based on role
  if (req.user.role === 'msme') {
    query.user = req.user.id;
  } else if (req.user.role === 'institute') {
    query.owner = req.user.id;
  } else if (req.user.role === 'admin') {
    // Admin can see all bookings
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate('instrument', 'name category photos')
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('instrument', 'name category photos location')
    .populate('user', 'name email organization phone')
    .populate('owner', 'name email organization phone');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check authorization
  const isAuthorized = 
    booking.user._id.toString() === req.user.id.toString() ||
    booking.owner._id.toString() === req.user.id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    const error = new Error('Not authorized to view this booking');
    error.statusCode = 403;
    throw error;
  }

  res.json({
    success: true,
    data: { booking }
  });
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (owner/admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check authorization (owner or admin)
  const isAuthorized = 
    booking.owner.toString() === req.user.id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    const error = new Error('Not authorized to update this booking');
    error.statusCode = 403;
    throw error;
  }

  // Validate status transition
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'];
  if (!validStatuses.includes(status)) {
    const error = new Error('Invalid status');
    error.statusCode = 400;
    throw error;
  }

  booking.status = status;
  await booking.save();

  // Send notifications based on status
  const user = await User.findById(booking.user);
  
  if (status === 'confirmed') {
    await notifyBookingConfirmed(booking, user);
  } else if (status === 'cancelled' || status === 'rejected') {
    await notifyBookingCancelled(booking, user);
  } else if (status === 'completed') {
    await notifyBookingCompleted(booking, user);
  }

  res.json({
    success: true,
    message: 'Booking status updated successfully',
    data: { booking }
  });
});

// @desc    Download invoice
// @route   GET /api/bookings/:id/invoice
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('instrument', 'name category location pricing')
    .populate('user', 'name email organization phone');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check authorization
  const isAuthorized = 
    booking.user._id.toString() === req.user.id.toString() ||
    booking.owner.toString() === req.user.id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    const error = new Error('Not authorized to download this invoice');
    error.statusCode = 403;
    throw error;
  }

  // If invoice doesn't exist or file is missing, regenerate it
  let invoicePath;
  if (!booking.invoiceId || !fs.existsSync(getInvoicePath(booking.invoiceId))) {
    console.log('Generating new invoice for booking:', booking._id);
    const { invoiceId } = await generateInvoice(booking, booking.user, booking.instrument);
    booking.invoiceId = invoiceId;
    await booking.save();
    invoicePath = getInvoicePath(invoiceId);
  } else {
    invoicePath = getInvoicePath(booking.invoiceId);
  }

  if (!fs.existsSync(invoicePath)) {
    const error = new Error('Invoice file could not be generated');
    error.statusCode = 500;
    throw error;
  }

  res.download(invoicePath, `${booking.invoiceId}.pdf`);
});

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  downloadInvoice
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (booking owner or admin)
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check authorization (booking user or admin)
  const isAuthorized = 
    booking.user.toString() === req.user.id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    const error = new Error('Not authorized to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  // Check if booking can be cancelled
  if (booking.status === 'completed') {
    const error = new Error('Cannot cancel a completed booking');
    error.statusCode = 400;
    throw error;
  }

  if (booking.status === 'cancelled') {
    const error = new Error('Booking is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  // Update status
  booking.status = 'cancelled';
  
  // Add to status history
  if (!booking.statusHistory) {
    booking.statusHistory = [];
  }
  booking.statusHistory.push({
    status: 'cancelled',
    changedBy: req.user.id,
    changedAt: new Date(),
    note: reason || 'Cancelled by user'
  });

  await booking.save();

  // Send notification
  const user = await User.findById(booking.user);
  await notifyBookingCancelled(booking, user);

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking }
  });
});

// @desc    Get upcoming bookings
// @route   GET /api/bookings/upcoming
// @access  Private
const getUpcomingBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let query = {
    startDate: { $gt: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  };

  // Filter based on role
  if (req.user.role === 'msme') {
    query.user = req.user.id;
  } else if (req.user.role === 'institute') {
    query.owner = req.user.id;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate('instrument', 'name category photos')
    .populate('user', 'name email organization')
    .populate('owner', 'name email organization')
    .sort({ startDate: 1 })
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

// @desc    Get booking history
// @route   GET /api/bookings/history
// @access  Private
const getBookingHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let query = {
    $or: [
      { status: 'completed' },
      { status: 'cancelled' },
      { endDate: { $lt: new Date() } }
    ]
  };

  // Filter based on role
  if (req.user.role === 'msme') {
    query.user = req.user.id;
  } else if (req.user.role === 'institute') {
    query.owner = req.user.id;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookings = await Booking.find(query)
    .populate('instrument', 'name category photos')
    .populate('user', 'name email organization')
    .populate('owner', 'name email organization')
    .sort({ endDate: -1 })
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

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private (booking user only)
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    const error = new Error('Rating must be between 1 and 5');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check authorization (only booking user can review)
  if (booking.user.toString() !== req.user.id.toString()) {
    const error = new Error('Only the booking user can add a review');
    error.statusCode = 403;
    throw error;
  }

  // Check if booking is completed
  if (booking.status !== 'completed') {
    const error = new Error('Can only review completed bookings');
    error.statusCode = 400;
    throw error;
  }

  // Check if Review model exists, if not we'll store it in a simple way
  // For now, we'll create a Review model reference
  const Review = require('../models/Review');
  
  // Check if review already exists
  const existingReview = await Review.findOne({
    booking: booking._id,
    user: req.user.id
  });

  if (existingReview) {
    const error = new Error('You have already reviewed this booking');
    error.statusCode = 400;
    throw error;
  }

  // Create review
  const review = await Review.create({
    user: req.user.id,
    instrument: booking.instrument,
    booking: booking._id,
    rating,
    comment: comment || ''
  });

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: { review }
  });
});

// @desc    Get booking timeline
// @route   GET /api/bookings/:id/timeline
// @access  Private
const getBookingTimeline = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('statusHistory.changedBy', 'name email');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Check authorization
  const isAuthorized = 
    booking.user.toString() === req.user.id.toString() ||
    booking.owner.toString() === req.user.id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    const error = new Error('Not authorized to view this booking timeline');
    error.statusCode = 403;
    throw error;
  }

  // Build timeline from status history and booking data
  const timeline = [
    {
      status: 'created',
      timestamp: booking.createdAt,
      note: 'Booking created'
    }
  ];

  // Add status history
  if (booking.statusHistory && booking.statusHistory.length > 0) {
    booking.statusHistory.forEach(history => {
      timeline.push({
        status: history.status,
        timestamp: history.changedAt,
        changedBy: history.changedBy,
        note: history.note
      });
    });
  }

  // Sort by timestamp
  timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.json({
    success: true,
    data: {
      booking: {
        id: booking._id,
        instrumentName: booking.instrumentName,
        currentStatus: booking.status
      },
      timeline
    }
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  downloadInvoice,
  cancelBooking,
  getUpcomingBookings,
  getBookingHistory,
  addReview,
  getBookingTimeline
};
