
import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client'; // Your Axios instance

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // True until we check auth status

  // Check authentication on app start
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Verify token by fetching profile
      client.get('/profile/')
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.warn('Token invalid or expired. Clearing auth state.', error);
          localStorage.removeItem('accessToken'); // 🔑 Critical: clear bad token
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await client.post('/login/', { email, password });
      const { access } = response.data;

      // Save token to localStorage
      localStorage.setItem('accessToken', access);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Invalid email or password');
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      await client.post('/register/', userData);
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};