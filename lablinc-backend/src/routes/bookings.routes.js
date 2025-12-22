const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/bookings.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('instrumentId').notEmpty().withMessage('Instrument ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('notes').optional().trim()
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected'])
    .withMessage('Invalid status')
];

// All routes require authentication
router.use(authMiddleware);

// Create booking (MSME only)
router.post('/', requireRole('msme'), createBookingValidation, validate, createBooking);

// Get user's bookings
router.get('/my', getMyBookings);

// Get single booking
router.get('/:id', getBooking);

// Update booking status (owner/admin)
router.patch('/:id/status', requireRole('institute', 'admin'), updateStatusValidation, validate, updateBookingStatus);

// Download invoice
router.get('/:id/invoice', downloadInvoice);

// Cancel booking
router.patch('/:id/cancel', cancelBooking);

// Get upcoming bookings
router.get('/upcoming', getUpcomingBookings);

// Get booking history
router.get('/history', getBookingHistory);

// Add review
router.post('/:id/review', addReview);

// Get booking timeline
router.get('/:id/timeline', getBookingTimeline);

module.exports = router;
