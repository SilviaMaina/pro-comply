import { create } from 'zustand';
import client from '../api/client';

export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await client.get('/accounts/profile/');
      const profileData = res.data.data || res.data;
      set({ profile: profileData, loading: false });
      return profileData;
    } catch (error) {
      console.error('Fetch profile error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message ||
                     'Failed to load profile';
      set({ error: message, profile: null, loading: false });
      throw new Error(message);
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true, error: null });
    try {
      // Check if formData is FormData (for file uploads)
      const isFormData = formData instanceof FormData;
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const res = await client.patch('/accounts/profile/', formData, config);
      const profileData = res.data.data || res.data;
      set({ profile: profileData, loading: false });
      return profileData;
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message ||
                     'Failed to update profile';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null });
  },
}));