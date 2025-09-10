import React, { useState, useRef, useEffect } from 'react';
import { Plane, Calendar, Clock, User, TrendingUp } from 'lucide-react';

const VacationForm = ({ onAddVacation, leaveBalances, existingVacations = [] }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('EL');
  
  // Refs for auto-focusing
  const endDateRef = useRef(null);

  // Auto-focus end date when start date is selected
  useEffect(() => {
    if (startDate && endDateRef.current) {
      // Small delay to ensure the input is ready
      setTimeout(() => {
        endDateRef.current.focus();
      }, 100);
    }
  }, [startDate]);

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Clear end date if it's now before the new start date
    if (endDate && new Date(endDate) < new Date(newStartDate)) {
      setEndDate('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('End date must be after start date');
      return;
    }

    const duration = calculateDuration(startDate, endDate);
    
    // Check if user has enough leave balance
    const currentBalance = leaveBalances?.[leaveType] || 0;
    if (duration > currentBalance) {
      alert(`Insufficient ${leaveType} balance. You have ${currentBalance} days but requesting ${duration} days.`);
      return;
    }

    // Check for duplicate vacations based on overlapping dates
    const isDuplicate = existingVacations.some(vacation => {
      // Check for overlapping date ranges
      const vacationStart = new Date(vacation.startDate || vacation.fromDate);
      const vacationEnd = new Date(vacation.endDate || vacation.toDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      
      // Check if date ranges overlap
      return (newStart <= vacationEnd && newEnd >= vacationStart);
    });

    if (isDuplicate) {
      alert('A vacation with overlapping dates already exists. Please choose a different date range.');
      return;
    }

    onAddVacation({
      name: name.trim(),
      fromDate: startDate,
      toDate: endDate,
      days: duration,
      leaveType: leaveType
    });

    // Reset form
    setName('');
    setStartDate('');
    setEndDate('');
    setLeaveType('EL');
  };

  const duration = calculateDuration(startDate, endDate);
  const currentBalance = leaveBalances?.[leaveType] || 0;
  const remainingBalance = currentBalance - duration;

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Get start date for end date min attribute
  const minEndDate = startDate || today;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Plane className="w-5 h-5 mr-2 text-green-600" />
        Request Vacation
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="vacationName" className="block text-sm font-medium text-gray-700 mb-1">
              Vacation Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="vacationName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="e.g., Summer Vacation"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
              >
                <option value="EL">Earned Leave (EL) - {leaveBalances?.EL || 0} days available</option>
                <option value="CL">Casual Leave (CL) - {leaveBalances?.CL || 0} days available</option>
                <option value="SL">Sick Leave (SL) - {leaveBalances?.SL || 0} days available</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">
              Submit
            </label>
            <button
              type="submit"
              disabled={duration > currentBalance}
              className={`w-full px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium ${
                duration > currentBalance
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                min={today}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                ref={endDateRef}
                min={minEndDate}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                required
                disabled={!startDate}
              />
            </div>
          </div>
        </div>

        {duration > 0 && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm">
            <div className="flex items-center text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <span><strong>{duration} day{duration !== 1 ? 's' : ''}</strong></span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              remainingBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {remainingBalance >= 0 ? `${remainingBalance} remaining` : 'Insufficient balance'}
            </div>
          </div>
        )}
        
      </form>
    </div>
  );
};

export default VacationForm;
