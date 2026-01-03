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
  refresh: async () => {
    const response = await apiClient.post('/auth/refresh');
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

  // Resend verification email
  resendVerificationEmail: async (email) => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Request OTP for password change
  requestPasswordChangeOTP: async () => {
    const response = await apiClient.post('/auth/request-password-change-otp');
    return response.data;
  },

  // Change password with OTP
  changePasswordWithOTP: async (otp, newPassword) => {
    const response = await apiClient.post('/auth/change-password-with-otp', { otp, newPassword });
    return response.data;
  },

  // Send email OTP for registration (before user exists)
  sendRegistrationOTP: async (email) => {
    const response = await apiClient.post('/auth/send-registration-otp', { email });
    return response.data;
  },

  // Verify registration OTP (before user exists)
  verifyRegistrationOTP: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-registration-otp', { email, otp });
    return response.data;
  },

  // Send email OTP for verification
  sendEmailOTP: async (email) => {
    const response = await apiClient.post('/auth/send-email-otp', { email });
    return response.data;
  },

  // Verify email OTP
  verifyEmailOTP: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  },
};
