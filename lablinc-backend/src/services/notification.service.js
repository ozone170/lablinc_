const Notification = require('../models/Notification');

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @param {String} data.recipient - User ID of recipient
 * @param {String} data.sender - User ID of sender (optional)
 * @param {String} data.type - Notification type
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.relatedBooking - Booking ID (optional)
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create booking-related notifications
 */
const notifyBookingCreated = async (booking, instrument, user, owner) => {
  await createNotification({
    recipient: owner._id,
    sender: user._id,
    type: 'booking_created',
    title: 'New Booking Request',
    message: `${user.name} has requested to book your ${instrument.name} from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`,
    relatedBooking: booking._id
  });
};

const notifyBookingConfirmed = async (booking, user) => {
  await createNotification({
    recipient: user._id,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: `Your booking for ${booking.instrumentName} has been confirmed`,
    relatedBooking: booking._id
  });
};

const notifyBookingCancelled = async (booking, user) => {
  await createNotification({
    recipient: user._id,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `Your booking for ${booking.instrumentName} has been cancelled`,
    relatedBooking: booking._id
  });
};

const notifyBookingCompleted = async (booking, user) => {
  await createNotification({
    recipient: user._id,
    type: 'booking_completed',
    title: 'Booking Completed',
    message: `Your booking for ${booking.instrumentName} has been completed`,
    relatedBooking: booking._id
  });
};

module.exports = {
  createNotification,
  notifyBookingCreated,
  notifyBookingConfirmed,
  notifyBookingCancelled,
  notifyBookingCompleted
};
