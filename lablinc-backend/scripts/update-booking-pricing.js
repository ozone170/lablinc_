/**
 * Script to update existing bookings with correct pricing breakdown
 * Run this once to fix old bookings that only have totalAmount as base price
 */

const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
require('dotenv').config();

const updateBookingPricing = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lablinc');
    console.log('✅ Connected to MongoDB');

    // Find all bookings that don't have the new pricing structure
    const bookings = await Booking.find({
      $or: [
        { 'pricing.basePrice': { $exists: false } },
        { 'pricing.securityDeposit': { $exists: false } },
        { 'pricing.gst': { $exists: false } }
      ]
    });

    console.log(`Found ${bookings.length} bookings to update`);

    let updated = 0;
    for (const booking of bookings) {
      // Calculate base amount from rate and duration
      const baseAmount = booking.pricing.rate * booking.duration.days;
      
      // Calculate security deposit (10%)
      const securityDeposit = Math.round(baseAmount * 0.10);
      
      // Calculate GST (18%)
      const gst = Math.round(baseAmount * 0.18);
      
      // Calculate correct total
      const totalAmount = baseAmount + securityDeposit + gst;

      // Update the booking
      booking.pricing.basePrice = baseAmount;
      booking.pricing.securityDeposit = securityDeposit;
      booking.pricing.gst = gst;
      booking.pricing.totalAmount = totalAmount;

      await booking.save();
      updated++;

      console.log(`Updated booking ${booking._id}:`);
      console.log(`  Base: ₹${baseAmount}`);
      console.log(`  Security: ₹${securityDeposit}`);
      console.log(`  GST: ₹${gst}`);
      console.log(`  Total: ₹${totalAmount}`);
    }

    console.log(`\n✅ Successfully updated ${updated} bookings`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating bookings:', error);
    process.exit(1);
  }
};

updateBookingPricing();
