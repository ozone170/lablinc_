const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['msme', 'institute', 'admin'],
    default: 'msme'
  },
  phone: {
    type: String,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  refreshToken: {
    type: String,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  passwordChangeOTP: {
    type: String,
    select: false
  },
  passwordChangeOTPExpires: {
    type: Date,
    select: false
  },
  passwordChangeOTPAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  emailOTP: {
    type: String,
    select: false
  },
  emailOTPExpires: {
    type: Date,
    select: false
  },
  emailOTPAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lastEmailOTPRequest: {
    type: Date,
    select: false
  },
  lastPasswordOTPRequest: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Auto-verify admin users
userSchema.pre('save', function() {
  if (this.role === 'admin' && this.isNew) {
    this.emailVerified = true;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
