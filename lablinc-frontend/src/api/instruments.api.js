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

  // Alias for getInstrument
  getById: async (id) => {
    return instrumentsAPI.getInstrument(id);
  },

  // Check availability
  checkAvailability: async (id, startDate, endDate) => {
    const response = await apiClient.get(`/instruments/${id}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Create instrument (institute/admin only)
  createInstrument: async (data) => {
    const response = await apiClient.post('/instruments', data);
    return response.data;
  },

  // Alias for createInstrument
  create: async (data) => {
    return instrumentsAPI.createInstrument(data);
  },

  // Update instrument
  updateInstrument: async (id, data) => {
    const response = await apiClient.put(`/instruments/${id}`, data);
    return response.data;
  },

  // Alias for updateInstrument
  update: async (id, data) => {
    return instrumentsAPI.updateInstrument(id, data);
  },

  // Delete instrument
  deleteInstrument: async (id) => {
    const response = await apiClient.delete(`/instruments/${id}`);
    return response.data;
  },

  // Get featured instruments
  getFeaturedInstruments: async () => {
    const response = await apiClient.get('/instruments/featured');
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await apiClient.get('/instruments/categories');
    return response.data;
  },

  // Get my instruments
  getMyInstruments: async (params = {}) => {
    const response = await apiClient.get('/instruments/my', { params });
    return response.data;
  },

  // Update instrument status
  updateStatus: async (id, availability) => {
    const response = await apiClient.patch(`/instruments/${id}/status`, { availability });
    return response.data;
  },

  // Upload photos
  uploadPhotos: async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await apiClient.post(`/instruments/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete photo
  deletePhoto: async (id, photoId) => {
    const encodedPhotoId = encodeURIComponent(photoId);
    const response = await apiClient.delete(`/instruments/${id}/photos/${encodedPhotoId}`);
    return response.data;
  },

  // Get instrument reviews
  getReviews: async (id, params = {}) => {
    const response = await apiClient.get(`/instruments/${id}/reviews`, { params });
    return response.data;
  },
};
