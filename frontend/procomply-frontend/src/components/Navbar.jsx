// src/components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Navbar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navItems = [
    { name: 'Dashboard', path: '/home', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'CPD Activities', path: '/cpd', icon: FileText },
    { name: 'License Renewal', path: '/renewal', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Pro-Comply</h1>
          <button
            onClick={closeSidebar}
            className="md:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
            <li className="mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  closeSidebar();
                  onLogout();
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Hamburger */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg shadow-lg"
        >
          ☰
        </button>
      )}
    </>
  );
}