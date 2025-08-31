import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Flag, RefreshCw, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const NationalHolidays = ({ onAddHoliday, API_BASE_URL, token }) => {
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isExpanded, setIsExpanded] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  const fetchOfficialIndianHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using your backend API for official Indian holidays
      const response = await fetch(
        `${API_BASE_URL}/holidays/official?year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const holidays = await response.json();
        setNationalHolidays(holidays);
      } else {
        setError(`API Error: ${response.status} - ${response.statusText}`);
        setNationalHolidays([]);
      }
    } catch (error) {
      setError(`Network Error: ${error.message}`);
      setNationalHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = (holiday) => {
    const holidayData = {
      name: holiday.name,
      date: holiday.date,
      type: 'national',
      country: 'IN'
    };
    
    onAddHoliday(holidayData);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (isExpanded) {
      fetchOfficialIndianHolidays();
    }
  }, [selectedYear, API_BASE_URL, token, isExpanded]);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Compact Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flag className="w-4 h-4 text-orange-600" />
          </div>
          <span className="font-medium text-gray-900">Official Indian Holidays</span>
          <span className="text-sm text-gray-500">({nationalHolidays.length} available)</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
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
                    {nationalHolidays.map((holiday, index) => (
                      <option key={index} value={holiday.name}>
                        {holiday.name} - {formatDate(holiday.date)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Add Buttons for all holidays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add All</label>
                  <div className="grid grid-cols-2 gap-2">
                    {nationalHolidays.map((holiday, index) => (
                      <button
                        key={index}
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
                <p className="text-sm">No holidays found for {selectedYear}</p>
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
