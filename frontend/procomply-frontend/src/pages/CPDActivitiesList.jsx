import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCPDStore } from '../context/UseCPDStore';
import { useThemeStore } from '../context/useThemeStore';
import {
  FileText, CheckCircle, XCircle, Calendar, Clock, Filter,
  Download, Plus, AlertCircle, RefreshCw, Search
} from 'lucide-react';

const activityTypeLabels = {
  'EBK_ORGANIZED': 'EBK Organized',
  'PARTICIPATION': 'Participation',
  'PRESENTATION': 'Presentation',
  'KNOWLEDGE_CONTRIBUTION': 'Knowledge Contribution',
  'WORK_BASED': 'Work-Based',
  'INFORMAL': 'Informal Learning',
  'ACCREDITED_PROVIDER': 'Accredited Provider',
};

export default function CPDActivitiesList() {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { activities, summary, loading, error, fetchActivities, fetchSummary, downloadReport } = useCPDStore();
  
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchActivities(), fetchSummary(selectedYear)]);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchSummary(selectedYear).catch(err => console.error('Error fetching summary:', err));
  }, [selectedYear]);

  const handleAction = async (actionFn, setLoading, successCallback) => {
    setLoading(true);
    try {
      await actionFn();
      successCallback?.();
    } catch (err) {
      console.error('Action error:', err);
      alert('Failed to complete action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!activities?.length) return alert('No activities to download');
    handleAction(
      () => downloadReport(selectedYear),
      setIsDownloading
    );
  };

  const handleRefresh = () => {
    handleAction(
      () => Promise.all([fetchActivities(), fetchSummary(selectedYear)]),
      setIsRefreshing
    );
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'ALL' || activity.activity_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || activity.status === filterStatus;
    const matchesYear = new Date(activity.date_completed).getFullYear() === selectedYear;
    const matchesSearch = !searchTerm || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesYear && matchesSearch;
  });

  const approvedActivities = filteredActivities.filter(a => a.status === 'APPROVED');
  const totalPDUs = approvedActivities.reduce((sum, a) => sum + a.pdu_units_awarded, 0);
  const totalHours = filteredActivities.reduce((sum, a) => sum + a.hours_spent, 0);
  const rejectedCount = filteredActivities.filter(a => a.status === 'REJECTED').length;

  const cardClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700 shadow-lg' 
    : 'bg-white border-gray-200 shadow-sm';
  
  const textPrimaryClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDarkMode ? 'text-white' : 'text-gray-600';
  const textTertiaryClass = isDarkMode ? 'text-white' : 'text-gray-500';

  if (loading && !activities.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            isDarkMode ? 'border-indigo-400' : 'border-indigo-600'
          }`}></div>
          <p className={`mt-4 ${textSecondaryClass}`}>Loading activities...</p>
        </div>
      </div>
    );
  }

  const renderActionButton = (Icon, label, onClick, disabled = false, loading = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
        disabled 
          ? isDarkMode 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      <Icon className={`w-5 h-5 ${loading ? (label.includes('Download') ? 'animate-bounce' : 'animate-spin') : ''}`} />
      <span>{loading ? `${label.split(' ')[0]}...` : label}</span>
    </button>
  );

  const renderStatCard = (title, value, subtitle, color, icon) => (
    <div className={`p-6 rounded-lg border ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textSecondaryClass}`}>{title}</p>
          <p className="mt-2 text-3xl font-bold" style={{ color }}>
            {value}
          </p>
          <p className={`text-xs mt-1 ${textTertiaryClass}`}>{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}10` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header - Always black text */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CPD Activities</h1>
          <p className="mt-2 text-gray-900">
            View and manage your Continuing Professional Development activities
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {renderActionButton(RefreshCw, 'Refresh', handleRefresh, isRefreshing, isRefreshing)}
          {renderActionButton(Download, 'Download Report', handleDownloadReport, isDownloading || !activities?.length, isDownloading)}
          {renderActionButton(Plus, 'Log Activity', () => navigate('/cpd-logging'))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-red-900 border border-red-700' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
              <button onClick={handleRefresh} className={`mt-2 text-sm underline ${
                isDarkMode ? 'text-red-300 hover:text-red-200' : 'text-red-700 hover:text-red-800'
              }`}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatCard('Total Activities', filteredActivities.length, `${selectedYear}`, '#6B7280', <FileText className="w-6 h-6 text-gray-600" />)}
        {renderStatCard('PDUs Earned', totalPDUs, `of ${summary?.total_pdus_required || 50} required`, '#10B981', <CheckCircle className="w-6 h-6 text-green-600" />)}
        {renderStatCard('Total Hours', totalHours, 'logged', '#8B5CF6', <Clock className="w-6 h-6 text-purple-600" />)}
        {renderStatCard('Approved', approvedActivities.length, `${rejectedCount} rejected`, '#3B82F6', <CheckCircle className="w-6 h-6 text-blue-600" />)}
      </div>

      {/* Search and Filters */}
      <div className={`p-6 rounded-lg border ${cardClass}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Filter className={`w-5 h-5 ${textTertiaryClass}`} />
          <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>Search & Filter</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>Search</label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textTertiaryClass}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities..."
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>Activity Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="ALL">All Types</option>
              {Object.entries(activityTypeLabels).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {(filterType !== 'ALL' || filterStatus !== 'ALL' || searchTerm) && (
          <button
            onClick={() => {
              setFilterType('ALL');
              setFilterStatus('ALL');
              setSearchTerm('');
            }}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Activities List */}
      <div className={`rounded-lg border ${cardClass}`}>
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${textPrimaryClass}`}>No activities found</h3>
            <p className={`mb-6 ${textSecondaryClass}`}>
              {filterType !== 'ALL' || filterStatus !== 'ALL' || searchTerm
                ? 'Try adjusting your filters or search term'
                : 'Start logging your CPD activities to track your professional development'
              }
            </p>
            {!filterType && !filterStatus && !searchTerm && (
              <button
                onClick={() => navigate('/cpd-logging')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Log Your First Activity
              </button>
            )}
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredActivities.map(activity => (
              <div key={activity.id} className={`p-6 transition ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>{activity.title}</h3>
                      {activity.status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" /> Rejected
                        </span>
                      )}
                    </div>

                    <p className={`mb-3 line-clamp-2 ${textSecondaryClass}`}>{activity.description}</p>

                    <div className={`flex flex-wrap gap-4 text-sm ${textTertiaryClass}`}>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {activityTypeLabels[activity.activity_type] || activity.activity_type}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(activity.date_completed).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {activity.hours_spent} hours
                      </span>
                    </div>

                    {activity.rejection_reason && (
                      <div className={`mt-3 p-3 border rounded-lg ${
                        isDarkMode 
                          ? 'bg-red-900 border-red-700' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                          <strong>Rejection reason:</strong> {activity.rejection_reason}
                        </p>
                      </div>
                    )}

                    {activity.supporting_document_url && (
                      <a
                        href={activity.supporting_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        View Supporting Document
                      </a>
                    )}
                  </div>

                  <div className="lg:ml-6 text-left lg:text-right">
                    <p className="text-4xl font-bold text-indigo-600">{activity.pdu_units_awarded}</p>
                    <p className={`text-sm mt-1 ${textTertiaryClass}`}>PDUs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}