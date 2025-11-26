import apiClient from './client';

export const contactAPI = {
  // Submit contact message (public)
  submitMessage: async (messageData) => {
    const response = await apiClient.post('/contact', messageData);
    return response.data;
  },
};
