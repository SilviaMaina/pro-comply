import { useThemeStore } from '../context/useThemeStore';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  const { isDarkMode } = useThemeStore();
  const currentYear = new Date().getFullYear();

  const footerBg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <footer className={`${footerBg} mt-auto print:hidden border-t ${borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm">
          {/* Brand & Copyright */}
          <div className="flex items-center gap-2">
            <h2 
              className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'cursive' }}
            >
              Pro-Comply
            </h2>
            <span className={textSecondary}>•</span>
            <span className={textSecondary}>© {currentYear}</span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4">
            <a 
              href="mailto:support@procomply.co.ke"
              className={`flex items-center gap-2 ${textSecondary} hover:text-indigo-600 transition-colors`}
            >
              <Mail className="w-4 h-4" />
              <span>support@procomply.co.ke</span>
            </a>
            <span className={`hidden sm:inline ${textSecondary}`}>•</span>
            <a 
              href="tel:+254700000000"
              className={`hidden sm:flex items-center gap-2 ${textSecondary} hover:text-indigo-600 transition-colors`}
            >
              <Phone className="w-4 h-4" />
              <span>+254 700 000 000</span>
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors`}>
              Privacy
            </a>
            <span className={textSecondary}>•</span>
            <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors`}>
              Terms
            </a>
            <span className={textSecondary}>•</span>
            <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors`}>
              Help
            </a>
            <span className={textSecondary}>•</span>
            <a 
              href="https://ebk.go.ke" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${textSecondary} hover:text-indigo-600 transition-colors`}
            >
              EBK
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}