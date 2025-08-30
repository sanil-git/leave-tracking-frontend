import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const { user, token, loading, login, register, logout, fetchUserProfile } = useAuth();
  const [officialHolidays, setOfficialHolidays] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const API_BASE_URL = 'http://localhost:5051';

  useEffect(() => {
    if (user && token) {
      fetchUserProfile();
      fetchOfficialHolidays();
      fetchVacations();
      fetchLeaveBalances();
      fetchTeams();
    }
  }, [user, token, fetchUserProfile]);

  const fetchOfficialHolidays = async () => {
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
  };

  const fetchVacations = async () => {
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
  };

  const fetchLeaveBalances = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-balances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveBalances(data);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

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
            {/* Vacation Planner */}
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
                    <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                      Reset
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Default: EL:30, SL:6, CL:3
                  </p>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Long Weekend Opportunities</h4>
                    <div className="space-y-1">
                      {officialHolidays.map((holiday, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {holiday.name} {holiday.date} {holiday.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Planned Vacations */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Planned Vacations
                </h3>
                {vacations.length === 0 ? (
                  <p className="text-gray-500">No planned vacations yet</p>
                ) : (
                  <div className="space-y-2">
                    {vacations.map((vacation, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded border">
                        <div className="font-medium">{vacation.name}</div>
                        <div className="text-sm text-gray-600">
                          {vacation.startDate} - {vacation.endDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar & Holidays */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Calendar & Holidays
                </h3>
                <div className="text-center">
                  <div className="flex items-center justify-between mb-4">
                    <button className="text-gray-500 hover:text-gray-700">
                      ←
                    </button>
                    <h4 className="text-lg font-medium">
                      {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button className="text-gray-500 hover:text-gray-700">
                      →
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-sm">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-gray-500 font-medium">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
                      <div key={day} className="p-2 border rounded hover:bg-gray-50">
                        {day}
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Official Holidays
                  </button>
                </div>
              </div>
            </div>

            {/* Vacations 2025 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Vacations 2025
                </h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Vacation Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Start Date"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>EL</option>
                      <option>SL</option>
                      <option>CL</option>
                    </select>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Add Vacation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
