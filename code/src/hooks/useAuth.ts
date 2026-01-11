import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { isTokenExpired, refreshToken, validatePassword } from '../utils/auth';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'faculty' | 'viewer';
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    loading: true,
    error: null,
  });

  let navigate: any;
  try {
    navigate = useNavigate();
  } catch (error) {
    // Router context not available yet
    navigate = null;
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (token && !isTokenExpired(token)) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAuthState(prev => ({
            ...prev,
            user: response.data,
            loading: false,
          }));
        } catch (error) {
          console.error('Error fetching user:', error);
          await handleTokenRefresh();
        }
      } else if (refreshTokenValue) {
        await handleTokenRefresh();
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const handleTokenRefresh = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      logout();
      return;
    }

    try {
      const newToken = await refreshToken(refreshTokenValue);
      if (newToken) {
        localStorage.setItem('token', newToken);
        setAuthState(prev => ({ ...prev, token: newToken }));
        
        // Fetch user data with new token
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        setAuthState(prev => ({
          ...prev,
          user: response.data,
          loading: false,
        }));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      const { token, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      setAuthState({
        user,
        token,
        refreshToken: newRefreshToken,
        loading: false,
        error: null,
      });

      toast.success('Login successful!');
      
      // Navigate based on role
      const dashboardRoute = getDashboardRoute(user.role);
      if (navigate) {
        navigate(dashboardRoute);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Validate password
      const passwordValidation = validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await axios.post(`${API_URL}/api/auth/register`, credentials);
      const { token, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      setAuthState({
        user,
        token,
        refreshToken: newRefreshToken,
        loading: false,
        error: null,
      });

      toast.success('Registration successful!');
      
      // Navigate based on role
      const dashboardRoute = getDashboardRoute(user.role);
      if (navigate) {
        navigate(dashboardRoute);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
    });
    if (navigate) {
      navigate('/');
    }
    toast.success('Logged out successfully');
  }, [navigate]);

  const forgotPassword = async (email: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password: newPassword,
      });
      toast.success('Password reset successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/verify-email`, { token });
      toast.success('Email verified successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`);
      toast.success('Verification email sent!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/profile`, updates, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      
      setAuthState(prev => ({
        ...prev,
        user: response.data,
      }));
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      await axios.post(`${API_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const getDashboardRoute = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'faculty':
        return '/dashboard/faculty';
      case 'student':
        return '/dashboard/student';
      case 'viewer':
        return '/dashboard/viewer';
      default:
        return '/';
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    updateProfile,
    changePassword,
  };
};
