// src/components/AuthLayout.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet } from 'react-router-dom'; // ✅ Use Outlet for nested routes
import Navbar from './Navbar';

export default function AuthLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar onLogout={logout} />
      <div className="ml-0 md:ml-64 flex-1 p-6">
        <Outlet /> {/* ✅ This renders child routes (HomePage, Profile, etc.) */}
      </div>
    </div>
  );
}