import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../context/UseProfileStore';
import { useCPDStore } from '../context/UseCPDStore';
import { useThemeStore } from '../context/useThemeStore';
import {
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { profile, loading: profileLoading, error: profileError, fetchProfile } = useProfileStore();
  const { 
    activities, 
    summary, 
    loading: cpdLoading, 
    error: cpdError, 
    fetchActivities, 
    fetchSummary 
  } = useCPDStore();
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!profile && !profileLoading) {
      fetchProfile();
    }
  }, [profile, profileLoading, fetchProfile]);

  useEffect(() => {
    fetchActivities();
    fetchSummary(selectedYear);
  }, [selectedYear, fetchActivities, fetchSummary]);

  if (profileLoading || cpdLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            isDarkMode ? 'border-indigo-400' : 'border-indigo-600'
          }`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="p-8 text-center">
        <div className={`px-4 py-3 rounded mb-4 ${
          isDarkMode 
            ? 'bg-red-900 border border-red-700 text-red-200' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {profileError || 'Session expired. Please log in again.'}
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const recentActivities = activities.slice(0, 5);
  const progressPercentage = summary 
    ? Math.min((summary.total_pdus_earned / summary.total_pdus_required) * 100, 100)
    : 0;

  const statsCards = [
    {
      title: 'Total PDUs Earned',
      value: summary?.total_pdus_earned || 0,
      subtitle: `of ${summary?.total_pdus_required || 50} required`,
      icon: Award,
      color: 'bg-indigo-500',
      trend: '+12 this month',
    },
    {
      title: 'Remaining PDUs',
      value: summary?.total_pdus_remaining || 50,
      subtitle: 'to complete annually',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Activities Logged',
      value: activities.length,
      subtitle: 'this year',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'License Status',
      value: profile.license_status,
      subtitle: profile.license_expiry_date 
        ? `Expires ${new Date(profile.license_expiry_date).toLocaleDateString()}`
        : 'No expiry set',
      icon: CheckCircle,
      color: profile.license_status === 'Valid' ? 'bg-green-500' : 'bg-yellow-500',
    },
  ];

  const activityTypeLabels = {
    'EBK_ORGANIZED': 'EBK Organized',
    'PARTICIPATION': 'Participation',
    'PRESENTATION': 'Presentation',
    'KNOWLEDGE_CONTRIBUTION': 'Knowledge Contribution',
    'WORK_BASED': 'Work-Based',
    'INFORMAL': 'Informal Learning',
    'ACCREDITED_PROVIDER': 'Accredited Provider',
  };

  const cardClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700 shadow-lg' 
    : 'bg-white border-gray-200 shadow-sm';
  
  const textPrimaryClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textTertiaryClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimaryClass}`}>
            Welcome back, {profile.first_name} {profile.last_name}!
          </h1>
          <p className={`mt-2 ${textSecondaryClass}`}>
            Here's your CPD progress overview
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate('/cpd-logging')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add CPD Activity</span>
          </button>
        </div>
      </div>

      {/* Year Selector */}
      <div className={`p-4 rounded-lg border ${cardClass}`}>
        <label className={`text-sm font-medium ${textSecondaryClass}`}>View Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className={`ml-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border hover:shadow-md transition ${cardClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${textSecondaryClass}`}>{stat.title}</p>
                  <p className={`mt-2 text-3xl font-bold ${textPrimaryClass}`}>{stat.value}</p>
                  <p className={`mt-1 text-sm ${textTertiaryClass}`}>{stat.subtitle}</p>
                  {stat.trend && (
                    <p className="mt-2 text-xs text-green-600">{stat.trend}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className={`p-6 rounded-lg border ${cardClass}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>Annual PDU Progress</h3>
          <span className="text-sm font-medium text-indigo-600">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className={`w-full rounded-full h-4 overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className={`mt-2 text-sm ${textSecondaryClass}`}>
          {summary?.total_pdus_earned || 0} of {summary?.total_pdus_required || 50} PDUs earned
        </p>
      </div>

      {/* Category Breakdown */}
      {summary?.breakdown_by_category && (
        <div className={`p-6 rounded-lg border ${cardClass}`}>
          <h3 className={`text-lg font-semibold mb-4 ${textPrimaryClass}`}>
            PDUs by Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summary.breakdown_by_category).map(([type, data]) => (
              <div
                key={type}
                className={`p-4 border rounded-lg transition ${
                  isDarkMode 
                    ? 'border-gray-700 hover:border-indigo-500' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${textSecondaryClass}`}>
                    {activityTypeLabels[type] || type}
                  </p>
                  <span className={`text-xs ${textTertiaryClass}`}>
                    Limit: {data.limit}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${textPrimaryClass}`}>{data.earned}</span>
                  <span className={`text-sm ${textTertiaryClass}`}>/ {data.limit} PDUs</span>
                </div>
                <div className={`mt-2 w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${Math.min((data.earned / data.limit) * 100, 100)}%` }}
                  />
                </div>
                {data.remaining > 0 && (
                  <p className={`mt-1 text-xs ${textTertiaryClass}`}>
                    {data.remaining} PDUs remaining
                  </p>
                )}
                {data.remaining === 0 && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Category limit reached
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className={`p-6 rounded-lg border ${cardClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>Recent Activities</h3>
          <button
            onClick={() => navigate('/cpd')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <FileText className={`w-12 h-12 mx-auto mb-3 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <p className={textTertiaryClass}>No CPD activities logged yet</p>
            <button
              onClick={() => navigate('/cpd')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Log Your First Activity
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition cursor-pointer ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => navigate(`/cpd-logging/${activity.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium ${textPrimaryClass}`}>{activity.title}</h4>
                    {activity.status === 'APPROVED' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${textTertiaryClass}`}>
                    {activityTypeLabels[activity.activity_type]} • {activity.hours_spent} hours
                  </p>
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {new Date(activity.date_completed).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">
                    {activity.pdu_units_awarded}
                  </p>
                  <p className={`text-xs ${textTertiaryClass}`}>PDUs</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/cpd')}
          className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition text-left"
        >
          <Plus className="w-6 h-6 mb-2" />
          <h4 className="font-semibold">Log Activity</h4>
          <p className="text-sm opacity-90">Add new CPD activity</p>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`p-4 border-2 rounded-lg transition text-left ${
            isDarkMode
              ? 'bg-gray-800 border-indigo-500 hover:border-indigo-400'
              : 'bg-white border-indigo-200 hover:border-indigo-400'
          }`}
        >
          <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
          <h4 className={`font-semibold ${textPrimaryClass}`}>Update Profile</h4>
          <p className={`text-sm ${textSecondaryClass}`}>Manage your information</p>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className={`p-4 border-2 rounded-lg transition text-left ${
            isDarkMode
              ? 'bg-gray-800 border-indigo-500 hover:border-indigo-400'
              : 'bg-white border-indigo-200 hover:border-indigo-400'
          }`}
        >
          <FileText className="w-6 h-6 text-indigo-600 mb-2" />
          <h4 className={`font-semibold ${textPrimaryClass}`}>View Reports</h4>
          <p className={`text-sm ${textSecondaryClass}`}>Generate PDU reports</p>
        </button>
      </div>
    </div>
  );
}