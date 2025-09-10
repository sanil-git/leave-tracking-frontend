import React, { useState, useMemo } from 'react';
import { TrendingUp, Bell, CheckCircle, Calendar, Clock, Star, Users, Edit3, Plane, MapPin, Trash2 } from 'lucide-react';

/**
 * DashboardPreview component - Shows beautiful leave balance cards and smart insights
 * @param {Object} props - Component props
 * @param {Object} props.leaveBalances - Object with EL, SL, CL balances
 * @param {Array} props.holidays - Array of holiday objects
 * @param {Array} props.vacations - Array of vacation objects
 * @param {Function} props.onNavigateToDate - Function to navigate to specific date
 * @param {Function} props.onUpdateLeaveBalances - Function to update leave balances
 * @param {boolean} props.isLoading - Loading state
 */
const DashboardPreview = ({ 
  leaveBalances = { EL: 12, SL: 8, CL: 3 },
  holidays = [],
  vacations = [],
  onNavigateToDate,
  onUpdateLeaveBalances,
  onDeleteVacation,
  isLoading = false,
  children // This will be the Calendar component
}) => {
  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [editingBalances, setEditingBalances] = useState(leaveBalances);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBalances = async () => {
    if (!onUpdateLeaveBalances || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateLeaveBalances(editingBalances);
      setIsEditingBalances(false);
    } catch (error) {
      console.error('Error saving leave balances:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    setEditingBalances(leaveBalances);
    setIsEditingBalances(true);
  };

  // Find long weekend opportunities (holidays on Monday/Friday) - only future dates
  const longWeekendOpportunities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const filtered = holidays.filter(holiday => {
      const date = new Date(holiday.date);
      const dayOfWeek = date.getDay();
      // Only show Monday (1) or Friday (5) holidays that are in the future
      return (dayOfWeek === 1 || dayOfWeek === 5) && date >= today;
    });
    
    // Remove duplicates based on name and date
    const uniqueHolidays = [];
    const seen = new Set();
    
    filtered.forEach(holiday => {
      const key = `${holiday.name}-${holiday.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueHolidays.push(holiday);
      }
    });
    
    return uniqueHolidays;
  }, [holidays]);

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleDateClick = (dateString) => {
    if (onNavigateToDate) {
      onNavigateToDate(new Date(dateString));
    }
  };

  const handleDeleteVacation = async (vacationId) => {
    if (onDeleteVacation && window.confirm('Are you sure you want to delete this vacation?')) {
      try {
        await onDeleteVacation(vacationId);
      } catch (error) {
        console.error('Error deleting vacation:', error);
        alert('Failed to delete vacation. Please try again.');
      }
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PlanWise Dashboard</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Leave Balances & Smart Insights */}
        <div className="space-y-6">
          {/* Leave Balances Panel */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-semibold text-gray-800">Leave Balances</h4>
              </div>
              <button
                onClick={isEditingBalances ? handleSaveBalances : handleEditClick}
                disabled={isSaving}
                className={`flex items-center text-sm px-3 py-1 rounded-lg transition-colors duration-200 ${
                  isSaving
                    ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {isEditingBalances ? (isSaving ? 'Saving…' : 'Save') : 'Edit'}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Earned Leave Card */}
              <div className="bg-purple-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">Earned Leave</div>
                  {isEditingBalances ? (
                    <input
                      type="number"
                      value={editingBalances.EL || ''}
                      onChange={(e) => setEditingBalances(prev => ({ ...prev, EL: parseInt(e.target.value) || 0 }))}
                      className="w-full text-2xl font-bold text-purple-700 text-center bg-transparent border-none outline-none"
                      min="0"
                      step="1"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-purple-700">{leaveBalances.EL}</div>
                  )}
                </div>
              </div>

              {/* Sick Leave Card */}
              <div className="bg-green-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">Sick Leave</div>
                  {isEditingBalances ? (
                    <input
                      type="number"
                      value={editingBalances.SL || ''}
                      onChange={(e) => setEditingBalances(prev => ({ ...prev, SL: parseInt(e.target.value) || 0 }))}
                      className="w-full text-2xl font-bold text-green-700 text-center bg-transparent border-none outline-none"
                      min="0"
                      step="1"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-green-700">{leaveBalances.SL}</div>
                  )}
                </div>
              </div>

              {/* Casual Leave Card */}
              <div className="bg-blue-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">Casual Leave</div>
                  {isEditingBalances ? (
                    <input
                      type="number"
                      value={editingBalances.CL || ''}
                      onChange={(e) => setEditingBalances(prev => ({ ...prev, CL: parseInt(e.target.value) || 0 }))}
                      className="w-full text-2xl font-bold text-blue-700 text-center bg-transparent border-none outline-none"
                      min="0"
                      step="1"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-blue-700">{leaveBalances.CL}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Long Weekend Opportunities */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-orange-600 mr-2" />
              <h4 className="font-semibold text-gray-800">Long Weekend Opportunities</h4>
            </div>
            
            {longWeekendOpportunities.length === 0 ? (
              <p className="text-gray-500 text-sm">No long weekend opportunities found.</p>
            ) : (
              <div className="space-y-3">
                {longWeekendOpportunities.map((holiday) => (
                  <div
                    key={holiday._id}
                    className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-orange-900">{holiday.name}</h4>
                        <p className="text-sm text-orange-700">
                          <span 
                            onClick={() => handleDateClick(holiday.date)}
                            className="cursor-pointer hover:text-orange-800 hover:underline transition-colors duration-200"
                            title="Click to navigate to this date on calendar"
                          >
                            {getDayName(holiday.date)} • {formatDate(holiday.date)}
                          </span>
                        </p>
                      </div>
                      <div className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                        {getDayName(holiday.date).substring(0, 3)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Planned Vacations */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Plane className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-gray-800">Planned Vacations</h4>
            </div>
            
            {vacations.length === 0 ? (
              <p className="text-gray-500 text-sm">No vacations planned yet.</p>
            ) : (
              <div className="space-y-3">
                {vacations.map((vacation) => (
                  <div
                    key={vacation._id}
                    className="group p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900">{vacation.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-green-700">
                          <Clock className="w-3 h-3 mr-1" />
                          {vacation.days || vacation.duration || 'N/A'} days
                        </div>
                        {vacation.leaveType && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            vacation.leaveType === 'EL' ? 'bg-blue-100 text-blue-800' :
                            vacation.leaveType === 'SL' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vacation.leaveType}
                          </span>
                        )}
                        {/* Delete button - only visible on hover */}
                        {onDeleteVacation && (
                          <button
                            onClick={() => handleDeleteVacation(vacation._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md"
                            title="Delete vacation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-green-700">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span 
                        onClick={() => handleDateClick(vacation.fromDate || vacation.startDate)}
                        className="cursor-pointer hover:text-green-800 hover:underline transition-colors duration-200"
                        title="Click to navigate to start date"
                      >
                        {formatDate(vacation.fromDate || vacation.startDate)}
                      </span>
                      <span className="mx-2">-</span>
                      <span 
                        onClick={() => handleDateClick(vacation.toDate || vacation.endDate)}
                        className="cursor-pointer hover:text-green-800 hover:underline transition-colors duration-200"
                        title="Click to navigate to end date"
                      >
                        {formatDate(vacation.toDate || vacation.endDate)}
                      </span>
                    </div>
                    
                    {vacation.description && (
                      <p className="text-sm text-green-600 mt-2 italic">
                        "{vacation.description}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Insights Panel */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-gray-800">Smart Insights</h4>
            </div>
            
            <div className="space-y-4">
              {/* Long Weekend Alert */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-semibold text-green-900">Long Weekend Detected!</span>
                  </div>
                  <p className="text-sm text-green-700">Mar 15-18 (4 days off)</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>

              {/* Optimal Booking */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-semibold text-blue-900">Optimal Booking</span>
                  </div>
                  <p className="text-sm text-blue-700">Book flights 2 weeks early</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              {/* Team Sync */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm font-semibold text-purple-900">Team Sync</span>
                  </div>
                  <p className="text-sm text-purple-700">3 colleagues also planning leave</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
