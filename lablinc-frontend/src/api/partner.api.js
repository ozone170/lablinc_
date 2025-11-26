import apiClient from './client';

export const partnerAPI = {
  // Submit partner application (public)
  submitApplication: async (applicationData) => {
    const response = await apiClient.post('/partner', applicationData);
    return response.data;
  },
};
