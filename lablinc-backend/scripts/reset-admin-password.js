require('dotenv').config();

// Production guard
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script is disabled in production for security reasons');
  process.exit(1);
}

const mongoose = require('mongoose');
const User = require('../src/models/User');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@lablinc.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    admin.password = 'admin123';
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log('Email: admin@lablinc.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
