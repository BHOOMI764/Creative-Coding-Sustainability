import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { isTokenExpired } from '../utils/auth';

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

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  register: (credentials: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    role: 'student' | 'faculty' | 'viewer';
  }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<Omit<AuthContextType, 'login' | 'register' | 'logout' | 'forgotPassword' | 'resetPassword' | 'verifyEmail' | 'resendVerificationEmail' | 'updateProfile' | 'changePassword'>>({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    loading: true,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (token && !isTokenExpired(token)) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAuth(prev => ({
            ...prev,
            user: response.data,
            token,
            refreshToken: refreshTokenValue,
            loading: false,
            error: null,
          }));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setAuth(prev => ({
            ...prev,
            user: null,
            token: null,
            refreshToken: null,
            loading: false,
            error: null,
          }));
        }
      } else {
        setAuth(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      const { token, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);

      setAuth({
        user,
        token,
        refreshToken: newRefreshToken,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuth(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const register = async (credentials: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    role: 'student' | 'faculty' | 'viewer';
  }) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));

      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: credentials.role,
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);

      setAuth({
        user,
        token,
        refreshToken: newRefreshToken,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setAuth(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuth({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
    });
  };

  const forgotPassword = async (email: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to send reset email';
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { token, newPassword });
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to reset password';
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/verify-email`, { token });
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to verify email';
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!auth.user) throw new Error('Not authenticated');
      await axios.post(`${API_URL}/api/auth/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to resend verification email';
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await axios.put(`${API_URL}/api/auth/profile`, updates, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setAuth(prev => ({ ...prev, user: response.data }));
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await axios.post(`${API_URL}/api/auth/change-password`, 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to change password';
    }
  };

  const value: AuthContextType = {
    ...auth,
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

  return (
    <AuthContext.Provider value={value}>
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;