const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notificationPreferences: {
    email: {
      bookingCreated: { type: Boolean, default: true },
      bookingConfirmed: { type: Boolean, default: true },
      bookingCancelled: { type: Boolean, default: true },
      bookingCompleted: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true }
    },
    push: {
      bookingCreated: { type: Boolean, default: true },
      bookingConfirmed: { type: Boolean, default: true },
      bookingCancelled: { type: Boolean, default: true },
      bookingCompleted: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false }
    }
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'es', 'fr']
  },
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark', 'auto']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
