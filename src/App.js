import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useAuth } from './contexts/AuthContext';
import Register from './components/Register';
import Header from './components/Header';
import Home from './pages/Home';
// New modular dashboard components
import Calendar from './components/dashboard/Calendar';
import LeaveForm from './components/dashboard/LeaveForm';
import HolidayManager from './components/dashboard/HolidayManager';
import Insights from './components/dashboard/Insights';
import SkipNavigation from './components/ui/SkipNavigation';
import './App.css';
import './index.css';
import './calendar-tailwind.css'; // Beautiful calendar styling

// Move API_BASE_URL outside component to avoid dependency issues
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://leave-tracking-backend.onrender.com';

function App() {
  const { user, token, loading, login, logout, fetchUserProfile } = useAuth();
  
  // Reset showLogin state when user logs out
  useEffect(() => {
    if (!user && !loading) {
      setShowLogin(null);
    }
  }, [user, loading]);
  const [officialHolidays, setOfficialHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [showLogin, setShowLogin] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [, startHolidayTransition] = useTransition();
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiError, setAiError] = useState({});
  const [aiInsightsFetched, setAiInsightsFetched] = useState(false);
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
        setAiInsightsFetched(false); // Reset flag to fetch AI insights for updated vacations
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

  // AI Insights fetching function
  const fetchAIInsights = useCallback(async () => {
    if (!token) return;
    
    // Filter for future vacations with destinations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureVacations = vacations.filter(vacation => {
      const vacationDate = new Date(vacation.fromDate || vacation.startDate);
      return vacationDate >= today && vacation.destination;
    });
    
    if (futureVacations.length === 0) return;
    
    // Process each future vacation
    for (const vacation of futureVacations) {
      if (!vacation.destination || !vacation.fromDate || !vacation.toDate) continue;
      
      const vacationId = vacation._id || vacation.name;
      
      setAiLoading(prev => ({ ...prev, [vacationId]: true }));
      setAiError(prev => ({ ...prev, [vacationId]: null }));
      
      try {
        // 5 second timeout to prevent getting stuck
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/api/vacation-insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            startDate: vacation.fromDate,
            endDate: vacation.toDate,
            destination: vacation.destination,
            vacationName: vacation.name
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setAiInsights(prev => ({ ...prev, [vacationId]: data }));
        } else {
          setAiError(prev => ({ ...prev, [vacationId]: 'Failed to get AI insights' }));
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setAiError(prev => ({ ...prev, [vacationId]: 'Request timed out (5s)' }));
        } else {
          setAiError(prev => ({ ...prev, [vacationId]: 'AI service unavailable' }));
        }
        console.error('AI insights error:', err);
      } finally {
        setAiLoading(prev => ({ ...prev, [vacationId]: false }));
      }
    }
  }, [token, vacations]);

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

  // Fetch AI insights when vacations change (with debounce)
  useEffect(() => {
    if (vacations.length > 0 && !aiInsightsFetched) {
      const timeoutId = setTimeout(() => {
        fetchAIInsights();
        setAiInsightsFetched(true);
      }, 2000); // 2 second debounce to prevent rapid calls
      
      return () => clearTimeout(timeoutId);
    }
  }, [vacations.length]); // Remove aiInsightsFetched from dependencies


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading PlanWise</h2>
          <p className="text-gray-500">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {showLogin === null ? (
          <Home 
            onSignIn={() => setShowLogin(true)}
            onGetStarted={() => setShowLogin(false)}
            onBackToHome={() => setShowLogin(null)}
            showBackButton={false}
          />
        ) : (
          <>
            <Header 
              onSignIn={() => setShowLogin(true)}
              onGetStarted={() => setShowLogin(false)}
              onBackToHome={() => setShowLogin(null)}
              showBackButton={true}
            />
            
            <main className="min-h-screen">
              <div className="max-w-md mx-auto py-20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {showLogin ? 'Sign In' : 'Get Started'}
                  </h2>
                  <p className="text-gray-600">
                    {showLogin ? 'Welcome back! Please sign in to your account.' : 'Create your account to start tracking your leave.'}
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  {showLogin ? (
                    <>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const email = formData.get('email');
                        const password = formData.get('password');
                        
                        try {
                          await login(email, password);
                          // Login successful, the AuthContext will handle the state update
                        } catch (error) {
                          console.error('Login failed:', error);
                          alert('Login failed. Please check your credentials.');
                        }
                      }} className="space-y-6">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                          </label>
                          <div className="mt-1">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              required
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter your email"
                              aria-describedby="email-help"
                              autoComplete="email"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <div className="mt-1">
                            <input
                              id="password"
                              name="password"
                              type="password"
                              required
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter your password"
                              aria-describedby="password-help"
                              autoComplete="current-password"
                            />
                          </div>
                        </div>
                        <div>
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-label="Sign in to your account"
                          >
                            Sign in
                          </button>
                        </div>
                      </form>
                      <div className="text-center mt-6">
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
                      <div className="text-center mt-6">
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
                
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowLogin(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back to home
                  </button>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    );
  }

  const navigateToDate = (newDate, view, action) => {
    setCalendarDate(newDate);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <SkipNavigation />
      <header id="navigation" className="bg-white shadow-sm border-b border-gray-200" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 md:py-6 space-y-3 sm:space-y-0">
            <h1 className="text-lg md:text-xl font-semibold text-gray-700">
              Welcome back, {user.name}!
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
                aria-label="Sign out of your account"
                tabIndex={0}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Data Loading Progress Bar - Temporarily disabled */}

      <main id="main-content" className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8" role="main">
        <div className="py-4 md:py-6">
          {/* Responsive Layout - Single column on mobile, two columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Left Column - Calendar, Vacation Form & Holiday Management */}
            <section className="space-y-4 md:space-y-6" aria-label="Calendar and leave management">
              {/* Calendar Section */}
              <Calendar
                holidays={officialHolidays}
                vacations={vacations}
                currentDate={calendarDate}
                onNavigate={navigateToDate}
                onViewChange={handleCalendarViewChange}
                isLoading={false}
              />

              {/* Leave Form Section */}
              <LeaveForm
                leaveBalances={leaveBalances}
                existingVacations={vacations}
                holidays={officialHolidays}
                onAddVacation={async (vacationData) => {
                  try {
                    console.log('🚀 FRONTEND: Submitting vacation:', vacationData);
                    console.log('🌐 FRONTEND: API URL:', `${API_BASE_URL}/vacations`);
                    console.log('📤 FRONTEND: Request body:', JSON.stringify(vacationData));
                    
                    const response = await fetch(`${API_BASE_URL}/vacations`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(vacationData)
                    });
                    
                    console.log('📡 FRONTEND: Response status:', response.status, response.statusText);
                    
                    if (response.ok) {
                      const newVacation = await response.json();
                      console.log('Vacation added successfully:', newVacation);
                      
                      // Update leave balance based on vacation type
                      const { leaveType, days } = vacationData;
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
                          setLeaveBalances(prev => ({
                            ...prev,
                            [leaveType]: newBalance
                          }));
                        }
                      } catch (error) {
                        console.error(`Error updating ${leaveType} balance:`, error);
                      }
                      
                      fetchVacations();
                    } else {
                      const errorText = await response.text();
                      console.error('Failed to add vacation:', response.status, errorText);
                    }
                  } catch (error) {
                    console.error('Error adding vacation:', error);
                  }
                }}
              />

              {/* Holiday Management Section */}
              <HolidayManager
                holidays={officialHolidays}
                API_BASE_URL={API_BASE_URL}
                token={token}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                isLoading={false}
              />
            </section>

            {/* Right Column - Insights Dashboard */}
            <section className="space-y-4 md:space-y-6" aria-label="Dashboard insights and analytics">
              <Insights
                holidays={officialHolidays}
                vacations={vacations}
                leaveBalances={leaveBalances}
                onNavigateToDate={navigateToDate}
                isLoading={false}
                aiInsights={aiInsights}
                aiLoading={aiLoading}
                aiError={aiError}
                onDeleteVacation={async (vacationId) => {
                  try {
                    const vacationToDelete = vacations.find(v => v._id === vacationId);
                    if (!vacationToDelete) {
                      throw new Error('Vacation not found');
                    }
                    
                    const response = await fetch(`${API_BASE_URL}/vacations/${vacationId}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    
                    if (response.ok) {
                      // Restore leave balance
                      const { leaveType, days } = vacationToDelete;
                      const currentBalance = leaveBalances[leaveType] || 0;
                      const newBalance = currentBalance + days;
                      
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
                          setLeaveBalances(prev => ({
                            ...prev,
                            [leaveType]: newBalance
                          }));
                        }
                      } catch (error) {
                        console.error(`Error restoring ${leaveType} balance:`, error);
                      }
                      
                      fetchVacations();
                    } else {
                      const errorText = await response.text();
                      throw new Error(`Failed to delete vacation: ${response.status} - ${errorText}`);
                    }
                  } catch (error) {
                    console.error('Error deleting vacation:', error);
                    throw error;
                  }
                }}
                onUpdateLeaveBalances={async (newBalances) => {
                  try {
                    const updatePromises = Object.entries(newBalances).filter(([type, balance]) => {
                      return leaveBalances[type] !== balance;
                    }).map(async ([type, balance]) => {
                      const response = await fetch(`${API_BASE_URL}/leave-balances/${type}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ balance })
                      });
                      
                      if (!response.ok) {
                        throw new Error(`Failed to update ${type} balance`);
                      }
                      
                      return response.json();
                    });
                    
                    await Promise.all(updatePromises);
                    setLeaveBalances(newBalances);
                  } catch (error) {
                    console.error('Error updating leave balances:', error);
                    fetchLeaveBalances();
                  }
                }}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;


