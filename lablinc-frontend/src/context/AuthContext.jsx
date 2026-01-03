import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        // Try to verify the session with the backend
        try {
          const response = await authAPI.getCurrentUser();
          const userData = response.data?.user || response.user;
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          // If session verification fails, clear stored data
          console.log('Session verification failed, clearing stored data');
          localStorage.removeItem('user');
          clearAuthCookies();
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      // Clear any invalid session data
      localStorage.removeItem('user');
      clearAuthCookies();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Clear any existing session data before login
      clearAuthCookies();
      localStorage.removeItem('user');
      
      const response = await authAPI.login(credentials);
      
      // Tokens are now in HTTP-only cookies, only user data is returned
      if (!response || !response.data) {
        return {
          success: false,
          message: 'Invalid server response',
        };
      }
      
      const { user: userData } = response.data;

      if (!userData) {
        return {
          success: false,
          message: 'Invalid login data received',
        };
      }

      // Save user data to state and localStorage (tokens are in cookies)
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Clear any session data on login failure
      clearAuthCookies();
      localStorage.removeItem('user');
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Tokens are now in HTTP-only cookies, only user data is returned
      const { user: newUser } = response.data;

      // Save user data to state and localStorage (tokens are in cookies)
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);

      // Clear localStorage (cookies are cleared by server)
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken'); // Remove any legacy tokens
      localStorage.removeItem('refreshToken'); // Remove any legacy tokens
      
      // Clear cookies manually as fallback
      clearAuthCookies();
    }
  };

  const clearAuthCookies = () => {
    // Clear auth cookies manually with all possible path and domain combinations
    const cookieOptions = [
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict',
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict',
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; SameSite=Strict',
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost; SameSite=Strict',
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api; SameSite=Strict',
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api; SameSite=Strict'
    ];
    
    cookieOptions.forEach(cookieString => {
      document.cookie = cookieString;
    });
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data?.user || response.user;
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    restoreSession,
    refreshUser,
    clearAuthCookies
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
