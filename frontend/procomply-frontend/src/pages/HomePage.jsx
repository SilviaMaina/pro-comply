import { useState, useEffect } from 'react';
import { useProfileStore } from '../context/UseProfileStore';


export default function HomePage() {
  const { profile, loading, error, fetchProfile } = useProfileStore();
 
   
  useEffect(() => {
    if (!profile && !loading) {
      fetchProfile();
    }
  }, [profile, loading, fetchProfile]);
    

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