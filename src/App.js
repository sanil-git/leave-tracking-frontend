import React, { useState, useEffect, useCallback } from 'react';
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
    } catch (error) {
      console.error('Error fetching holidays:', error);
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
    } catch (error) {
      console.error('Error fetching vacations:', error);
    }
  }, [token]);
  
  const fetchLeaveBalances = useCallback(async () => {
    try {
      if (!token) {
        console.error('No token available for leave balances request');
        return;
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
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchUserProfile();
      fetchOfficialHolidays();
      fetchVacations();
      fetchLeaveBalances();
    }
  }, [user, token, fetchUserProfile, fetchOfficialHolidays, fetchVacations, fetchLeaveBalances]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Leave Tracking App
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {showLogin ? (
            <>
              <Login />
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setShowLogin(false)}
                    className="font-medium text-indigo-500"
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
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
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
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h1>
            <div className="flex items-center space-x-4">
              {/* Backend Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Backend</span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Calendar & Holiday Management */}
            <div className="space-y-6">
              {/* Calendar Section */}
              <div className="bg-white rounded-lg shadow">
                <Calendar
                  holidays={officialHolidays}
                  vacations={vacations}
                  onNavigate={(action, newDate) => {
                    if (action === 'PREV') {
                      // Handle previous month
                      setCalendarDate(newDate);
                    } else if (action === 'NEXT') {
                      // Handle next month
                      setCalendarDate(newDate);
                    } else if (action === 'TODAY') {
                      // Handle today
                      setCalendarDate(newDate);
                    }
                  }}
                  currentDate={calendarDate}
                  onViewChange={(view) => {
                    // Handle view change
                  }}
                />
              </div>

              {/* Holiday Management Section */}
              <HolidayManagement
                holidays={officialHolidays}
                API_BASE_URL={API_BASE_URL}
                token={token}
                onAddHoliday={async (holidayData) => {
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
                      // Update local state immediately instead of refetching
                      setOfficialHolidays(prev => [...prev, newHoliday]);
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
                }}
                onDeleteHoliday={async (holidayId) => {
                  try {
                    // Optimistic update - remove from UI immediately
                    setOfficialHolidays(prev => {
                      const index = prev.findIndex(holiday => holiday._id === holidayId);
                      if (index === -1) return prev; // Holiday not found
                      
                      // Create new array without the deleted holiday
                      const newHolidays = [...prev];
                      newHolidays.splice(index, 1);
                      return newHolidays;
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
                }}
              />

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
            </div>

            {/* Right Column - Vacation Planner */}
            <div>
              <VacationPlanner
                holidays={officialHolidays}
                vacations={vacations}
                leaveBalances={leaveBalances}
                onNavigateToDate={navigateToDate}
                onUpdateLeaveBalances={async (newBalances) => {
                  try {
                    console.log('Updating leave balances:', newBalances);
                    
                    // Update each leave balance type in the database
                    console.log('Starting database updates for leave balances...');
                    
                    const updatePromises = Object.entries(newBalances).map(async ([type, balance]) => {
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
