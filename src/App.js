import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Calendar from './components/Calendar';
import HolidayManagement from './components/HolidayManagement';
import VacationForm from './components/VacationForm';
import VacationPlanner from './components/VacationPlanner';
import './App.css';
// import './calendar-tailwind.css'; // Temporarily disabled to fix CSS conflicts

// Move API_BASE_URL outside component to avoid dependency issues
const API_BASE_URL = 'https://leave-tracking-backend.onrender.com';

function App() {
  const { user, token, loading, logout, fetchUserProfile } = useAuth();
  const [officialHolidays, setOfficialHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [showLogin, setShowLogin] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [, startHolidayTransition] = useTransition();
  // Loading states temporarily disabled to fix infinite loading issue

  // Simple fetch functions - no complex dependencies
  const fetchOfficialHolidays = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOfficialHolidays(data);
      }
      return response.ok; // Always return a value
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return false; // Return false on error
    }
  }, [token]);
  
  const fetchVacations = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vacations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVacations(data);
      } else {
        console.error('Failed to fetch vacations:', response.status, response.statusText);
      }
      return response.ok; // Always return a value
    } catch (error) {
      console.error('Error fetching vacations:', error);
      return false; // Return false on error
    }
  }, [token]);
  
  const fetchLeaveBalances = useCallback(async () => {
    try {
      if (!token) {
        console.error('No token available for leave balances request');
        return false; // Return false when no token
      }
      
      const response = await fetch(`${API_BASE_URL}/leave-balances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle different possible data formats
        let processedData = data;
        if (Array.isArray(data)) {
          // If it's an array, convert to object format
          processedData = data.reduce((acc, item) => {
            acc[item.leaveType] = item.balance;
            return acc;
          }, {});
        } else if (data && typeof data === 'object') {
          // If it's already an object, use as is
          processedData = data;
        } else {
          // No valid data found
          processedData = {};
        }
        
        setLeaveBalances(processedData);
      } else {
        console.error('Failed to fetch leave balances:', response.status, response.statusText);
      }
      return response.ok; // Always return a value
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      return false; // Return false on error
    }
  }, [token]);

  // Memoized holiday operation functions
  const handleAddHoliday = useCallback(async (holidayData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(holidayData)
      });
      if (response.ok) {
        const newHoliday = await response.json();
        // Update local state immediately instead of refetching (low priority)
        startHolidayTransition(() => {
          setOfficialHolidays(prev => [...prev, newHoliday]);
        });
      } else {
        // If add fails, refresh to sync state
        console.error('Failed to add holiday, refreshing list...');
        fetchOfficialHolidays();
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
      // On error, refresh to sync state
      fetchOfficialHolidays();
    }
  }, [token, fetchOfficialHolidays]);

  const handleDeleteHoliday = useCallback(async (holidayId) => {
    try {
      // Optimistic update - remove from UI immediately
      startHolidayTransition(() => {
        setOfficialHolidays(prev => {
          const index = prev.findIndex(holiday => holiday._id === holidayId);
          if (index === -1) return prev; // Holiday not found
          const newHolidays = [...prev];
          newHolidays.splice(index, 1);
          return newHolidays;
        });
      });
      
      // Then make the API call
      const response = await fetch(`${API_BASE_URL}/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Holiday not found in database - refresh the list to sync
          console.warn('Holiday not found in database, refreshing list...');
          fetchOfficialHolidays();
        } else {
          // Other error - revert the optimistic update
          console.error('Failed to delete holiday from server');
          fetchOfficialHolidays(); // Refresh to sync state
        }
      }
      
      return response.ok; // Return success status
    } catch (error) {
      console.error('Error deleting holiday:', error);
      // Revert optimistic update on error by refreshing
      fetchOfficialHolidays();
      throw error; // Re-throw to be caught by the calling component
    }
  }, [token, fetchOfficialHolidays]);

  // Memoized calendar navigation handlers to avoid prop churn causing re-renders
  const handleCalendarNavigate = useCallback((action, newDate) => {
    setCalendarDate(newDate);
  }, []);

  const handleCalendarViewChange = useCallback((view) => {
    // no-op placeholder to keep stable reference if needed later
  }, []);

  // Load all data in parallel - simplified without loading states
  useEffect(() => {
    if (user && token) {
      // Simply run the API calls without loading states
      fetchUserProfile();
      fetchOfficialHolidays();
      fetchVacations();
      fetchLeaveBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Leave Tracking App</h2>
          <p className="text-gray-500">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  <span className="inline-block animate-pulse">L</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.1s'}}>e</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.2s'}}>a</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.3s'}}>v</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.4s'}}>e</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.5s'}}>T</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.6s'}}>r</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.7s'}}>a</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.8s'}}>c</span>
                  <span className="inline-block animate-pulse" style={{animationDelay: '0.9s'}}>k</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowLogin(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Welcome to your
                  <span className="block text-blue-600">leave management</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Track your holidays, plan vacations, and manage leave balances with ease. Never miss an important date again.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowLogin(false)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Tracking Now
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Sign in to your account
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Calendar</h3>
                  <p className="text-sm text-gray-600">Visual planning</p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Vacation Planner</h3>
                  <p className="text-sm text-gray-600">Trip planning</p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Leave Balances</h3>
                  <p className="text-sm text-gray-600">Track remaining days</p>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-2xl">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Leave Dashboard</h3>
                      <p className="text-sm text-gray-600">December 2024</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">📅</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">✓</span>
                        </div>
                        <span className="text-sm font-medium">Annual Leave</span>
                      </div>
                      <span className="text-xs text-green-600">15 days left</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">⏳</span>
                        </div>
                        <span className="text-sm font-medium">Sick Leave</span>
                      </div>
                      <span className="text-xs text-blue-600">5 days left</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm">🎉</span>
                        </div>
                        <span className="text-sm font-medium">Holidays</span>
                      </div>
                      <span className="text-xs text-purple-600">12 days</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>This Month</span>
                      <span>3 days taken</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '20%'}}></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm">⭐</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to manage your leave?</h3>
              <p className="text-lg text-gray-600 mb-8">Join thousands of employees who track their leave efficiently</p>
              <button
                onClick={() => setShowLogin(false)}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Planning Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Login/Register Modal */}
        {showLogin !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showLogin ? 'Sign In' : 'Get Started'}
                </h2>
                <button
                  onClick={() => setShowLogin(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showLogin ? (
                <>
                  <Login />
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setShowLogin(false)}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Create one here
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Register />
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => setShowLogin(true)}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const navigateToDate = (date) => {
    setCalendarDate(date);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 md:py-6 space-y-3 sm:space-y-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h1>
            <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Backend Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Backend</span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 md:px-4 rounded text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Data Loading Progress Bar - Temporarily disabled */}

      <main className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 md:py-6">
          {/* Responsive Layout - Single column on mobile, two columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Left Column - Calendar, Vacation Form & Holiday Management */}
            <div className="space-y-4 md:space-y-6">
              {/* Calendar Section */}
              <div className="bg-white rounded-lg shadow">
                <Calendar
                  holidays={officialHolidays}
                  vacations={vacations}
                  onNavigate={handleCalendarNavigate}
                  currentDate={calendarDate}
                  onViewChange={handleCalendarViewChange}
                  isLoading={false}
                />
              </div>

              {/* Vacation Form Section */}
              <VacationForm
                leaveBalances={leaveBalances}
                onAddVacation={async (vacationData) => {
                  try {
                    console.log('Submitting vacation:', vacationData);
                    console.log('Request URL:', `${API_BASE_URL}/vacations`);
                    console.log('Request headers:', {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    });
                    
                    const response = await fetch(`${API_BASE_URL}/vacations`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(vacationData)
                    });
                    
                    if (response.ok) {
                      const newVacation = await response.json();
                      console.log('Vacation added successfully:', newVacation);
                      
                      // Update leave balance based on vacation type
                      const { leaveType, days } = vacationData;
                      console.log(`Deducting ${days} days from ${leaveType} balance`);
                      
                      // Calculate new balance
                      const newBalance = Math.max(0, leaveBalances[leaveType] - days);
                      
                      // Update leave balance in database
                      try {
                        const balanceResponse = await fetch(`${API_BASE_URL}/leave-balances/${leaveType}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ balance: newBalance })
                        });
                        
                        if (balanceResponse.ok) {
                          // Update local state after successful database update
                          setLeaveBalances(prev => ({
                            ...prev,
                            [leaveType]: newBalance
                          }));
                          console.log(`${leaveType} balance updated in database: ${newBalance}`);
                        } else {
                          console.error(`Failed to update ${leaveType} balance in database`);
                        }
                      } catch (error) {
                        console.error(`Error updating ${leaveType} balance:`, error);
                      }
                      
                      // Refresh vacations
                      fetchVacations();
                    } else {
                      const errorText = await response.text();
                      console.error('Failed to add vacation:', response.status, response.statusText);
                      console.error('Error response body:', errorText);
                    }
                  } catch (error) {
                    console.error('Error adding vacation:', error);
                  }
                }}
              />

              {/* Holiday Management Section */}
              <HolidayManagement
                holidays={officialHolidays}
                API_BASE_URL={API_BASE_URL}
                token={token}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                isLoading={false}
              />
            </div>

            {/* Right Column - Vacation Planner */}
            <div className="space-y-4 md:space-y-6">
              {/* Vacation Planner Section */}
              <VacationPlanner
                holidays={officialHolidays}
                vacations={vacations}
                leaveBalances={leaveBalances}
                onNavigateToDate={navigateToDate}
                isLoading={false}
                onUpdateLeaveBalances={async (newBalances) => {
                  try {
                    console.log('Updating leave balances:', newBalances);
                    
                    // Update each leave balance type in the database
                    console.log('Starting database updates for leave balances...');
                    
                    // Only update changed fields to reduce API calls
                    const updatePromises = Object.entries(newBalances).filter(([type, balance]) => {
                      return leaveBalances[type] !== balance;
                    }).map(async ([type, balance]) => {
                      console.log(`Updating ${type} balance to ${balance}...`);
                      
                      const response = await fetch(`${API_BASE_URL}/leave-balances/${type}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ balance })
                      });
                      
                      console.log(`${type} update response status:`, response.status);
                      
                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`${type} update failed:`, response.status, errorText);
                        throw new Error(`Failed to update ${type} balance: ${response.status} - ${errorText}`);
                      }
                      
                      const result = await response.json();
                      console.log(`${type} update successful:`, result);
                      return result;
                    });
                    
                    console.log('Waiting for all updates to complete...');
                    await Promise.all(updatePromises);
                    
                    // Update local state after successful database update
                    setLeaveBalances(newBalances);
                    console.log('All leave balances updated successfully in database');
                    
                  } catch (error) {
                    console.error('Error updating leave balances:', error);
                    // Revert to previous state if update fails
                    console.log('Reverting to previous state...');
                    fetchLeaveBalances();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
