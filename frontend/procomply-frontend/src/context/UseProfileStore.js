import { create } from 'zustand';
import client from '../api/client';

export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await client.get('/accounts/profile/'); // ✅ Fixed endpoint
      set({ profile: res.data.data || res.data, loading: false }); // Handle wrapped response
      return res.data.data || res.data;
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     'Failed to load profile';
      set({ error: message, profile: null, loading: false });
      throw new Error(message);
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await client.patch('/accounts/profile/', formData); // ✅ Use PATCH
      set({ profile: res.data.data || res.data, loading: false });
      return res.data.data || res.data;
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     'Failed to update profile';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null });
  },
}));