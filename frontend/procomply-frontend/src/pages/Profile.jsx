// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import client from '../api/client';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get('/profile/');
        setProfile(res.data);
        setFormData({
          phone_number: res.data.phone_number || '',
          national_id: res.data.national_id || '',
          license_expiry_date: res.data.license_expiry_date || '',
          pdu_units_earned: res.data.pdu_units_earned || 0,
        });
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await client.put('/profile/', formData);
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">National ID</label>
            <input
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Expiry Date</label>
            <input
              name="license_expiry_date"
              type="date"
              value={formData.license_expiry_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PDU Units Earned</label>
            <input
              name="pdu_units_earned"
              type="number"
              min="0"
              value={formData.pdu_units_earned}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-500">Name</span>
              <p className="font-medium">{profile.engineer_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p>{profile.engineer_email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">EBK Registration</span>
              <p>{/* You'll need to add this to your serializer */}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Phone</span>
              <p>{profile.phone_number || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">National ID</span>
              <p>{profile.national_id || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">License Status</span>
              <p className="font-medium">{profile.license_status}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">PDU Credits</span>
              <p>{profile.pdu_units_earned} / {profile.pdu_units_required}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}