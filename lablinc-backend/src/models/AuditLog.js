const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_status_changed',
      'instrument_created',
      'instrument_updated',
      'instrument_deleted',
      'instrument_featured',
      'booking_created',
      'booking_updated',
      'booking_cancelled',
      'booking_completed',
      'payment_created',
      'payment_completed',
      'payment_refunded',
      'admin_action',
      'settings_updated'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Instrument', 'Booking', 'Payment', 'Notification', 'System']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for queries
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
