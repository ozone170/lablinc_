/**
 * Utility functions for pricing and amount display based on user roles
 */

/**
 * Get the display amount based on user role
 * @param {Object} booking - Booking object with pricing information
 * @param {Object} user - User object with role information
 * @returns {number} - Amount to display
 */
export const getDisplayAmount = (booking, user) => {
  if (!booking) return 0;
  
  const userRole = user?.role?.toLowerCase();
  const breakdown = getPricingBreakdown(booking, user);
  
  // Admin and MSME see total amount (base + security + GST - discount)
  if (userRole === 'admin' || userRole === 'msme') {
    return breakdown?.totalAmount || 0;
  }
  
  // Institute users see only base amount (without tax/discount)
  if (userRole === 'institute') {
    return breakdown?.basePrice || 0;
  }
  
  // Default: show total amount
  return breakdown?.totalAmount || 0;
};

/**
 * Get pricing breakdown for display
 * 
 * Pricing Formula:
 * Total Amount = Base Price + Security Deposit (10%) + GST (18%) - Discount
 * 
 * Example: If base price is ₹100
 * - Base Price: ₹100
 * - Security Deposit (10%): ₹10
 * - GST (18%): ₹18
 * - Total: ₹128
 * 
 * @param {Object} booking - Booking object with pricing information
 * @param {Object} user - User object with role information
 * @returns {Object} - Pricing breakdown object
 */
export const getPricingBreakdown = (booking, user) => {
  if (!booking) return null;
  
  const userRole = user?.role?.toLowerCase();
  const pricing = booking.pricing || {};
  
  // Calculate base price from rate and duration
  const rate = pricing.rate || 0;
  const days = booking.duration?.days || 0;
  const calculatedBase = rate * days;
  
  // Get base price (the actual rental cost)
  const basePrice = pricing.basePrice || calculatedBase || pricing.totalAmount || booking.totalAmount || booking.amount || 0;
  
  // Calculate security deposit (10% of base price)
  const securityDeposit = pricing.securityDeposit || (basePrice * 0.10);
  
  // Calculate GST (18% of base price)
  const gst = pricing.gst || pricing.tax || (basePrice * 0.18);
  
  // Calculate discount if any
  const discount = pricing.discount || 0;
  
  // Calculate total: base + security deposit + GST - discount
  // Example: ₹100 + ₹10 + ₹18 = ₹128
  const calculatedTotal = basePrice + securityDeposit + gst - discount;
  
  // Always use calculated total to ensure correct pricing
  const totalAmount = calculatedTotal;
  
  // Admin and MSME see full breakdown
  if (userRole === 'admin' || userRole === 'msme') {
    return {
      basePrice: basePrice,
      securityDeposit: securityDeposit,
      gst: gst,
      discount: discount,
      totalAmount: totalAmount,
      showBreakdown: true
    };
  }
  
  // Institute users see only base price
  if (userRole === 'institute') {
    return {
      basePrice: basePrice,
      securityDeposit: 0,
      gst: 0,
      discount: 0,
      totalAmount: basePrice,
      showBreakdown: false
    };
  }
  
  // Default: show full breakdown
  return {
    basePrice: basePrice,
    securityDeposit: securityDeposit,
    gst: gst,
    discount: discount,
    totalAmount: totalAmount,
    showBreakdown: true
  };
};

/**
 * Format amount for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount string
 */
export const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * Get amount label based on user role
 * @param {Object} user - User object with role information
 * @returns {string} - Label for amount field
 */
export const getAmountLabel = (user) => {
  const userRole = user?.role?.toLowerCase();
  
  if (userRole === 'institute') {
    return 'Base Amount';
  }
  
  return 'Total Amount';
};
