import { useState, useEffect } from 'react';
import { useProfileStore } from '../context/UseProfileStore';
import { useThemeStore } from '../context/useThemeStore';
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
  const { isDarkMode } = useThemeStore();

  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);
      
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
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
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

  const cardClass = isDarkMode
    ? 'bg-gray-800 border-gray-700 shadow-lg'
    : 'bg-white border-gray-200 shadow-sm';

  const textPrimaryClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDarkMode ? 'text-white' : 'text-gray-600';
  const textTertiaryClass = isDarkMode ? 'text-white' : 'text-gray-500';
  
  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900';

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDarkMode ? 'border-indigo-400' : 'border-indigo-600'
        }`}></div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-8">
        <div className={`border rounded-lg p-6 ${
          isDarkMode 
            ? 'bg-red-900 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className={`p-8 ${textPrimaryClass}`}>No profile data.</div>;
  }

  // Get engineer's full name from formData (when editing) or profile (when viewing)
  const engineerFullName = editMode 
    ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Engineer'
    : profile.engineer_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Engineer';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header - Always black text */}
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
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-4 ${textPrimaryClass}`}>Profile Photo</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo Preview */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className={`w-16 h-16 ${textTertiaryClass}`} />
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
                  <div className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition w-fit ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}>
                    <Camera className={`w-5 h-5 ${textSecondaryClass}`} />
                    <span className={textSecondaryClass}>Choose Photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className={`text-sm mt-2 ${textTertiaryClass}`}>
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                {photoFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ New photo selected
                  </p>
                )}
              </div>
            </div>

            {/* Display Engineer Name while editing */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className={`w-8 h-8 ${textTertiaryClass}`} />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${textPrimaryClass}`}>
                    {engineerFullName}
                  </h3>
                  <p className={textSecondaryClass}>{profile.email}</p>
                  {formData.ebk_registration_number && (
                    <p className={`text-sm font-mono mt-1 ${textTertiaryClass}`}>
                      {formData.ebk_registration_number}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Engineer Information Section */}
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${textPrimaryClass} ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              Engineer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                EBK Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                name="ebk_registration_number"
                value={formData.ebk_registration_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono ${inputClass}`}
                placeholder="EBK/2020/12345"
                required
              />
            </div>
          </div>

          {/* Contact & Personal Information Section */}
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${textPrimaryClass} ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              Contact & Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  Phone Number
                </label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
                  placeholder="+254712345678"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  National ID
                </label>
                <input
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  maxLength="8"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${textPrimaryClass} ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              Professional Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  Engineering Specialization
                </label>
                <select
                  name="engineering_specialization"
                  value={formData.engineering_specialization}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
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
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  License Expiry Date
                </label>
                <input
                  name="license_expiry_date"
                  type="date"
                  value={formData.license_expiry_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                  PDU Units Earned
                </label>
                <input
                  name="pdu_units_earned"
                  type="number"
                  min="0"
                  value={formData.pdu_units_earned}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${inputClass}`}
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
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Profile Photo Display */}
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <div className="flex items-center space-x-6">
              <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {profile.profile_photo_url ? (
                  <img 
                    src={profile.profile_photo_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className={`w-12 h-12 ${textTertiaryClass}`} />
                )}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${textPrimaryClass}`}>
                 {engineerFullName}
                </h2>
               <p className={textSecondaryClass}>{profile.engineer_email || profile.email}</p>
                {profile.ebk_registration_number && (
               <p className={`text-sm font-mono mt-1 ${textTertiaryClass}`}>
                  {profile.ebk_registration_number}
               </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Display */}
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${textPrimaryClass} ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className={`text-sm block mb-1 ${textTertiaryClass}`}>Phone Number</span>
                <p className={textSecondaryClass}>{profile.phone_number || 'Not set'}</p>
              </div>
              <div>
                <span className={`text-sm block mb-1 ${textTertiaryClass}`}>National ID</span>
                <p className={textSecondaryClass}>{profile.national_id || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information Display */}
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <h2 className={`text-xl font-semibold mb-4 pb-2 border-b ${textPrimaryClass} ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className={`text-sm block mb-1 ${textTertiaryClass}`}>Specialization</span>
                <p className={textSecondaryClass}>{profile.engineering_specialization || 'Not set'}</p>
              </div>
              <div>
                <span className={`text-sm block mb-1 ${textTertiaryClass}`}>License Status</span>
                <p className={`font-medium inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  profile.license_status === 'Valid' ? 'bg-green-100 text-green-800' :
                  profile.license_status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {profile.license_status}
                </p>
              </div>
              <div>
                <span className={`text-sm block mb-1 ${textTertiaryClass}`}>PDU Credits</span>
                <div className="flex items-center">
                  <p className={`mr-2 ${textSecondaryClass}`}>
                    {profile.pdu_units_earned} / {profile.pdu_units_required}
                  </p>
                  <div className={`flex-1 rounded-full h-2.5 max-w-xs ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{width: `${(profile.pdu_units_earned / profile.pdu_units_required) * 100}%`}}
                    ></div>
                  </div>
                </div>
                <p className={`text-xs mt-1 ${textTertiaryClass}`}>
                  {profile.pdu_units_remaining} units remaining
                </p>
              </div>
              {profile.license_expiry_date && (
                <div>
                  <span className={`text-sm block mb-1 ${textTertiaryClass}`}>License Expiry</span>
                  <p className={textSecondaryClass}>
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