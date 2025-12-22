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
  updateContactMessage,
  deleteUser,
  resetUserPassword,
  getRevenueReport,
  getUsageReport,
  getAuditLogs,
  deleteInstrument,
  sendBroadcast
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

// Delete user
router.delete('/users/:id', deleteUser);

// Reset user password
router.post('/users/:id/reset-password', resetUserPassword);

// Reports
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/usage', getUsageReport);

// Audit logs
router.get('/logs', getAuditLogs);

// Delete instrument (hard delete)
router.delete('/instruments/:id', deleteInstrument);

// Broadcast notification
router.post('/broadcast', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('roles').optional().isArray().withMessage('Roles must be an array'),
  body('userIds').optional().isArray().withMessage('User IDs must be an array')
], validate, sendBroadcast);

module.exports = router;
