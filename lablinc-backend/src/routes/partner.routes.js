const express = require('express');
const { body } = require('express-validator');
const { submitApplication, getApplications, updateApplicationStatus } = require('../controllers/partner.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { formLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Validation rules
const submitApplicationValidation = [
  body('instituteName').trim().notEmpty().withMessage('Institute name is required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('instrumentsAvailable').trim().notEmpty().withMessage('Please describe available instruments'),
  body('message').optional().trim()
];

const updateStatusValidation = [
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'contacted']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
];

// Public route - submit partner application
router.post('/', formLimiter, submitApplicationValidation, validate, submitApplication);

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), getApplications);
router.patch('/:id/status', authMiddleware, requireRole('admin'), updateStatusValidation, validate, updateApplicationStatus);

module.exports = router;
