import apiClient from './client';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Refresh access token
  refresh: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await apiClient.post('/auth/change-password', {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await apiClient.patch('/auth/me', userData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await apiClient.get('/auth/verify-email', { params: { token } });
    return response.data;
  },
};
