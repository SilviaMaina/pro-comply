import { useThemeStore } from '../context/useThemeStore';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  const { isDarkMode } = useThemeStore();
  const currentYear = new Date().getFullYear();

  const footerBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-800';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-400';

  return (
    <footer className={`${footerBg} text-white mt-auto print:hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <h2 
              className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: 'cursive' }}
            >
              Pro-Comply
            </h2>
            <span className={textSecondary}>•</span>
            <span className={textSecondary}>© {currentYear}</span>
          </div>

          {/* Contact */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className={`w-4 h-4 ${textSecondary}`} />
              <span className={textSecondary}>support@procomply.co.ke</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className={`w-4 h-4 ${textSecondary}`} />
              <span className={textSecondary}>+254 700 000 000</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-4 text-sm">
            <a href="#" className={`${textSecondary} hover:text-indigo-400 transition-colors`}>
              Privacy
            </a>
            <a href="#" className={`${textSecondary} hover:text-indigo-400 transition-colors`}>
              Terms
            </a>
            <a href="#" className={`${textSecondary} hover:text-indigo-400 transition-colors`}>
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}