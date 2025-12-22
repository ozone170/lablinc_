import apiClient from './client';

export const adminAPI = {
  // User Management
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
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

  createInstrument: async (instrumentData) => {
    const response = await apiClient.post('/admin/instruments', instrumentData);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/admin/categories');
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

  createBooking: async (bookingData) => {
    const response = await apiClient.post('/admin/bookings', bookingData);
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

  // Delete user
  deleteUser: async (userId, data = {}) => {
    const response = await apiClient.delete(`/admin/users/${userId}`, { data });
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (userId) => {
    const response = await apiClient.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  // Get revenue report
  getRevenueReport: async (params = {}) => {
    const response = await apiClient.get('/admin/reports/revenue', { params });
    return response.data;
  },

  // Get usage report
  getUsageReport: async () => {
    const response = await apiClient.get('/admin/reports/usage');
    return response.data;
  },

  // Get audit logs
  getAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/logs', { params });
    return response.data;
  },

  // Delete instrument (hard delete)
  deleteInstrument: async (instrumentId) => {
    const response = await apiClient.delete(`/admin/instruments/${instrumentId}`);
    return response.data;
  },

  // Send broadcast notification
  sendBroadcast: async (data) => {
    const response = await apiClient.post('/admin/broadcast', data);
    return response.data;
  },
};
