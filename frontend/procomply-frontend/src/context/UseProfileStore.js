import {  create } from 'zustand';
import client from '../api/client';

export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

    fetchProfile: async () => {
     set({ loading: true, error: null });
     try {
      const res = await client.get('/profile/');
      set({ profile: res.data, loading: false });
      return res.data;
     } catch (error) {
      const message = error.response?.data?.detail || 'Failed to load profile';
      set({ error: message, profile: null, loading: false });
      throw new Error(message);
     }
  },
    updateProfile: async (formData) => {
     set({ loading: true, error: null });
     try {
        const res = await client.put('/profile/', formData);
        set({ profile: res.data, loading: false });
        return res.data;
     } catch (error) {
        const message = error.response?.data?.detail || 'Failed to update profile';
        set({ error: message, loading: false });
        throw new Error(message);
     }

    },
    clearProfile: () => {
        set({ profile: null, error: null });
   },  
}));

      

