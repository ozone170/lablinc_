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
  let totalAmount = rate * days;

  // Optimize pricing based on duration
  if (days >= 30 && instrument.pricing.monthly) {
    rateType = 'monthly';
    rate = instrument.pricing.monthly;
    totalAmount = rate * Math.ceil(days / 30);
  } else if (days >= 7 && instrument.pricing.weekly) {
    rateType = 'weekly';
    rate = instrument.pricing.weekly;
    totalAmount = rate * Math.ceil(days / 7);
  }

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
    pricing: { rateType, rate, totalAmount },
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
  const booking = await Booking.findById(req.params.id);

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
    const error = new Error('Not authorized to download this invoice');
    error.statusCode = 403;
    throw error;
  }

  if (!booking.invoiceId) {
    const error = new Error('Invoice not found for this booking');
    error.statusCode = 404;
    throw error;
  }

  const invoicePath = getInvoicePath(booking.invoiceId);

  if (!fs.existsSync(invoicePath)) {
    const error = new Error('Invoice file not found');
    error.statusCode = 404;
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
