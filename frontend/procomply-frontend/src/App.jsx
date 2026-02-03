// src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar/>
                <AuthLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomePage />} /> 
            <Route path="/profile" element={<Profile />} />
            {/* Add more protected routes here as needed */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}