const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  instrument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instrument',
    required: true
  },
  instrumentName: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    days: { type: Number, required: true }
  },
  pricing: {
    rateType: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      required: true
    },
    rate: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  invoiceId: {
    type: String
  },
  agreementAccepted: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

// Index for queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ instrument: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
