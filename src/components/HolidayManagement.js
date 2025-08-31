import React, { useState } from 'react';
import { Plus, Trash2, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import NationalHolidays from './NationalHolidays';

const HolidayManagement = ({ holidays, onAddHoliday, onDeleteHoliday, API_BASE_URL, token }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isHolidaysExpanded, setIsHolidaysExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && date) {
      onAddHoliday({ name: name.trim(), date });
      setName('');
      setDate('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        Holiday Management
      </h3>
      
      {/* Official Indian Holidays Section */}
      <div className="mb-4">
        <NationalHolidays 
          onAddHoliday={onAddHoliday}
          API_BASE_URL={API_BASE_URL}
          token={token}
          existingHolidays={holidays}
        />
      </div>
      
      {/* Add Holiday Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="holidayName" className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Name
            </label>
            <input
              type="text"
              id="holidayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Company Holiday"
              required
            />
          </div>
          
          <div>
            <label htmlFor="holidayDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="holidayDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </button>
          </div>
        </div>
      </form>

      {/* Collapsible Current Holidays Section */}
      <div className="border border-gray-200 rounded-lg">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsHolidaysExpanded(!isHolidaysExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <h4 className="text-md font-medium text-gray-900">Current Holidays</h4>
            <span className="text-sm text-gray-500">({holidays.length} total)</span>
          </div>
          {isHolidaysExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Expandable Content */}
        {isHolidaysExpanded && (
          <div className="border-t border-gray-200 p-4">
            {holidays.length === 0 ? (
              <p className="text-gray-500 text-sm">No holidays added yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {holidays.map((holiday) => (
                  <div
                    key={holiday._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{holiday.name}</h5>
                      <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                    </div>
                    
                    <button
                      onClick={() => onDeleteHoliday(holiday._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete holiday"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayManagement;
