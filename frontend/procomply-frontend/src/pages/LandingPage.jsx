import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Pro-Comply</h1>
        <p className="text-gray-600 mb-8">
          Smart CPD Tracker & License Renewal Assistant for Kenyan Engineers
        </p>
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full py-3 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block w-full py-3 px-6 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}