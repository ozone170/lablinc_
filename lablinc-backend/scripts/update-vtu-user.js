const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const updateVTUUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash the password
    const hashedPassword = await bcrypt.hash('vtu123456', 10);

    // Update or create VTU user
    const vtuUser = await User.findOneAndUpdate(
      { email: 'vtu@belagavi.edu' },
      {
        name: 'VTU Belagavi',
        email: 'vtu@belagavi.edu',
        password: hashedPassword,
        role: 'institute',
        organization: 'Visvesvaraya Technological University',
        phone: '+91 831 2498100',
        address: 'Jnana Sangama, Belagavi, Karnataka 590018, India',
        status: 'active'
      },
      { upsert: true, new: true }
    );

    console.log('VTU user updated successfully:');
    console.log('Email:', vtuUser.email);
    console.log('Role:', vtuUser.role);
    console.log('Status:', vtuUser.status);
    console.log('\nLogin credentials:');
    console.log('Email: vtu@belagavi.edu');
    console.log('Password: vtu123456');

    process.exit(0);
  } catch (error) {
    console.error('Error updating VTU user:', error);
    process.exit(1);
  }
};

updateVTUUser();
