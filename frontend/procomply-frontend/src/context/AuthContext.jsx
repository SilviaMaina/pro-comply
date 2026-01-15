import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
     
      client.get('/profile/')
        .then(() => setIsAuthenticated(true))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    try {
      await client.post('/register/', userData);
      // Auto-login after register? Or redirect to login
    } catch (err) {
      throw err.response?.data || 'Registration failed';
    }
  };


  const login = async (email, password) => {
    const res = await client.post('/login/', { email, password });
    localStorage.setItem('accessToken', res.data.access);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated,register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);