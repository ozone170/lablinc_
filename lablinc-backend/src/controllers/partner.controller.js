const PartnerApplication = require('../models/PartnerApplication');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit partner application
// @route   POST /api/partner
// @access  Public
const submitApplication = asyncHandler(async (req, res) => {
  const {
    instituteName,
    contactPerson,
    email,
    phone,
    address,
    instrumentsAvailable,
    message
  } = req.body;

  // Check for duplicate application
  const existingApplication = await PartnerApplication.findOne({
    email,
    status: { $in: ['pending', 'approved', 'contacted'] }
  });

  if (existingApplication) {
    const error = new Error('An application with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  const application = await PartnerApplication.create({
    instituteName,
    contactPerson,
    email,
    phone,
    address,
    instrumentsAvailable,
    message
  });

  res.status(201).json({
    success: true,
    message: 'Partner application submitted successfully. We will contact you soon!',
    data: { application }
  });
});

// @desc    Get all partner applications (admin only - handled in admin controller)
// @route   GET /api/partner
// @access  Private (admin)
const getApplications = asyncHandler(async (req, res) => {
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

// @desc    Update partner application status (admin only - handled in admin controller)
// @route   PATCH /api/partner/:id/status
// @access  Private (admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
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

module.exports = {
  submitApplication,
  getApplications,
  updateApplicationStatus
};
