import apiClient from './client';

// Cache for storing ETags and responses
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const notificationsAPI = {
  // Get user notifications
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  // Get unread count with caching
  getUnreadCount: async () => {
    const cacheKey = 'unread-count';
    const cached = cache.get(cacheKey);
    
    // Check if we have a valid cached response
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const config = {};
      
      // Add If-None-Match header if we have a cached ETag
      if (cached && cached.etag) {
        config.headers = {
          'If-None-Match': cached.etag
        };
      }

      const response = await apiClient.get('/notifications/unread-count', config);
      
      // Cache the response with ETag
      const etag = response.headers.etag;
      if (etag) {
        cache.set(cacheKey, {
          data: response.data,
          etag: etag,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      // If 304 Not Modified, return cached data
      if (error.response && error.response.status === 304 && cached) {
        // Update timestamp to extend cache validity
        cached.timestamp = Date.now();
        cache.set(cacheKey, cached);
        return cached.data;
      }
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    // Clear cache after marking as read
    cache.delete('unread-count');
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/mark-all-read');
    // Clear cache after marking all as read
    cache.delete('unread-count');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    // Clear cache after deletion
    cache.delete('unread-count');
    return response.data;
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    const response = await apiClient.delete('/notifications/clear-all');
    // Clear cache after clearing all
    cache.delete('unread-count');
    return response.data;
  },

  // Get notification preferences
  getPreferences: async () => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data;
  },

  // Clear cache manually (for force refresh)
  clearCache: () => {
    cache.clear();
  }
};
