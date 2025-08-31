import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Flag, RefreshCw, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const NationalHolidays = ({ onAddHoliday, API_BASE_URL, token, existingHolidays = [] }) => {
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const popupRef = useRef(null);

  // Filter out holidays that are already in the user's list - use useMemo to prevent recalculation on every render
  const availableHolidays = useMemo(() => {
    if (!Array.isArray(nationalHolidays)) return [];
    if (!Array.isArray(existingHolidays)) return nationalHolidays;
    
    const filtered = nationalHolidays.filter(nationalHoliday => {
      // Extract the date string from national holiday (could be { iso: "2025-01-26" } or "2025-01-26")
      const nationalDate = typeof nationalHoliday.date === 'object' && nationalHoliday.date.iso 
        ? nationalHoliday.date.iso 
        : nationalHoliday.date;
      
      // Check if this holiday already exists
      return !existingHolidays.some(existingHoliday => 
        existingHoliday.name === nationalHoliday.name && 
        existingHoliday.date === nationalDate
      );
    });
    
    // Sort holidays by date (earliest first)
    return filtered.sort((a, b) => {
      const dateA = typeof a.date === 'object' && a.date.iso ? a.date.iso : a.date;
      const dateB = typeof b.date === 'object' && b.date.iso ? b.date.iso : b.date;
      return new Date(dateA) - new Date(dateB);
    });
  }, [nationalHolidays, existingHolidays]);

  const fetchOfficialIndianHolidays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Using your backend API for official Indian holidays
      const response = await fetch(
        `${API_BASE_URL}/holidays/official?year=${currentYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const responseData = await response.json();
        // Extract holidays from the response object
        const holidays = responseData.holidays || responseData;
        setNationalHolidays(holidays);
      } else {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        setError(`API Error: ${response.status} - ${response.statusText}`);
        setNationalHolidays([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError(`Network Error: ${error.message}`);
      setNationalHolidays([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  const handleAddHoliday = (holiday) => {
    // Extract the actual date string from the holiday object
    let dateString;
    if (typeof holiday.date === 'object' && holiday.date.iso) {
      // Calendarific format: { iso: "2025-01-26" }
      dateString = holiday.date.iso;
    } else if (typeof holiday.date === 'string') {
      // Direct string format
      dateString = holiday.date;
    } else {
      console.error('Cannot determine date format for holiday:', holiday);
      return;
    }
    
    const holidayData = {
      name: holiday.name,
      date: dateString
    };
    
    onAddHoliday(holidayData);
    
    // Don't close popup - let user add multiple holidays
    // The availableHolidays will automatically update due to the useMemo dependency
  };

  // Memoized date formatting to prevent repeated calculations
  const formatDate = useCallback((dateString) => {
    // Handle different date formats from Calendarific API
    let date;
    if (typeof dateString === 'object' && dateString.iso) {
      // Calendarific returns { iso: "2025-01-26" }
      date = new Date(dateString.iso);
    } else if (typeof dateString === 'string') {
      // Direct string format
      date = new Date(dateString);
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Fetch holidays when component mounts or when expanded (if not already loaded)
  useEffect(() => {
    if (nationalHolidays.length === 0) {
      fetchOfficialIndianHolidays();
    }
  }, [isExpanded, nationalHolidays.length, fetchOfficialIndianHolidays]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="relative bg-white rounded-lg shadow border border-gray-200">
      {/* Compact Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md text-xs font-medium"
      >
        <span className="text-sm">🇮🇳</span>
        <span className="text-orange-700">Official Indian Holidays</span>
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-orange-500' : 'bg-orange-300'}`}></div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div ref={popupRef} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 space-y-4 z-10">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">
              {loading ? 'Loading holidays...' : `${availableHolidays.length} holidays available for ${currentYear}`}
            </div>
            <div className="text-xs text-gray-400 mb-3">
              📅 Sorted by date (earliest first)
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Endpoint: <code className="bg-red-100 px-1 rounded">/holidays/official</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Holidays List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            ) : nationalHolidays.length > 0 ? (
              <div className="space-y-3">
                {/* Dropdown for holiday selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Holiday to Add</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    onChange={(e) => {
                      const selectedHoliday = nationalHolidays.find(h => h.name === e.target.value);
                      if (selectedHoliday) {
                        handleAddHoliday(selectedHoliday);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a holiday to add...</option>
                    {availableHolidays.map((holiday, index) => (
                      <option key={`${holiday.name}-${holiday.date}`} value={holiday.name}>
                        {holiday.name} - {formatDate(holiday.date)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Add Buttons for all holidays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add All</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableHolidays.map((holiday) => (
                      <button
                        key={`${holiday.name}-${holiday.date}`}
                        onClick={() => handleAddHoliday(holiday)}
                        className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100 transition-colors duration-200"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-xs font-medium text-gray-900 truncate block">{holiday.name}</span>
                          <span className="text-xs text-gray-600 block">{formatDate(holiday.date)}</span>
                        </div>
                        <Plus className="w-3 h-3 text-orange-600 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : !error ? (
              <div className="text-center py-4 text-gray-500">
                <Flag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm">
                  {availableHolidays.length === 0 && nationalHolidays.length > 0 
                    ? `All ${nationalHolidays.length} holidays are already added!`
                    : `No holidays found`
                  }
                </p>
              </div>
            ) : null}
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <button
              onClick={fetchOfficialIndianHolidays}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalHolidays;
