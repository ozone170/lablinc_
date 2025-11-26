require('dotenv').config();
const mongoose = require('mongoose');
const Instrument = require('../src/models/Instrument');

const resetIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all indexes except _id
    await Instrument.collection.dropIndexes();
    console.log('✅ Dropped old indexes');

    // Recreate indexes from schema
    await Instrument.createIndexes();
    console.log('✅ Created new indexes');

    console.log('✅ Index reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetIndexes();
