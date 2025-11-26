const { body, query, param } = require('express-validator');

/**
 * Common validation rules
 */
const commonValidations = {
  mongoId: param('id').isMongoId().withMessage('Invalid ID format'),
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  phone: body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number format'),

  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  status: body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status')
};

/**
 * Auth validation schemas
 */
const authValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['msme', 'institute'])
      .withMessage('Invalid role'),
    commonValidations.phone,
    body('organization').optional().trim(),
    body('address').optional().trim()
  ],

  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required')
  ],

  refresh: [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ]
};

/**
 * Instrument validation schemas
 */
const instrumentValidations = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Instrument name is required')
      .isLength({ max: 200 })
      .withMessage('Name too long'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 2000 })
      .withMessage('Description too long'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required'),
    body('pricing')
      .isObject()
      .withMessage('Pricing information is required'),
    body('pricing.hourly')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Hourly rate must be a positive number'),
    body('pricing.daily')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Daily rate must be a positive number'),
    body('pricing.weekly')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Weekly rate must be a positive number'),
    body('pricing.monthly')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monthly rate must be a positive number')
  ],

  query: [
    query('search').optional().trim().isLength({ max: 100 }),
    query('category').optional().trim(),
    query('availability').optional().isIn(['available', 'booked', 'maintenance', 'unavailable']),
    ...commonValidations.pagination
  ]
};

/**
 * Booking validation schemas
 */
const bookingValidations = {
  create: [
    body('instrumentId')
      .notEmpty()
      .withMessage('Instrument ID is required')
      .isMongoId()
      .withMessage('Invalid instrument ID'),
    body('startDate')
      .isISO8601()
      .withMessage('Valid start date is required')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Start date must be in the future');
        }
        return true;
      }),
    body('endDate')
      .isISO8601()
      .withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes too long')
  ],

  updateStatus: [
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected'])
      .withMessage('Invalid status')
  ]
};

/**
 * Partner validation schemas
 */
const partnerValidations = {
  submit: [
    body('instituteName')
      .trim()
      .notEmpty()
      .withMessage('Institute name is required')
      .isLength({ max: 200 })
      .withMessage('Institute name too long'),
    body('contactPerson')
      .trim()
      .notEmpty()
      .withMessage('Contact person is required')
      .isLength({ max: 100 })
      .withMessage('Contact person name too long'),
    commonValidations.email,
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid phone number format'),
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Address is required')
      .isLength({ max: 500 })
      .withMessage('Address too long'),
    body('instrumentsAvailable')
      .trim()
      .notEmpty()
      .withMessage('Please describe available instruments')
      .isLength({ max: 2000 })
      .withMessage('Description too long'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Message too long')
  ]
};

/**
 * Contact validation schemas
 */
const contactValidations = {
  submit: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.phone,
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 200 })
      .withMessage('Subject too long'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 2000 })
      .withMessage('Message too long')
  ]
};

module.exports = {
  commonValidations,
  authValidations,
  instrumentValidations,
  bookingValidations,
  partnerValidations,
  contactValidations
};
