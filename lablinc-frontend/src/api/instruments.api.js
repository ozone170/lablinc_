import apiClient from './client';

export const instrumentsAPI = {
  // Get all instruments with filters
  getInstruments: async (params = {}) => {
    const response = await apiClient.get('/instruments', { params });
    return response.data;
  },

  // Get single instrument
  getInstrument: async (id) => {
    const response = await apiClient.get(`/instruments/${id}`);
    return response.data;
  },

  // Check availability
  checkAvailability: async (id, startDate, endDate) => {
    const response = await apiClient.get(`/instruments/${id}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Create instrument (institute/admin only)
  createInstrument: async (formData) => {
    const response = await apiClient.post('/instruments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update instrument
  updateInstrument: async (id, formData) => {
    const response = await apiClient.put(`/instruments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete instrument
  deleteInstrument: async (id) => {
    const response = await apiClient.delete(`/instruments/${id}`);
    return response.data;
  },
};
