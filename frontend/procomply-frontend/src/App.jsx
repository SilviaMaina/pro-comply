// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthstore } from './context/useAuthstore';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/AuthLayout';
import CompleteProfile from './pages/CompleteProfile';

// Placeholder components for routes that don't exist yet
const CPDActivities = () => <div className="p-8"><h1 className="text-2xl font-bold">CPD Activities - Coming Soon</h1></div>;
const LicenseRenewal = () => <div className="p-8"><h1 className="text-2xl font-bold">License Renewal - Coming Soon</h1></div>;
const Reports = () => <div className="p-8"><h1 className="text-2xl font-bold">Reports - Coming Soon</h1></div>;
const SettingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>;

export default function App() {
  const initializeAuth = useAuthstore(state => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        
        {/* Protected routes with sidebar layout */}
        <Route
          element={
            <ProtectedRoute>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cpd" element={<CPDActivities />} />
          <Route path="/renewal" element={<LicenseRenewal />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}