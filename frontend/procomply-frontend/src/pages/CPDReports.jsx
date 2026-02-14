import { useState, useEffect } from 'react';
import { useCPDStore } from '../context/UseCPDStore';
import { useThemeStore } from '../context/useThemeStore';
import {
  FileText, Download, Calendar, Filter, RefreshCw, 
  AlertCircle, ChevronDown, ChevronUp, Printer
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

export default function CPDReports() {
  const { isDarkMode } = useThemeStore();
  const { activities, loading, error, fetchActivities, downloadReport } = useCPDStore();
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState('date_completed');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const cardClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700 shadow-lg' 
    : 'bg-white border-gray-200 shadow-sm';
  
  const textPrimaryClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDarkMode ? 'text-white' : 'text-gray-600';
  const textTertiaryClass = isDarkMode ? 'text-white' : 'text-gray-500';

  useEffect(() => {
    const loadActivities = async () => {
      try {
        await fetchActivities();
      } catch (err) {
        console.error('Error loading activities:', err);
      }
    };
    loadActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'ALL' || activity.activity_type === filterType;
    const matchesStatus = filterStatus === 'ALL' || activity.status === filterStatus;
    const matchesYear = new Date(activity.date_completed).getFullYear() === selectedYear;
    return matchesType && matchesStatus && matchesYear;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'activity_type':
        aValue = activityTypeLabels[a.activity_type] || a.activity_type;
        bValue = activityTypeLabels[b.activity_type] || b.activity_type;
        break;
      case 'date_completed':
        aValue = new Date(a.date_completed);
        bValue = new Date(b.date_completed);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDownload = async () => {
    if (!activities?.length) {
      alert('No activities to download');
      return;
    }
    
    setIsDownloading(true);
    try {
      await downloadReport(selectedYear);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchActivities();
    } catch (err) {
      console.error('Refresh error:', err);
      alert('Failed to refresh activities. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const totalActivities = sortedActivities.length;
  const approvedCount = sortedActivities.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = sortedActivities.filter(a => a.status === 'REJECTED').length;
  const totalPDUs = sortedActivities
    .filter(a => a.status === 'APPROVED')
    .reduce((sum, a) => sum + a.pdu_units_awarded, 0);

  if (loading && !activities.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            isDarkMode ? 'border-indigo-400' : 'border-indigo-600'
          }`}></div>
          <p className={`mt-4 ${textSecondaryClass}`}>Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - Hidden on print, Always black text */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>CPD Activities Report</h1>
            <p className={`mt-2 ${textSecondaryClass}`}>
              Comprehensive report of all CPD activities
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Printer className="w-5 h-5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !activities?.length}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`border rounded-lg p-4 mt-4 ${
            isDarkMode 
              ? 'bg-red-900 border-red-700' 
              : 'bg-red-50 border-red-200'
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <p className={`text-sm font-medium ${textSecondaryClass}`}>Total Activities</p>
            <p className={`mt-2 text-3xl font-bold ${textPrimaryClass}`}>{totalActivities}</p>
            <p className={`text-xs mt-1 ${textTertiaryClass}`}>{selectedYear}</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <p className={`text-sm font-medium ${textSecondaryClass}`}>Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className={`text-xs mt-1 ${textTertiaryClass}`}>{approvedCount} activities</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <p className={`text-sm font-medium ${textSecondaryClass}`}>Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{rejectedCount}</p>
            <p className={`text-xs mt-1 ${textTertiaryClass}`}>{rejectedCount} activities</p>
          </div>
          <div className={`p-6 rounded-lg border ${cardClass}`}>
            <p className={`text-sm font-medium ${textSecondaryClass}`}>Total PDUs</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">{totalPDUs}</p>
            <p className={`text-xs mt-1 ${textTertiaryClass}`}>of 50 required</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-6 rounded-lg border ${cardClass}`}>
          <div className="flex items-center space-x-2 mb-4">
            <Filter className={`w-5 h-5 ${textTertiaryClass}`} />
            <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {(filterType !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              onClick={() => {
                setFilterType('ALL');
                setFilterStatus('ALL');
              }}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Print Header - Only visible on print */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          CPD Activities Report
        </h1>
        <p className="text-center text-gray-600 mb-1">Year: {selectedYear}</p>
        <p className="text-center text-gray-600 text-sm">
          Generated on {new Date().toLocaleDateString()}
        </p>
        <div className="flex justify-center gap-8 mt-4 text-sm">
          <span><strong>Total:</strong> {totalActivities}</span>
          <span><strong>Approved:</strong> {approvedCount}</span>
          <span><strong>Rejected:</strong> {rejectedCount}</span>
          <span><strong>PDUs:</strong> {totalPDUs}</span>
        </div>
      </div>

      {/* Activities Table */}
      <div className={`rounded-lg border print:shadow-none ${cardClass}`}>
        {sortedActivities.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${textPrimaryClass}`}>No activities found</h3>
            <p className={textSecondaryClass}>
              {filterType !== 'ALL' || filterStatus !== 'ALL'
                ? 'Try adjusting your filters'
                : `No activities recorded for ${selectedYear}`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-700 print:bg-gray-100' : 'bg-gray-50 print:bg-gray-100'}>
                <tr>
                  <th 
                    onClick={() => handleSort('title')}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition print:cursor-default ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-600' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Title {renderSortIcon('title')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider print:hidden ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Description
                  </th>
                  <th 
                    onClick={() => handleSort('activity_type')}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition print:cursor-default ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-600' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Activity Type {renderSortIcon('activity_type')}
                  </th>
                  <th 
                    onClick={() => handleSort('date_completed')}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition print:cursor-default ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-600' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Date Completed {renderSortIcon('date_completed')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition print:cursor-default ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-600' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Status {renderSortIcon('status')}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    PDUs
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider print:hidden ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode 
                  ? 'bg-gray-800 divide-gray-700' 
                  : 'bg-white divide-gray-200'
              }`}>
                {sortedActivities.map((activity) => (
                  <>
                    <tr key={activity.id} className={`transition print:hover:bg-white ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className={`text-sm font-medium ${textPrimaryClass}`}>{activity.title}</div>
                      </td>
                      <td className="px-6 py-4 print:hidden">
                        <div className={`text-sm max-w-md truncate ${textSecondaryClass}`}>
                          {activity.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${textPrimaryClass}`}>
                          {activityTypeLabels[activity.activity_type] || activity.activity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm ${textPrimaryClass}`}>
                          <Calendar className={`w-4 h-4 mr-2 print:hidden ${textTertiaryClass}`} />
                          {new Date(activity.date_completed).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activity.status === 'APPROVED' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-indigo-600">
                          {activity.pdu_units_awarded}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm print:hidden">
                        <button
                          onClick={() => toggleRowExpansion(activity.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {expandedRows.has(activity.id) ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(activity.id) && (
                      <tr className={`print:hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <td colSpan="7" className="px-6 py-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className={`text-sm font-semibold mb-1 ${textSecondaryClass}`}>Description:</h4>
                              <p className={`text-sm ${textSecondaryClass}`}>{activity.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className={`text-sm font-semibold ${textSecondaryClass}`}>Hours Spent:</h4>
                                <p className={`text-sm ${textSecondaryClass}`}>{activity.hours_spent} hours</p>
                              </div>
                              <div>
                                <h4 className={`text-sm font-semibold ${textSecondaryClass}`}>Created:</h4>
                                <p className={`text-sm ${textSecondaryClass}`}>
                                  {new Date(activity.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {activity.rejection_reason && (
                              <div className={`p-3 border rounded-lg ${
                                isDarkMode 
                                  ? 'bg-red-900 border-red-700' 
                                  : 'bg-red-50 border-red-200'
                              }`}>
                                <h4 className={`text-sm font-semibold mb-1 ${
                                  isDarkMode ? 'text-red-200' : 'text-red-800'
                                }`}>Rejection Reason:</h4>
                                <p className={`text-sm ${
                                  isDarkMode ? 'text-red-300' : 'text-red-700'
                                }`}>{activity.rejection_reason}</p>
                              </div>
                            )}
                            {activity.supporting_document_url && (
                              <div>
                                <a
                                  href={activity.supporting_document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  View Supporting Document
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print-only full descriptions */}
      <div className="hidden print:block mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Descriptions</h2>
        {sortedActivities.map((activity, index) => (
          <div key={activity.id} className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">
              {index + 1}. {activity.title}
            </h3>
            <p className="text-sm text-gray-700">{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}