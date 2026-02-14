import { useThemeStore } from '../context/useThemeStore';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const { isDarkMode } = useThemeStore();
  const currentYear = new Date().getFullYear();

  const footerBg = isDarkMode ? 'bg-gray-900' : 'bg-gray-800';
  const textPrimary = 'text-white';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-400';
  const borderColor = 'border-gray-700';

  const footerLinks = {
    quickLinks: [
      { name: 'Dashboard', path: '/home' },
      { name: 'Profile', path: '/profile' },
      { name: 'CPD Activities', path: '/cpd' },
      { name: 'Reports', path: '/cpd-reports' },
    ],
    resources: [
      { name: 'EBK Guidelines', path: '#' },
      { name: 'PDU Categories', path: '#' },
      { name: 'Help Center', path: '#' },
      { name: 'FAQs', path: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
      { name: 'Compliance', path: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className={`${footerBg} ${textPrimary} mt-auto print:hidden`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Pro-Comply
            </h2>
            <p className={`${textSecondary} mb-6`}>
              CPD tracking and compliance platform for Engineers Board of Kenya (EBK).
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span className={textSecondary}>support@procomply.co.ke</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span className={textSecondary}>+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span className={textSecondary}>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {section.replace(/([A-Z])/g, ' $1')}
              </h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      className={`${textSecondary} hover:text-indigo-400 transition`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className={`mt-12 pt-6 border-t ${borderColor} flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`${textSecondary} hover:text-indigo-400 transition`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <p className={textSecondary}>
            © {currentYear} Pro-Comply. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
