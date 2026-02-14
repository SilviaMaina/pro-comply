import { Link } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Bell,
  Shield,
  Award,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: FileText, title: 'CPD Activity Tracking', description: 'Manage all CPD activities in one place.' },
    { icon: TrendingUp, title: 'Automatic PDU Calculation', description: 'EBK-compliant PDU validation.' },
    { icon: Bell, title: 'License Alerts', description: 'Email reminders before expiry.' },
    { icon: BarChart3, title: 'Reports', description: 'Generate EBK-ready reports.' },
    { icon: Shield, title: 'EBK Compliant', description: 'Built to EBK standards.' },
    { icon: Award, title: 'Category Tracking', description: 'Track PDUs across all categories.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">Pro-Comply</h1>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600 text-white rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-24 px-4">
        <h2 className="text-5xl font-bold mb-6">
          CPD Compliance Made <span className="text-indigo-600">Simple</span>
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          Built for Engineers Board of Kenya professionals.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg"
        >
          Start Free
          <ArrowRight className="ml-2" />
        </Link>
      </section>

      {/* Features */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-8 border rounded-xl hover:shadow-lg transition">
              <Icon className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Pro-Comply</h3>
            <p>CPD tracking for EBK engineers.</p>
            <p className="mt-2 text-sm">
              © {new Date().getFullYear()} Pro-Comply
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li>
                <a
                  href="https://ebk.go.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  EBK Website
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
