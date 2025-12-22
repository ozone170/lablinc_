const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getPreferences,
  updatePreferences
} = require('../controllers/notifications.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/clear-all', clearAllNotifications);

// Get preferences
router.get('/preferences', getPreferences);

// Update preferences
router.put('/preferences', updatePreferences);

module.exports = router;
