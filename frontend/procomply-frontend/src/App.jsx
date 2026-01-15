import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage  from  './pages/HomePage';
import Login  from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';





function App() {

  function AuthLayout() {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-gray-100">
        <Navbar onLogout={logout} />
        <div className="ml-0 md:ml-64 flex-1 p-6">
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
   
  );
}


  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
