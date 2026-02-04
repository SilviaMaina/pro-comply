import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase'; 
import client from '../api/client';

export const useAuthstore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth state listener
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase token and save it
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseToken', token);
          
          // Sync with Django backend
          await client.post('/accounts/sync-firebase/', {
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || ''
          });
          
          set({ user: firebaseUser, loading: false, error: null });
        } catch (error) {
          console.error('Auth sync error:', error);
          set({ user: firebaseUser, loading: false, error: error.message });
        }
      } else {
        localStorage.removeItem('firebaseToken');
        set({ user: null, loading: false, error: null });
      }
    });
    
    return unsubscribe;
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      
      // Sync with backend
      await client.post('/accounts/sync-firebase/', {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || ''
      });
      
      set({ user: userCredential.user, loading: false });
      return userCredential.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      
      // Sync with backend
      await client.post('/accounts/sync-firebase/', {
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || ''
      });
      
      set({ user: userCredential.user, loading: false });
      return userCredential.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      
      // Sync with backend
      await client.post('/accounts/sync-firebase/', {
        firebase_uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || ''
      });
      
      set({ user: result.user, loading: false });
      return result.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('firebaseToken');
      set({ user: null, error: null });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));