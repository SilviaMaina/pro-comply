import { useState, useEffect } from 'react';
import { useProfileStore } from '../context/UseProfileStore';

export default function Profile() {
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    updateProfile 
  } = useProfileStore();
  
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        // Engineer fields
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        ebk_registration_number: profile.ebk_registration_number || '',
        // Profile fields
        phone_number: profile.phone_number || '',
        national_id: profile.national_id || '',
        license_expiry_date: profile.license_expiry_date || '',
        engineering_specialization: profile.engineering_specialization || '',
        pdu_units_earned: profile.pdu_units_earned || 0,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate EBK format if changed
    if (formData.ebk_registration_number) {
      const ebkRegex = /^EBK\/[0-9]{4}\/[0-9]{4,6}$/;
      if (!ebkRegex.test(formData.ebk_registration_number)) {
        alert('EBK number must be in format: EBK/YYYY/XXXXX');
        return;
      }
    }
    
    try {
      await updateProfile(formData);
      setEditMode(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchProfile}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8">No profile data.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Engineer Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Engineer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EBK Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="ebk_registration_number"
                value={formData.ebk_registration_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                placeholder="EBK/2020/12345"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: EBK/YYYY/XXXXX</p>
            </div>
          </div>

          {/* Contact & Personal Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Contact & Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+254712345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <input
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  maxLength="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Professional Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engineering Specialization
                </label>
                <select
                  name="engineering_specialization"
                  value={formData.engineering_specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Expiry Date
                </label>
                <input
                  name="license_expiry_date"
                  type="date"
                  value={formData.license_expiry_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDU Units Earned
                </label>
                <input
                  name="pdu_units_earned"
                  type="number"
                  min="0"
                  value={formData.pdu_units_earned}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                // Reset form to current profile data
                if (profile) {
                  setFormData({
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    ebk_registration_number: profile.ebk_registration_number || '',
                    phone_number: profile.phone_number || '',
                    national_id: profile.national_id || '',
                    license_expiry_date: profile.license_expiry_date || '',
                    engineering_specialization: profile.engineering_specialization || '',
                    pdu_units_earned: profile.pdu_units_earned || 0,
                  });
                }
              }}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Engineer Information Display */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Engineer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Full Name</span>
                <p className="font-medium text-lg">{profile.engineer_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">Email</span>
                <p className="text-gray-700">{profile.engineer_email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">EBK Registration</span>
                <p className="font-mono font-medium">{profile.ebk_registration_number || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information Display */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Phone Number</span>
                <p className="text-gray-700">{profile.phone_number || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">National ID</span>
                <p className="text-gray-700">{profile.national_id || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information Display */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Specialization</span>
                <p className="text-gray-700">{profile.engineering_specialization || 'Not set'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">License Status</span>
                <p className={`font-medium inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  profile.license_status === 'Valid' ? 'bg-green-100 text-green-800' :
                  profile.license_status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {profile.license_status}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 block mb-1">PDU Credits</span>
                <div className="flex items-center">
                  <p className="text-gray-700 mr-2">
                    {profile.pdu_units_earned} / {profile.pdu_units_required}
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 max-w-xs">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{width: `${(profile.pdu_units_earned / profile.pdu_units_required) * 100}%`}}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.pdu_units_remaining} units remaining
                </p>
              </div>
              {profile.license_expiry_date && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">License Expiry</span>
                  <p className="text-gray-700">
                    {new Date(profile.license_expiry_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}