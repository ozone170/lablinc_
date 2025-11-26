// Date utility functions
const isDateRangeValid = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && start >= new Date();
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = {
  isDateRangeValid,
  calculateDays
};
