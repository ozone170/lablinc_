import apiClient from './client';

export const adminAPI = {
  // User Management
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // Instrument Management
  getInstruments: async (params = {}) => {
    const response = await apiClient.get('/admin/instruments', { params });
    return response.data;
  },

  toggleInstrumentFeature: async (instrumentId) => {
    const response = await apiClient.patch(`/admin/instruments/${instrumentId}/feature`);
    return response.data;
  },

  // Booking Management
  getBookings: async (params = {}) => {
    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
  },

  updateBooking: async (bookingId, data) => {
    const response = await apiClient.patch(`/admin/bookings/${bookingId}`, data);
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await apiClient.patch(`/admin/bookings/${bookingId}`, { status });
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  // Partner Applications
  getPartnerApplications: async (params = {}) => {
    const response = await apiClient.get('/admin/partners', { params });
    return response.data;
  },

  updatePartnerApplication: async (applicationId, data) => {
    const response = await apiClient.patch(`/admin/partners/${applicationId}`, data);
    return response.data;
  },

  // Contact Messages
  getContactMessages: async (params = {}) => {
    const response = await apiClient.get('/admin/contacts', { params });
    return response.data;
  },

  updateContactMessage: async (messageId, data) => {
    const response = await apiClient.patch(`/admin/contacts/${messageId}`, data);
    return response.data;
  },

  // Download invoice
  downloadInvoice: async (bookingId) => {
    const response = await apiClient.get(`/admin/bookings/${bookingId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
