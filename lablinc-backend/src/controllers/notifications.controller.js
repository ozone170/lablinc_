const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'name')
    .populate('relatedBooking', 'instrumentName status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments({ recipient: req.user.id });
  const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

  // Set cache headers for notifications list (cache for 1 minute)
  res.set({
    'Cache-Control': 'private, max-age=60',
    'ETag': `"notifications-${req.user.id}-${Date.now()}"`,
    'Last-Modified': new Date().toUTCString()
  });

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    read: false
  });

  // Set aggressive caching for unread count (cache for 2 minutes)
  res.set({
    'Cache-Control': 'private, max-age=120, stale-while-revalidate=60',
    'ETag': `"unread-${req.user.id}-${count}"`,
    'Last-Modified': new Date().toUTCString()
  });

  // Check if client has cached version
  const clientETag = req.get('If-None-Match');
  const expectedETag = `"unread-${req.user.id}-${count}"`;
  
  if (clientETag === expectedETag) {
    return res.status(304).end(); // Not Modified
  }

  res.json({
    success: true,
    data: { count }
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  notification.read = true;
  await notification.save();

  // Clear cache after marking as read
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { read: true }
  );

  // Clear cache after marking all as read
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  await notification.deleteOne();

  // Clear cache after deletion
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ recipient: req.user.id });

  // Clear cache after clearing all
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.json({
    success: true,
    message: `${result.deletedCount} notifications cleared successfully`
  });
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getPreferences = asyncHandler(async (req, res) => {
  const UserSettings = require('../models/UserSettings');
  
  let settings = await UserSettings.findOne({ user: req.user.id });

  // Create default settings if not exists
  if (!settings) {
    settings = await UserSettings.create({ user: req.user.id });
  }

  // Cache preferences for 5 minutes
  res.set({
    'Cache-Control': 'private, max-age=300',
    'ETag': `"prefs-${req.user.id}-${settings.updatedAt.getTime()}"`,
    'Last-Modified': settings.updatedAt.toUTCString()
  });

  res.json({
    success: true,
    data: {
      preferences: settings.notificationPreferences,
      language: settings.language,
      theme: settings.theme
    }
  });
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { notificationPreferences, language, theme } = req.body;
  const UserSettings = require('../models/UserSettings');

  let settings = await UserSettings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await UserSettings.create({ user: req.user.id });
  }

  // Update preferences
  if (notificationPreferences) {
    settings.notificationPreferences = {
      ...settings.notificationPreferences,
      ...notificationPreferences
    };
  }

  if (language) {
    settings.language = language;
  }

  if (theme) {
    settings.theme = theme;
  }

  await settings.save();

  // Clear cache after update
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: settings.notificationPreferences,
      language: settings.language,
      theme: settings.theme
    }
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getPreferences,
  updatePreferences
};
