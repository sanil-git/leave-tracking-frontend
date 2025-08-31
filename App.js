import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { user, token, loading, logout, fetchUserProfile } = useAuth();
  const [officialHolidays, setOfficialHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
// Remove the showLogin state since it's not being used

  const API_BASE_URL = 'http://localhost:8000';

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
      }
    } catch (error) {
      console.error('Error fetching vacations:', error);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      fetchUserProfile();
      fetchOfficialHolidays();
      fetchVacations();
    }
  }, [user, token, fetchUserProfile, fetchOfficialHolidays, fetchVacations]);

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
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email"
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
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => alert('Registration feature coming soon!')}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h1>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Vacation Planner
                </h3>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                      EL: 30
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                      SL: 6
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                      CL: 3
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Holidays</h4>
                    <div className="space-y-1">
                      {officialHolidays.map((holiday, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {holiday.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Vacations
                </h3>
                {vacations.length === 0 ? (
                  <p className="text-gray-500">No vacations planned</p>
                ) : (
                  <div className="space-y-2">
                    {vacations.map((vacation, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded border">
                        <div className="font-medium">{vacation.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
