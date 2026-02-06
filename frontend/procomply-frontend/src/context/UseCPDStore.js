import { create } from 'zustand';
import client from '../api/client';

export const useCPDStore = create((set) => ({
  activities: [],
  summary: null,
  loading: false,
  error: null,

  fetchActivities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await client.get('/compliance/cpd-activities/');
      set({ activities: res.data, loading: false });
      return res.data;
    } catch (error) {
      console.error('Fetch activities error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message ||
                     'Failed to load CPD activities';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  fetchSummary: async (year = new Date().getFullYear()) => {
    set({ loading: true, error: null });
    try {
      const res = await client.get(`/compliance/cpd-summary/?year=${year}`);
      set({ summary: res.data, loading: false });
      return res.data;
    } catch (error) {
      console.error('Fetch summary error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message ||
                     'Failed to load CPD summary';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  createActivity: async (activityData) => {
    set({ loading: true, error: null });
    try {
      const isFormData = activityData instanceof FormData;
      
      const config = isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : {};

      const res = await client.post('/compliance/cpd-activities/', activityData, config);
      
      set((state) => ({
        activities: [res.data, ...state.activities],
        loading: false
      }));
      
      return res.data;
    } catch (error) {
      console.error('Create activity error:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.error ||
                     error.message ||
                     'Failed to create activity';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  downloadReport: async (year = new Date().getFullYear()) => {
    try {
      const response = await client.get(`/compliance/cpd-report/?year=${year}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CPD_Report_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Download report error:', error);
      throw new Error('Failed to download report');
    }
  },

  clearError: () => set({ error: null }),
}));