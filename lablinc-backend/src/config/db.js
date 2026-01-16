const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connection options - only use auth and TLS for production
    const options = process.env.NODE_ENV === 'production' 
      ? {
          authMechanism: 'SCRAM-SHA-1',
          retryWrites: false,
          tls: true
        }
      : {}; // No special options for local MongoDB
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
