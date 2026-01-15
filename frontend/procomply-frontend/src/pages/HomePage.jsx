import { useState, useEffect } from 'react';
import client from '../api/client';

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get('/profile/');
        setProfile(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Unable to load profile. Please log in again.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

 
  if (loading) {
    return <div className="p-8 text-center">Loading your dashboard...</div>;
  }

 
  if (error || !profile) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error || 'Session expired. Please log in again.'}</p>
        <a href="/login" className="text-indigo-600 hover:underline mt-4 inline-block">
          Go to Login
        </a>
      </div>
    );
  }

 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome, {profile.engineer_name}!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p><strong>License Status:</strong> {profile.license_status}</p>
          </div>
          <div>
            <p><strong>PDU Credits:</strong> {profile.pdu_units_earned} / {profile.pdu_units_required}</p>
          </div>
        </div>
      </div>
    </div>
  );
}