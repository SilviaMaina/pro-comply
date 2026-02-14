import { useThemeStore } from '../context/useThemeStore';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const { isDarkMode } = useThemeStore();
  const currentYear = new Date().getFullYear();

  const footerBg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textTertiary = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className={`${footerBg} mt-auto print:hidden border-t ${borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Description */}
          <div>
            <h2 
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3"
              style={{ fontFamily: 'cursive' }}
            >
              Pro-Comply
            </h2>
            <p className={`${textSecondary} text-sm mb-4 max-w-xs`}>
              Your comprehensive platform for managing CPD activities and maintaining EBK compliance.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`${textTertiary} hover:text-indigo-600 transition-colors p-2 rounded-lg ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className={`${textPrimary} font-semibold mb-4`}>Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className={`w-5 h-5 ${textTertiary} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`${textSecondary} text-sm`}>Email</p>
                  <a 
                    href="mailto:support@procomply.co.ke"
                    className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm`}
                  >
                    support@procomply.co.ke
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className={`w-5 h-5 ${textTertiary} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`${textSecondary} text-sm`}>Phone</p>
                  <a 
                    href="tel:+254700000000"
                    className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm`}
                  >
                    +254 700 000 000
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className={`w-5 h-5 ${textTertiary} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`${textSecondary} text-sm`}>Location</p>
                  <p className={`${textSecondary} text-sm`}>Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`${textPrimary} font-semibold mb-4`}>Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  Dashboard
                </a>
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  Profile
                </a>
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  CPD Activities
                </a>
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  Reports
                </a>
              </div>
              <div className="space-y-2">
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  Help Center
                </a>
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  Privacy Policy
                </a>
                <a href="#" className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}>
                  Terms of Service
                </a>
                <a 
                  href="https://ebk.go.ke" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${textSecondary} hover:text-indigo-600 transition-colors text-sm block`}
                >
                  EBK Website
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 border-t ${borderColor}`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className={`${textTertiary} text-sm`}>
              © {currentYear} Pro-Comply. All rights reserved.
            </p>

            {/* EBK Compliance Notice */}
            <p className={`${textTertiary} text-sm text-center md:text-right`}>
              Designed for{' '}
              <a 
                href="https://ebk.go.ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                Engineers Board of Kenya
              </a>
              {' '}compliance
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}