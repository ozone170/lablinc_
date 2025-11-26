const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware);
router.use(requireRole('admin'));

// Validation rules
const updateUserStatusValidation = [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
];

const updateBookingValidation = [
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']).withMessage('Invalid status'),
  body('notes').optional().trim()
];

const updatePartnerValidation = [
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'contacted']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
];

const updateContactValidation = [
  body('status').optional().isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
];

// User management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatusValidation, validate, updateUserStatus);

// Instrument management
router.get('/instruments', getInstruments);
router.patch('/instruments/:id/feature', toggleInstrumentFeature);

// Booking management
router.get('/bookings', getBookings);
router.patch('/bookings/:id', updateBookingValidation, validate, updateBooking);
router.get('/bookings/:id/invoice', require('../controllers/bookings.controller').downloadInvoice);

// Analytics
router.get('/analytics', getAnalytics);

// Partner applications
router.get('/partners', getPartnerApplications);
router.patch('/partners/:id', updatePartnerValidation, validate, updatePartnerApplication);

// Contact messages
router.get('/contacts', getContactMessages);
router.patch('/contacts/:id', updateContactValidation, validate, updateContactMessage);

module.exports = router;
