const express = require('express');
const { body } = require('express-validator');
const { submitMessage, getMessages, updateMessageStatus } = require('../controllers/contact.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { formLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Validation rules
const submitMessageValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

const updateStatusValidation = [
  body('status').optional().isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
];

// Public route - submit contact message
router.post('/', formLimiter, submitMessageValidation, validate, submitMessage);

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), getMessages);
router.patch('/:id/status', authMiddleware, requireRole('admin'), updateStatusValidation, validate, updateMessageStatus);

module.exports = router;
