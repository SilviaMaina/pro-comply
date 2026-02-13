import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthstore } from '../context/useAuthstore';
import { useThemeStore } from '../context/useThemeStore';
import {
  Home,
  User,
  FileText,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthstore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    try {
      closeSidebar();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/home', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'CPD Logging', path: '/cpd-logging', icon: FileText },
    { name: 'CPD Activities', path: '/cpd', icon: Calendar },
    { name: 'Reports', path: '/cpd-reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg transition-colors ${
          isDarkMode
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
          flex flex-col
          shadow-2xl
          ${
            isDarkMode
              ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
              : 'bg-white text-gray-900 border-r border-gray-200'
          }
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${
          isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
        }`}>
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            {!isCollapsed && (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" 
                  style={{ fontFamily: 'cursive' }}>
                Pro-Comply
              </h1>
            )}
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className={`lg:hidden transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Collapse button for desktop */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:block transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className={`p-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-semibold text-white">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.displayName || 'Engineer'}
                </p>
                <p className={`text-xs truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`
                      flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
                      ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                          : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <span className="ml-auto w-2 h-2 bg-white rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle & Logout */}
        <div className={`p-4 space-y-2 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              flex items-center space-x-3 px-3 py-3 rounded-lg w-full transition-all
              ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={isCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-3 px-3 py-3 rounded-lg w-full transition-all
              ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-red-600 hover:text-white'
                  : 'text-gray-700 hover:bg-red-600 hover:text-white'
              }
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Version Info */}
        {!isCollapsed && (
          <div className={`p-4 text-center text-xs ${
            isDarkMode 
              ? 'text-gray-500 border-t border-gray-700' 
              : 'text-gray-400 border-t border-gray-200'
          }`}>
            v1.0.0
          </div>
        )}
      </aside>
    </>
  );
}