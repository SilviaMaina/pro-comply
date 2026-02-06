import { useState, useEffect } from 'react';
import { useProfileStore } from '../context/UseProfileStore';
import { Camera, Upload, X, User, Loader } from 'lucide-react';
import client from '../api/client';

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
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update form data when profile loads
  useEffect(() => {
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
      setPhotoPreview(profile.profile_photo_url);
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      try {
        await client.delete('/accounts/profile/photo/delete/');
        setPhotoPreview(null);
        setPhotoFile(null);
        await fetchProfile();
      } catch (error) {
        console.error('Error removing photo:', error);
        alert('Failed to remove photo');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingPhoto(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add photo if selected
      if (photoFile) {
        submitData.append('profile_photo', photoFile);
      }

      await updateProfile(submitData);
      setEditMode(false);
      setPhotoFile(null);
      await fetchProfile();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8">No profile data.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
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
          {/* Profile Photo Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo Preview */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition w-fit">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Choose Photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                {photoFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ New photo selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Engineer Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
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
            </div>
          </div>

          {/* Contact & Personal Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
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
              disabled={loading || uploadingPhoto}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center"
            >
              {loading || uploadingPhoto ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  {uploadingPhoto ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setPhotoFile(null);
                setPhotoPreview(profile.profile_photo_url);
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
          {/* Profile Photo Display */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profile.profile_photo_url ? (
                  <img 
                    src={profile.profile_photo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.engineer_name}
                </h2>
                <p className="text-gray-600">{profile.engineer_email}</p>
                {profile.ebk_registration_number && (
                  <p className="text-sm text-gray-500 font-mono mt-1">
                    {profile.ebk_registration_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rest of profile display remains the same... */}
          {/* Engineer Information Display */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
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