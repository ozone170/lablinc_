const Booking = require('../models/Booking');
const User = require('../models/User');
const Instrument = require('../models/Instrument');

/**
 * Get platform analytics
 */
const getPlatformAnalytics = async () => {
  // User counts by role
  const userStats = await User.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  const userCounts = {
    msme: 0,
    institute: 0,
    admin: 0,
    total: 0
  };

  userStats.forEach(stat => {
    userCounts[stat._id] = stat.count;
    userCounts.total += stat.count;
  });

  // Instrument counts
  const instrumentStats = await Instrument.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$availability', count: { $sum: 1 } } }
  ]);

  const instrumentCounts = {
    available: 0,
    booked: 0,
    maintenance: 0,
    unavailable: 0,
    total: 0
  };

  instrumentStats.forEach(stat => {
    instrumentCounts[stat._id] = stat.count;
    instrumentCounts.total += stat.count;
  });

  // Booking stats
  const bookingStats = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const bookingCounts = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    total: 0
  };

  bookingStats.forEach(stat => {
    bookingCounts[stat._id] = stat.count;
    bookingCounts.total += stat.count;
  });

  // Revenue calculation
  const revenueData = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);

  const revenue = revenueData.length > 0 ? {
    total: revenueData[0].totalRevenue || 0,
    average: Math.round(revenueData[0].averageBookingValue || 0)
  } : { total: 0, average: 0 };

  // Bookings per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const bookingsPerMonth = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Revenue breakdown by period
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [thisMonthRevenue, lastMonthRevenue, thisYearRevenue] = await Promise.all([
    Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]),
    Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]),
    Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfYear }
        } 
      },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ])
  ]);

  const revenueBreakdown = {
    thisMonth: thisMonthRevenue[0]?.total || 0,
    lastMonth: lastMonthRevenue[0]?.total || 0,
    thisYear: thisYearRevenue[0]?.total || 0
  };

  // Instrument utilization
  const utilizationData = await Booking.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    {
      $group: {
        _id: '$instrument',
        bookingCount: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' }
      }
    },
    { $sort: { bookingCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'instruments',
        localField: '_id',
        foreignField: '_id',
        as: 'instrumentDetails'
      }
    },
    { $unwind: '$instrumentDetails' },
    {
      $project: {
        instrumentName: '$instrumentDetails.name',
        category: '$instrumentDetails.category',
        bookingCount: 1,
        totalRevenue: 1
      }
    }
  ]);

  return {
    users: userCounts,
    instruments: instrumentCounts,
    bookings: bookingCounts,
    revenue,
    revenueBreakdown,
    bookingsPerMonth,
    topInstruments: utilizationData,
    // Flat properties for easy access
    totalUsers: userCounts.total,
    totalInstruments: instrumentCounts.total,
    totalBookings: bookingCounts.total,
    totalRevenue: revenue.total,
    activeBookings: bookingCounts.confirmed,
    pendingBookings: bookingCounts.pending
  };
};

module.exports = {
  getPlatformAnalytics
};
