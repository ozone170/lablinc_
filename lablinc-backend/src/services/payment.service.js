// Payment Service - Razorpay/Stripe integration
const Payment = require('../models/Payment');

// Initialize Razorpay (uncomment when ready to use)
/*
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
*/

// Create payment order
const createOrder = async (booking) => {
  try {
    // Create payment record
    const payment = await Payment.create({
      booking: booking._id,
      user: booking.user,
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      status: 'pending',
      provider: 'razorpay'
    });

    // Create Razorpay order (uncomment when ready)
    /*
    const order = await razorpay.orders.create({
      amount: booking.pricing.totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        paymentId: payment._id.toString()
      }
    });

    payment.transactionId = order.id;
    payment.metadata = new Map(Object.entries(order));
    await payment.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id
    };
    */

    // Placeholder response
    payment.transactionId = `order_${Date.now()}`;
    await payment.save();

    return {
      orderId: payment.transactionId,
      amount: payment.amount * 100,
      currency: payment.currency,
      paymentId: payment._id
    };
  } catch (error) {
    console.error('Create order error:', error);
    throw new Error('Failed to create payment order');
  }
};

// Verify payment signature
const verifySignature = async (orderId, paymentId, signature) => {
  try {
    // Verify Razorpay signature (uncomment when ready)
    /*
    const crypto = require('crypto');
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid payment signature');
    }
    */

    // Update payment status
    const payment = await Payment.findOne({ transactionId: orderId });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'completed';
    payment.metadata = payment.metadata || new Map();
    payment.metadata.set('razorpayPaymentId', paymentId);
    payment.metadata.set('razorpaySignature', signature);
    await payment.save();

    return { success: true, payment };
  } catch (error) {
    console.error('Verify signature error:', error);
    throw error;
  }
};

// Refund payment
const refundPayment = async (paymentId, amount, reason) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    // Process refund with Razorpay (uncomment when ready)
    /*
    const refund = await razorpay.payments.refund(
      payment.metadata.get('razorpayPaymentId'),
      {
        amount: amount * 100, // Amount in paise
        notes: { reason }
      }
    );

    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.metadata.set('refundId', refund.id);
    await payment.save();

    return { success: true, refund };
    */

    // Placeholder implementation
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;
    await payment.save();

    return { success: true, payment };
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
};

// Get payment by booking
const getPaymentByBooking = async (bookingId) => {
  return await Payment.findOne({ booking: bookingId })
    .populate('user', 'name email')
    .populate('booking', 'instrumentName status');
};

module.exports = {
  createOrder,
  verifySignature,
  refundPayment,
  getPaymentByBooking
};
