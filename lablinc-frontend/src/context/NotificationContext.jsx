import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI } from '../api/notifications.api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const intervalRef = useRef(null);
  
  // Cache duration: 2 minutes
  const CACHE_DURATION = 2 * 60 * 1000;
  // Poll interval: 5 minutes (reduced from 30 seconds)
  const POLL_INTERVAL = 5 * 60 * 1000;

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setLastFetch(Date.now());
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count with caching
  const fetchUnreadCount = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache validity
      if (!forceRefresh && lastFetch && (Date.now() - lastFetch) < CACHE_DURATION) {
        return; // Use cached data
      }

      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.count);
      setLastFetch(Date.now());
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [lastFetch]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      fetchUnreadCount(false); // Use cache if valid
    }, POLL_INTERVAL);
  }, [fetchUnreadCount]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setLastFetch(Date.now()); // Update cache timestamp
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
      setLastFetch(Date.now()); // Update cache timestamp
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
      const deletedNotif = notifications.find((n) => n._id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setLastFetch(Date.now()); // Update cache timestamp
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await notificationsAPI.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setLastFetch(Date.now()); // Update cache timestamp
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  }, []);

  // Force refresh (for manual refresh scenarios)
  const forceRefresh = useCallback(() => {
    // Clear API cache and force fresh request
    notificationsAPI.clearCache();
    setLastFetch(null);
    fetchUnreadCount(true);
  }, [fetchUnreadCount]);

  // Initialize polling when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      stopPolling();
      return;
    }

    // Initial fetch
    fetchUnreadCount(true);
    
    // Start polling
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [fetchUnreadCount, startPolling, stopPolling]);

  // Handle visibility change to optimize polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling(); // Stop polling when tab is hidden
      } else {
        const token = localStorage.getItem('accessToken');
        if (token) {
          fetchUnreadCount(true); // Force refresh when tab becomes visible
          startPolling(); // Resume polling
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount, startPolling, stopPolling]);

  const value = {
    notifications,
    unreadCount,
    loading,
    lastFetch,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    forceRefresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
