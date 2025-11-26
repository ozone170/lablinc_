const express = require('express');
const { body } = require('express-validator');
const {
  getInstruments,
  getInstrument,
  checkAvailability,
  createInstrument,
  updateInstrument,
  deleteInstrument
} = require('../controllers/instruments.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation rules
const createInstrumentValidation = [
  body('name').trim().notEmpty().withMessage('Instrument name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('pricing').isObject().withMessage('Pricing information is required')
];

// Public routes
router.get('/', getInstruments);
router.get('/:id', getInstrument);
router.get('/:id/availability', checkAvailability);

// Protected routes (institute/admin only)
router.post(
  '/',
  authMiddleware,
  requireRole('institute', 'admin'),
  createInstrumentValidation,
  validate,
  createInstrument
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('institute', 'admin'),
  updateInstrument
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('institute', 'admin'),
  deleteInstrument
);

module.exports = router;
