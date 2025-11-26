const mongoose = require('mongoose');

const partnerApplicationSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: [true, 'Institute name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  instrumentsAvailable: {
    type: String,
    required: [true, 'Please describe available instruments']
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contacted'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PartnerApplication', partnerApplicationSchema);
