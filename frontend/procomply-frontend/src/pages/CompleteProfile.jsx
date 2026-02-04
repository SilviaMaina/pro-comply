import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthstore } from '../context/useAuthstore';
import { useProfileStore } from '../context/UseProfileStore';

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    // Engineer fields (required for identification)
    first_name: '',
    last_name: '',
    ebk_registration_number: '',
    // UserProfile fields (optional)
    phone_number: '',
    national_id: '',
    engineering_specialization: ''
  });
  const [error, setError] = useState('');
  const { user } = useAuthstore();
  const { updateProfile, loading } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.ebk_registration_number) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate EBK format
    const ebkRegex = /^EBK\/[0-9]{4}\/[0-9]{4,6}$/;
    if (!ebkRegex.test(formData.ebk_registration_number)) {
      setError('EBK number must be in format: EBK/YYYY/XXXXX (e.g., EBK/2020/12345)');
      return;
    }

    try {
      // Update profile (includes Engineer fields)
      await updateProfile(formData);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    }
  };

  if (!user) {
    return <div>Please log in first.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Complete Your Profile</h2>
        <p className="text-center text-gray-600 mb-6">
          Welcome! Please complete your profile to continue.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Engineer Fields */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-3">Required Information</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EBK Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="ebk_registration_number"
                placeholder="EBK/2020/12345"
                value={formData.ebk_registration_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: EBK/YYYY/XXXXX</p>
            </div>
          </div>

          {/* Optional Profile Fields */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Additional Information (Optional)</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                name="phone_number"
                placeholder="+254712345678"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                name="national_id"
                placeholder="12345678"
                maxLength="8"
                value={formData.national_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engineering Specialization
              </label>
              <select
                name="engineering_specialization"
                value={formData.engineering_specialization}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select Specialization</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Agricultural Engineering">Agricultural Engineering</option>
                <option value="Environmental Engineering">Environmental Engineering</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}