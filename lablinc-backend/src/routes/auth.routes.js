const express = require('express');
const { body, query } = require('express-validator');
const { 
  register, 
  login, 
  refresh, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  verifyEmail,
  updateProfile
} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['msme', 'institute']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('organization').optional().trim(),
  body('address').optional().trim()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('organization').optional().trim(),
  body('address').optional().trim()
];

const verifyEmailValidation = [
  query('token').notEmpty().withMessage('Verification token is required')
];

// Routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', refreshValidation, validate, refresh);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateProfileValidation, validate, updateProfile);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, resetPassword);
router.post('/change-password', authMiddleware, changePasswordValidation, validate, changePassword);
router.get('/verify-email', verifyEmailValidation, validate, verifyEmail);

module.exports = router;
