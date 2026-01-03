import axios from 'axios';
import { config, isConfigValid, configErrors, validateApiUrl } from '../config/environment.js';
import { handleApiError } from '../components/auth/AuthErrorHandler.jsx';

// Validate configuration on startup
if (!isConfigValid) {
  console.error('❌ Invalid API configuration:', configErrors);
}

const apiValidation = validateApiUrl();
if (!apiValidation.isValid) {
  console.error('❌ Invalid API URL:', apiValidation.error);
}

// Create axios instance with validated configuration
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  withCredentials: true, // Important: send cookies with all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and logging
apiClient.interceptors.request.use(
  (requestConfig) => {
    // Cookies are automatically sent by the browser, no need to manually add tokens
    // Keep the Authorization header as fallback for development/testing
    const token = localStorage.getItem('accessToken');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (config.enableLogging && config.enableDebugMode) {
      console.log('🚀 API Request:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        baseURL: requestConfig.baseURL,
        timeout: requestConfig.timeout
      });
    }

    return requestConfig;
  },
  (error) => {
    if (config.enableLogging) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with retry logic and better error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (config.enableLogging && config.enableDebugMode) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced error logging
    if (config.enableLogging) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase()
      });
    }

    // Handle network errors with retry logic
    if (!error.response && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Retry logic for network errors
    if (!error.response && originalRequest._retryCount < config.retryAttempts) {
      originalRequest._retryCount++;
      
      if (config.enableLogging) {
        console.warn(`🔄 Retrying request (${originalRequest._retryCount}/${config.retryAttempts}):`, originalRequest.url);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      
      return apiClient(originalRequest);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (config.enableLogging) {
          console.log('🔄 Attempting token refresh...');
        }

        // Try to refresh the token
        const response = await axios.post(`${config.apiUrl}/auth/refresh`, {}, {
          timeout: config.apiTimeout,
          withCredentials: true // Important: send cookies with request
        });

        // Tokens are now in cookies, no need to handle them in response
        if (config.enableLogging) {
          console.log('✅ Token refreshed successfully');
        }

        // Retry original request (cookies will be sent automatically)
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (config.enableLogging) {
          console.error('❌ Token refresh failed:', refreshError.message);
        }

        // Refresh failed - clear any localStorage tokens and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection and try again';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error - please check your internet connection';
    } else if (!error.response) {
      error.message = 'Unable to connect to server - please try again later';
    }

    // Use global auth error handler for consistent error handling
    if (error.response) {
      handleApiError(error);
    }

    return Promise.reject(error);
  }
);

// API health check utility
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${config.apiUrl}/health`, {
      timeout: 5000
    });
    
    return {
      isHealthy: true,
      status: response.status,
      data: response.data,
      responseTime: response.headers['x-response-time'] || 'unknown'
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message,
      status: error.response?.status || 'unknown'
    };
  }
};

// Connection status utility
export const getConnectionStatus = () => {
  return {
    isOnline: navigator.onLine,
    apiUrl: config.apiUrl,
    timeout: config.apiTimeout,
    retryAttempts: config.retryAttempts,
    configValid: isConfigValid
  };
};

export default apiClient;
