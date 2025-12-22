import { useState, useEffect } from 'react';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import { notificationsAPI } from '../api/notifications.api';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationsAPI.getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NoFooterLayout>
      <div className="notifications-page">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <p className="unread-summary">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
              Mark All as Read
            </button>
          )}
        </div>

        <div className="notifications-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        <div className="notifications-content">
          {loading ? (
            <div className="notifications-loading">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="notifications-error">{error}</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <h3>No notifications</h3>
              <p>
                {filter === 'unread' && 'You have no unread notifications'}
                {filter === 'read' && 'You have no read notifications'}
                {filter === 'all' && 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-card ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-card-content">
                    <div className="notification-icon">
                      {notification.type === 'booking' && '📅'}
                      {notification.type === 'payment' && '💳'}
                      {notification.type === 'system' && 'ℹ️'}
                      {!notification.type && '🔔'}
                    </div>
                    <div className="notification-details">
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-date">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {notification.type && (
                          <span className="notification-type">{notification.type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="mark-read-btn"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NoFooterLayout>
  );
};

export default NotificationsPage;
