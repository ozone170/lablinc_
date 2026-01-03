const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const clearRefreshTokens = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all refresh tokens to force re-authentication
    const result = await User.updateMany(
      { refreshToken: { $exists: true, $ne: null } },
      { $unset: { refreshToken: 1 } }
    );

    console.log(`✅ Cleared refresh tokens for ${result.modifiedCount} users`);
    console.log('ℹ️  All users will need to log in again');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing refresh tokens:', error);
    process.exit(1);
  }
};

// Prevent accidental execution in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script cannot be run in production environment');
  process.exit(1);
}

console.log('🔄 Clearing all refresh tokens...');
console.log('⚠️  This will log out all users');

clearRefreshTokens();