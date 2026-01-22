import {create} from 'zustand';
import client from '../api/client';

export const useAuthstore = create((set) => ({
  isAuthenticated: false,
  user:null,
  loading:false,
  error:null,

  login: async (email, password) => {
    set({loading:true, error:null});
    try {
      const res =await client.post('/login/', {email, password});
      const {engineer, access} = res.data;
      localStorage.setItem('access_token', access);

      set({
        isAuthenticated:true,
        user:engineer,
        loading:false,
      });
      console.log('Login successful:', res.data);
    }catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      set({ error:message, loading:false});
      throw new Error(message);
    }
  },
  register: async (userData) => {
    set({loading:true, error:null});
    try {
      await client.post('/register/', userData);
      set({loading:false});
    } catch (error) {
      const message = error.response?.data || 'Registration failed';
      set({ error:message, loading:false});
      throw new Error(message);
    }
  },
  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated:false, user:null});
      return;
    }
    set({loading:true});
    try {
      const res = await client.get('/profile/');
      set({
        isAuthenticated:true,
        user:res.data.engineer,
        loading:false,
      });
    } catch (error) {
      console.warn('Token invalid or expired', error);
      localStorage.removeItem('access_token');
      set({ isAuthenticated:false, user:null, loading:false});

    }
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ isAuthenticated:false, user:null});
  },


}));