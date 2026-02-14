import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCPDStore } from '../context/UseCPDStore';
import { useThemeStore } from '../context/useThemeStore';
import { X, Upload, Loader, AlertCircle, CheckCircle, ArrowLeft, FileText } from 'lucide-react';

export default function CPDLogging() {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { createActivity, loading } = useCPDStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: '',
    date_completed: '',
    hours_spent: '',
    supporting_document: null,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const activityTypes = [
    { value: 'EBK_ORGANIZED', label: 'EBK Organized Activities', maxPDUs: 10, description: 'Workshops, seminars organized by EBK' },
    { value: 'PARTICIPATION', label: 'Participation (Mentoring, Committees)', maxPDUs: 5, description: 'Mentoring, committee work, peer reviews' },
    { value: 'PRESENTATION', label: 'Presentations', maxPDUs: 10, description: 'Technical presentations, lectures' },
    { value: 'KNOWLEDGE_CONTRIBUTION', label: 'Contributions to Knowledge', maxPDUs: 10, description: 'Publications, research, patents' },
    { value: 'WORK_BASED', label: 'Work-Based Activities', maxPDUs: 10, description: 'On-the-job learning, projects (1 PDU per 100 hours)' },
    { value: 'INFORMAL', label: 'Informal (Self-Study, Conferences)', maxPDUs: 10, description: 'Self-directed learning, conferences' },
    { value: 'ACCREDITED_PROVIDER', label: 'Accredited Service Provider', maxPDUs: 25, description: 'Courses from accredited institutions' },
  ];

  const cardClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700 shadow-lg' 
    : 'bg-white border-gray-200 shadow-sm';
  
  const textPrimaryClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDarkMode ? 'text-white' : 'text-gray-700';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          supporting_document: 'Only PDF, JPG, and PNG files are allowed' 
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          supporting_document: 'File size must be less than 5MB' 
        }));
        return;
      }

      setFormData(prev => ({ ...prev, supporting_document: file }));
      setFilePreview(file.name);
      
      if (errors.supporting_document) {
        setErrors(prev => ({ ...prev, supporting_document: '' }));
      }
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, supporting_document: null }));
    setFilePreview(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.activity_type) {
      newErrors.activity_type = 'Activity type is required';
    }

    if (!formData.date_completed) {
      newErrors.date_completed = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date_completed);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date_completed = 'Date cannot be in the future';
      }
    }

    if (!formData.hours_spent || formData.hours_spent <= 0) {
      newErrors.hours_spent = 'Hours must be greater than 0';
    } else if (formData.hours_spent > 1000) {
      newErrors.hours_spent = 'Hours must be less than 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validate()) {
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('activity_type', formData.activity_type);
      submitData.append('date_completed', formData.date_completed);
      submitData.append('hours_spent', formData.hours_spent);
      
      if (formData.supporting_document) {
        submitData.append('supporting_document', formData.supporting_document);
      }

      await createActivity(submitData);
      setSubmitSuccess(true);
      
      setFormData({
        title: '',
        description: '',
        activity_type: '',
        date_completed: '',
        hours_spent: '',
        supporting_document: null,
      });
      setFilePreview(null);

      setTimeout(() => {
        navigate('/cpd');
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to create activity. Please try again.');
    }
  };

  const selectedTypeInfo = activityTypes.find(t => t.value === formData.activity_type);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - Always black text */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/cpd')}
          className={`p-2 rounded-lg transition ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log CPD Activity</h1>
          <p className="mt-2 text-white">
            Record your continuing professional development activities
          </p>
        </div>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className={`border rounded-lg p-4 ${
          isDarkMode 
            ? 'bg-green-900 border-green-700' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className={`font-semibold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                Activity logged successfully!
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                Your activity has been submitted and validated. Redirecting to activities list...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className={`rounded-lg border p-6 ${cardClass}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className={`border px-4 py-3 rounded-lg flex items-start ${
              isDarkMode 
                ? 'bg-red-900 border-red-700 text-red-200' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
              Activity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Advanced Project Management Workshop"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.title 
                  ? 'border-red-300 bg-red-50' 
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe what you learned, skills gained, and how this activity contributes to your professional development..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.description 
                  ? 'border-red-300 bg-red-50' 
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Activity Type */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
              Activity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.activity_type 
                  ? 'border-red-300 bg-red-50' 
                  : isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={loading}
            >
              <option value="">Select activity type</option>
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} (Max {type.maxPDUs} PDUs)
                </option>
              ))}
            </select>
            {errors.activity_type && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.activity_type}
              </p>
            )}
            {selectedTypeInfo && (
              <div className={`mt-2 p-3 border rounded-lg ${
                isDarkMode 
                  ? 'bg-blue-900 border-blue-700' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Category Info:</strong> {selectedTypeInfo.description}
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  Maximum {selectedTypeInfo.maxPDUs} PDUs per year for this category
                </p>
              </div>
            )}
          </div>

          {/* Date and Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                Date Completed <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_completed"
                value={formData.date_completed}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.date_completed 
                    ? 'border-red-300 bg-red-50' 
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                disabled={loading}
              />
              {errors.date_completed && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.date_completed}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
                Hours Spent <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hours_spent"
                value={formData.hours_spent}
                onChange={handleChange}
                min="1"
                max="1000"
                placeholder="e.g., 8"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.hours_spent 
                    ? 'border-red-300 bg-red-50' 
                    : isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                disabled={loading}
              />
              {errors.hours_spent && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.hours_spent}
                </p>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${textSecondaryClass}`}>
              Supporting Document (Certificate/Proof)
            </label>
            
            {!filePreview ? (
              <div className="mt-1">
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  isDarkMode 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PDF, JPG, or PNG (max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </label>
              </div>
            ) : (
              <div className={`mt-1 flex items-center justify-between p-4 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className={`text-sm font-medium ${textPrimaryClass}`}>{filePreview}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ready to upload</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className={`p-2 rounded-lg transition ${
                    isDarkMode 
                      ? 'text-red-400 hover:bg-red-900' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {errors.supporting_document && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.supporting_document}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className={`border rounded-lg p-4 ${
            isDarkMode 
              ? 'bg-indigo-900 border-indigo-700' 
              : 'bg-indigo-50 border-indigo-200'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 flex items-center ${
              isDarkMode ? 'text-indigo-200' : 'text-indigo-900'
            }`}>
              <AlertCircle className="w-4 h-4 mr-2" />
              PDU Calculation & Validation
            </h4>
            <ul className={`text-sm space-y-1 ml-6 list-disc ${
              isDarkMode ? 'text-indigo-300' : 'text-indigo-800'
            }`}>
              <li>PDUs are automatically calculated based on EBK guidelines</li>
              <li>Activities are validated against annual category limits</li>
              <li>Maximum 50 PDUs per year (40 structured + 10 unstructured)</li>
              <li>Each category has specific limits (shown in dropdown)</li>
              <li>Your activity will be approved or rejected automatically</li>
            </ul>
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-end space-x-3 pt-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={() => navigate('/cpd')}
              className={`px-6 py-3 border rounded-lg transition ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              <span>{loading ? 'Submitting...' : 'Log Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}