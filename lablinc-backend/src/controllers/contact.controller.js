const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const contactMessage = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully. We will get back to you soon!',
    data: { contactMessage }
  });
});

// @desc    Get all contact messages (admin only - handled in admin controller)
// @route   GET /api/contact
// @access  Private (admin)
const getMessages = asyncHandler(async (req, res) => {
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

// @desc    Update contact message status (admin only - handled in admin controller)
// @route   PATCH /api/contact/:id/status
// @access  Private (admin)
const updateMessageStatus = asyncHandler(async (req, res) => {
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
  submitMessage,
  getMessages,
  updateMessageStatus
};
