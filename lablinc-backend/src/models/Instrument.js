const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Instrument name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  specifications: {
    type: Map,
    of: String
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
  pricing: {
    hourly: { type: Number },
    daily: { type: Number },
    weekly: { type: Number },
    monthly: { type: Number }
  },
  availability: {
    type: String,
    enum: ['available', 'booked', 'maintenance', 'unavailable'],
    default: 'available'
  },
  location: {
    type: String,
    required: true
  },
  photos: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for search
instrumentSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Instrument', instrumentSchema);
