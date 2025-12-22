const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instrument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instrument',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for queries
reviewSchema.index({ instrument: 1 });
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
