import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the useAuth hook for testing
const TestComponent: React.FC = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <span data-testid="user-email">{user.email}</span>
          <button onClick={logout} data-testid="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => login({ email: 'test@example.com', password: 'password' })}
          data-testid="login-button"
        >
          Login
        </button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'student',
      firstName: 'Test',
      lastName: 'User',
    };

    const mockResponse = {
      data: {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      {
        email: 'test@example.com',
        password: 'password',
      }
    );
  });

  it('should handle login error', async () => {
    const mockError = new Error('Login failed');
    mockedAxios.post.mockRejectedValueOnce(mockError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));

    // Should still show login button after error
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    // Set up initial logged in state
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'student',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user to be loaded
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));

    // Should show login button after logout
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
