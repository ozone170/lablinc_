import apiClient from './client';

export const bookingsAPI = {
  // Create booking
  createBooking: async (bookingData) => {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings
  getMyBookings: async (params = {}) => {
    const response = await apiClient.get('/bookings/my', { params });
    return response.data;
  },

  // Get single booking
  getBooking: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  // Update booking status (institute/admin)
  updateBookingStatus: async (id, status) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (id) => {
    const response = await apiClient.get(`/bookings/${id}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
