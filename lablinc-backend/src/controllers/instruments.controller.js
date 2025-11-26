const Instrument = require('../models/Instrument');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all instruments
// @route   GET /api/instruments
// @access  Public
const getInstruments = asyncHandler(async (req, res) => {
  const { search, category, availability, page = 1, limit = 10 } = req.query;

  const query = { status: 'active' };

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Availability filter
  if (availability) {
    query.availability = availability;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const instruments = await Instrument.find(query)
    .select('-__v')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ featured: -1, createdAt: -1 });

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

// @desc    Get single instrument
// @route   GET /api/instruments/:id
// @access  Public
const getInstrument = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findOne({
    _id: req.params.id,
    status: 'active'
  }).populate('owner', 'name email organization');

  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: { instrument }
  });
});

// @desc    Check instrument availability
// @route   GET /api/instruments/:id/availability
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const Booking = require('../models/Booking');

  const instrument = await Instrument.findById(req.params.id);

  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  // Check for overlapping bookings
  const overlappingBookings = await Booking.find({
    instrument: req.params.id,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  });

  const isAvailable = overlappingBookings.length === 0 && instrument.availability === 'available';

  res.json({
    success: true,
    data: {
      available: isAvailable,
      instrumentStatus: instrument.availability,
      conflictingBookings: overlappingBookings.length
    }
  });
});

// @desc    Create instrument
// @route   POST /api/instruments
// @access  Private (institute/admin)
const createInstrument = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    specifications,
    pricing,
    location,
    photos,
    videos
  } = req.body;

  const { isValidUrl } = require('../utils/url');

  // Normalize photos/videos to arrays
  const photoUrls = Array.isArray(photos) ? photos : photos ? [photos] : [];
  const videoUrls = Array.isArray(videos) ? videos : videos ? [videos] : [];

  // Filter out empty strings and validate URLs
  const validPhotos = photoUrls.filter(url => url && url.trim() !== '');
  const validVideos = videoUrls.filter(url => url && url.trim() !== '');

  // Validate URLs (optional but recommended)
  const invalidPhoto = validPhotos.find(u => !isValidUrl(u));
  const invalidVideo = validVideos.find(u => !isValidUrl(u));

  if (invalidPhoto) {
    const error = new Error(`Invalid photo URL: ${invalidPhoto}`);
    error.statusCode = 400;
    throw error;
  }

  if (invalidVideo) {
    const error = new Error(`Invalid video URL: ${invalidVideo}`);
    error.statusCode = 400;
    throw error;
  }

  const instrument = await Instrument.create({
    name,
    description,
    category,
    specifications,
    pricing,
    location,
    photos: validPhotos,
    videos: validVideos,
    owner: req.user.id,
    ownerName: req.user.name
  });

  res.status(201).json({
    success: true,
    message: 'Instrument created successfully',
    data: { instrument }
  });
});

// @desc    Update instrument
// @route   PUT /api/instruments/:id
// @access  Private (owner/admin)
const updateInstrument = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);

  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership (owner or admin)
  if (instrument.owner.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    const error = new Error('Not authorized to update this instrument');
    error.statusCode = 403;
    throw error;
  }

  const {
    name,
    description,
    category,
    specifications,
    pricing,
    availability,
    location,
    photos,
    videos
  } = req.body;

  const { isValidUrl } = require('../utils/url');

  // Handle photos update
  if (photos !== undefined) {
    const photoUrls = Array.isArray(photos) ? photos : [photos];
    const validPhotos = photoUrls.filter(url => url && url.trim() !== '');
    const invalidPhoto = validPhotos.find(u => !isValidUrl(u));
    
    if (invalidPhoto) {
      const error = new Error(`Invalid photo URL: ${invalidPhoto}`);
      error.statusCode = 400;
      throw error;
    }
    
    instrument.photos = validPhotos;
  }

  // Handle videos update
  if (videos !== undefined) {
    const videoUrls = Array.isArray(videos) ? videos : [videos];
    const validVideos = videoUrls.filter(url => url && url.trim() !== '');
    const invalidVideo = validVideos.find(u => !isValidUrl(u));
    
    if (invalidVideo) {
      const error = new Error(`Invalid video URL: ${invalidVideo}`);
      error.statusCode = 400;
      throw error;
    }
    
    instrument.videos = validVideos;
  }

  // Update other fields
  if (name) instrument.name = name;
  if (description) instrument.description = description;
  if (category) instrument.category = category;
  if (specifications) instrument.specifications = specifications;
  if (pricing) instrument.pricing = pricing;
  if (availability) instrument.availability = availability;
  if (location) instrument.location = location;

  await instrument.save();

  res.json({
    success: true,
    message: 'Instrument updated successfully',
    data: { instrument }
  });
});

// @desc    Delete instrument (soft delete)
// @route   DELETE /api/instruments/:id
// @access  Private (owner/admin)
const deleteInstrument = asyncHandler(async (req, res) => {
  const instrument = await Instrument.findById(req.params.id);

  if (!instrument) {
    const error = new Error('Instrument not found');
    error.statusCode = 404;
    throw error;
  }

  // Check ownership (owner or admin)
  if (instrument.owner.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    const error = new Error('Not authorized to delete this instrument');
    error.statusCode = 403;
    throw error;
  }

  // Soft delete
  instrument.status = 'deleted';
  await instrument.save();

  res.json({
    success: true,
    message: 'Instrument deleted successfully'
  });
});

module.exports = {
  getInstruments,
  getInstrument,
  checkAvailability,
  createInstrument,
  updateInstrument,
  deleteInstrument
};
