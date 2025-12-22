const express = require('express');
const { body } = require('express-validator');
const {
  getInstruments,
  getInstrument,
  checkAvailability,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  getFeaturedInstruments,
  getCategories,
  getMyInstruments,
  updateInstrumentStatus,
  uploadPhotos,
  deletePhoto
} = require('../controllers/instruments.controller');
const { multiple } = require('../middlewares/upload.middleware');
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
router.get('/featured', getFeaturedInstruments);
router.get('/categories', getCategories);
router.get('/:id', getInstrument);
router.get('/:id/availability', checkAvailability);

// Protected routes - my instruments
router.get('/my', authMiddleware, getMyInstruments);

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

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('institute', 'admin'),
  updateInstrumentStatus
);

// Photo upload routes
router.post(
  '/:id/photos',
  authMiddleware,
  requireRole('institute', 'admin'),
  multiple('images', 5),
  uploadPhotos
);

router.delete(
  '/:id/photos/:photoId',
  authMiddleware,
  requireRole('institute', 'admin'),
  deletePhoto
);

module.exports = router;
