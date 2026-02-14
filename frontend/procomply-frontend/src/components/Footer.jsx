import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../context/useThemeStore';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AuthLayout() {
  const { isDarkMode } = useThemeStore();

  return (
    <div className={`flex h-screen overflow-hidden ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}