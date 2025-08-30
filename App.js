import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  // Authentication
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState('login'); // 'login', 'register', or null
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [indianHolidays, setIndianHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });
  const [vacations, setVacations] = useState([]);
  const [newVacation, setNewVacation] = useState({ name: '', fromDate: '', toDate: '', leaveType: 'EL' });
  const [leaveBalance, setLeaveBalance] = useState({ EL: 30, SL: 6, CL: 3 });
  const [showLeaveEditModal, setShowLeaveEditModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState({ type: '', value: 0 });
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showHolidaysDropdown, setShowHolidaysDropdown] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [officialHolidays, setOfficialHolidays] = useState([]);
  const [loadingOfficial, setLoadingOfficial] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5051';

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data from backend
  useEffect(() => {
    // Fetch holidays
    axios.get(`${API_BASE_URL}/holidays`).then(res => {
      setIndianHolidays(res.data);
    }).catch(err => {
      console.error('Error fetching holidays:', err);
    });

    // Fetch leave balances
    axios.get(`${API_BASE_URL}/leave-balances`).then(res => {
      const balances = {};
      res.data.forEach(b => {
        balances[b.leaveType] = b.balance;
      });
      setLeaveBalance(balances);
      setBackendStatus('connected');
    }).catch(err => {
      console.error('Error fetching leave balances:', err);
      setBackendStatus('disconnected');
    });

    // Fetch vacations
    axios.get(`${API_BASE_URL}/vacations`).then(res => {
      const vacationsWithDays = res.data.map(v => ({
        ...v,
        days: v.days || Math.ceil((new Date(v.toDate) - new Date(v.fromDate)) / (1000 * 60 * 60 * 24) + 1),
        leaveType: v.leaveType || 'EL'
      }));
      setVacations(vacationsWithDays);
    }).catch(err => {
      console.error('Error fetching vacations:', err);
      setVacations([]);
    });
  }, [API_BASE_URL]);

  // Calendar navigation
  const handlePrev = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNext = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  // Add vacation
  const handleAddVacation = e => {
    e.preventDefault();
    if (!newVacation.name || !newVacation.fromDate || !newVacation.toDate) {
      alert('Please fill in all fields');
      return;
    }
    
    const fromDate = new Date(newVacation.fromDate);
    const toDate = new Date(newVacation.toDate);
    const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    
    if (leaveBalance[newVacation.leaveType] < daysDiff) {
      alert(`Not enough ${newVacation.leaveType} leave balance.`);
      return;
    }
    
    const vacationToAdd = {
      name: newVacation.name,
      fromDate: newVacation.fromDate,
      toDate: newVacation.toDate,
      leaveType: newVacation.leaveType,
      days: daysDiff
    };
    
    axios.post(`${API_BASE_URL}/vacations`, vacationToAdd)
      .then(res => {
        setVacations([...vacations, res.data]);
        const newBalance = leaveBalance[newVacation.leaveType] - daysDiff;
        axios.put(`${API_BASE_URL}/leave-balances/${newVacation.leaveType}`, {
          balance: newBalance
        }).then(() => {
          setLeaveBalance(prev => ({
            ...prev,
            [newVacation.leaveType]: newBalance
          }));
        });
        setNewVacation({ name: '', fromDate: '', toDate: '', leaveType: 'EL' });
      })
      .catch(err => {
        console.error('Error adding vacation:', err);
        alert('Failed to add vacation. Make sure backend is running.');
      });
  };

  // Remove vacation
  const handleRemoveVacation = id => {
    const vacation = vacations.find(v => v._id === id);
    axios.delete(`${API_BASE_URL}/vacations/${id}`)
      .then(() => {
        setVacations(vacations.filter(v => v._id !== id));
        if (vacation) {
          const newBalance = leaveBalance[vacation.leaveType] + vacation.days;
          axios.put(`${API_BASE_URL}/leave-balances/${vacation.leaveType}`, {
            balance: newBalance
          }).then(() => {
            setLeaveBalance(prev => ({
              ...prev,
              [vacation.leaveType]: newBalance
            }));
          });
        }
      });
  };

  // Add holiday
  const handleAddHoliday = e => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return;
    
    axios.post(`${API_BASE_URL}/holidays`, newHoliday)
      .then(res => {
        setIndianHolidays([...indianHolidays, res.data]);
        setNewHoliday({ name: '', date: '' });
      })
      .catch(err => {
        console.error('Error adding holiday:', err);
        alert('Failed to add holiday. Please try again.');
      });
  };

  // Fetch official holidays and show in modal
  const handleFetchOfficialHolidays = () => {
    setShowOfficialModal(true);
    setLoadingOfficial(true);
    
    // Try to fetch from API first
    axios.get(`${API_BASE_URL}/holidays/official`)
      .then(res => {
        const holidays = (res.data && Array.isArray(res.data.holidays)) ? res.data.holidays : [];
        console.log('Official holidays fetched:', holidays);
        
        if (holidays.length > 0) {
          setOfficialHolidays(holidays);
        } else {
          // Use sample data if API returns empty
          setOfficialHolidays(getSampleHolidays());
        }
        setLoadingOfficial(false);
      })
      .catch(err => {
        console.error('Error fetching official holidays:', err);
        // Use sample data if API fails
        setOfficialHolidays(getSampleHolidays());
        setLoadingOfficial(false);
      });
  };

  // Get sample holidays
  const getSampleHolidays = () => {
    return [
      { name: 'Republic Day', date: { iso: '2025-01-26' } },
      { name: 'Holi', date: { iso: '2025-03-14' } },
      { name: 'Good Friday', date: { iso: '2025-04-18' } },
      { name: 'Independence Day', date: { iso: '2025-08-15' } },
      { name: 'Janmashtami', date: { iso: '2025-08-16' } },
      { name: 'Gandhi Jayanti', date: { iso: '2025-10-02' } },
      { name: 'Diwali/Deepavali', date: { iso: '2025-10-20' } },
      { name: 'Guru Nanak Jayanti', date: { iso: '2025-11-05' } },
      { name: 'Christmas', date: { iso: '2025-12-25' } }
    ];
  };

  // Add official holiday
  const handleAddOfficialHoliday = (holiday) => {
    // Check if holiday already exists
    if (indianHolidays.some(h => h.name === holiday.name && h.date === holiday.date.iso)) {
      alert('Holiday already exists!');
      return;
    }

    axios.post(`${API_BASE_URL}/holidays`, { name: holiday.name, date: holiday.date.iso })
      .then(res => {
        setIndianHolidays(prev => [...prev, res.data]);
        alert(`${holiday.name} added successfully!`);
      })
      .catch(err => {
        console.error('Error adding official holiday:', err);
        alert('Failed to add holiday. Please try again.');
      });
  };

  // Handle reset leave balances
  const handleResetBalances = () => {
    console.log('🔄 RESET CONFIRMED!');
    const defaultBalances = { EL: 30, SL: 6, CL: 3 };
    setLeaveBalance(defaultBalances);
    
    // Update backend
    Object.entries(defaultBalances).forEach(([type, balance]) => {
      axios.put(`${API_BASE_URL}/leave-balances/${type}`, { balance })
        .then(() => console.log(`${type} balance reset to ${balance}`))
        .catch(err => console.error(`Error resetting ${type}:`, err));
    });
    
    setShowResetModal(false);
  };

  // Remove holiday
  const handleRemoveHoliday = id => {
    axios.delete(`${API_BASE_URL}/holidays/${id}`)
      .then(() => setIndianHolidays(indianHolidays.filter(h => h._id !== id)));
  };

  // Leave balance functions
  const handleEditLeave = (type) => {
    setEditingLeave({ type, value: leaveBalance[type] });
    setShowLeaveEditModal(true);
  };

  const handleSaveLeave = () => {
    if (editingLeave.value === '' || editingLeave.value < 0) {
      alert('Please enter a valid number');
      return;
    }
    
    axios.put(`${API_BASE_URL}/leave-balances/${editingLeave.type}`, {
      balance: editingLeave.value
    }).then(() => {
      setLeaveBalance(prev => ({
        ...prev,
        [editingLeave.type]: editingLeave.value
      }));
      setShowLeaveEditModal(false);
      setEditingLeave({ type: '', value: 0 });
    });
  };

  // Format month year for calendar header
  const formatMonthYear = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const day = {
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        dayNumber: current.getDate(),
        dayOfWeek: current.getDay() // 0 = Sunday, 6 = Saturday
      };
      
      // Check for holidays
      const holiday = indianHolidays.find(h => {
        const holidayDate = new Date(h.date);
        return holidayDate.toDateString() === current.toDateString();
      });
      
      if (holiday) {
        day.holiday = holiday;
      }
      
      // Check for vacations
      const vacation = vacations.find(v => {
        const fromDate = new Date(v.fromDate);
        const toDate = new Date(v.toDate);
        // Reset time to midnight for proper date comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        const currentDate = new Date(current);
        currentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        return currentDate >= fromDate && currentDate <= toDate;
      });
      
      if (vacation) {
        day.vacation = vacation;
      }
      
      days.push(day);
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
      padding: '16px',
      fontFamily: 'Inter, sans-serif',
      color: isDarkMode ? '#f9fafb' : '#1f2937'
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '16px'
    },
    darkModeBtn: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      color: isDarkMode ? '#f9fafb' : '#4b5563',
      backgroundColor: isDarkMode ? '#4b5563' : '#ffffff',
      border: isDarkMode ? '1px solid #6b7280' : '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '6px 12px',
      cursor: 'pointer',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '32px'
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    },
    card: {
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      border: isDarkMode ? '1px solid #4b5563' : 'none'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      marginBottom: '24px'
    },
    calendarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    calendarNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    navButton: {
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '20px',
      color: '#6b7280'
    },
    monthLabel: {
      fontWeight: '500',
      color: isDarkMode ? '#f9fafb' : '#374151',
      minWidth: '150px',
      textAlign: 'center'
    },
    officialBtn: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#2563eb',
      backgroundColor: '#eff6ff',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '2px'
    },
    dayHeader: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px',
      padding: '8px'
    },
    calendarDay: {
      padding: '6px',
      height: '70px',
      borderRadius: '8px',
      position: 'relative',
      fontSize: '14px'
    },
    vacationForm: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      gap: '16px',
      alignItems: 'end',
      marginBottom: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: isDarkMode ? '#d1d5db' : '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#1f2937'
    },
    button: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 24px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      gap: '8px'
    },
    vacationCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    vacationInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    vacationName: {
      fontWeight: '600',
      color: '#1f2937'
    },
    vacationDates: {
      fontSize: '14px',
      color: '#6b7280'
    },
    vacationActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    badge: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      fontSize: '12px',
      fontWeight: '700',
      padding: '4px 10px',
      borderRadius: '20px'
    },
    deleteBtn: {
      padding: '8px',
      borderRadius: '20px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '20px'
    },
    sidebar: {
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      border: isDarkMode ? '1px solid #4b5563' : 'none'
    },
    sidebarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px'
    },
    leaveBalances: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px'
    },
    leaveBadge: {
      backgroundColor: '#e5e7eb',
      color: '#374151',
      fontWeight: '500',
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: '500',
      padding: '6px 12px',
      borderRadius: '20px',
      gap: '8px'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%'
    },
    sectionTitle: {
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px',
      fontSize: '16px'
    },
    longWeekendCard: {
      backgroundColor: '#eff6ff',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #bfdbfe',
      marginBottom: '12px'
    },
    plannedVacationCard: {
      backgroundColor: '#f0fdf4',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #bbf7d0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '400px',
      width: '90%',
      margin: '16px',
      border: isDarkMode ? '1px solid #4b5563' : 'none'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    modalButton: {
      flex: 1,
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  // Show authentication UI if user is not logged in
  if (!user) {
    if (showAuth === 'login') {
      return <Login onSwitchToRegister={() => setShowAuth('register')} />;
    } else {
      return <Register onSwitchToLogin={() => setShowAuth('login')} />;
    }
  }

  return (
    <div style={styles.container}>
      {/* Header with Dark Mode Toggle and User Info */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={styles.darkModeBtn}
          >
            <span style={{ fontSize: '16px' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </span>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          {/* User Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: isDarkMode ? '#e5e7eb' : '#374151'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Welcome, {user.name}!
            </span>
            <button
              onClick={logout}
              style={{
                ...styles.darkModeBtn,
                backgroundColor: isDarkMode ? '#dc2626' : '#ef4444',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={styles.mainGrid}>
        {/* Left Column - Calendar & Vacations */}
        <div style={styles.leftColumn}>
          {/* Calendar Section */}
          <div style={styles.card}>
            <div style={styles.calendarHeader}>
              <h2 style={styles.cardTitle}>Calendar & Holidays</h2>
              <div style={styles.calendarNav}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={handlePrev} style={styles.navButton}>
                    ◀
                </button>
                  <span style={styles.monthLabel}>
                    {formatMonthYear(currentDate)}
                  </span>
                  <button onClick={handleNext} style={styles.navButton}>
                    ▶
                </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
              <button
                    onClick={() => {
                      console.log('📅 TODAY BUTTON CLICKED!');
                      const today = new Date();
                      console.log('Setting current date to:', today);
                      setCurrentDate(today);
                    }}
                style={{
                      ...styles.officialBtn,
                      backgroundColor: isDarkMode ? '#059669' : '#10b981',
                      fontSize: '12px',
                      padding: '6px 12px'
                    }}
                  >
                    📅 Today
                  </button>
                  <button 
                    onClick={handleFetchOfficialHolidays}
                    style={styles.officialBtn}
                  >
                    🏁 Official Holidays
              </button>
            </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={styles.dayHeader}>{day}</div>
              ))}
              {calendarDays.map((day, index) => {
                const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6; // Sunday = 0, Saturday = 6
                const hasHoliday = day.holiday;
                
                return (
                  <div 
                    key={index} 
                  style={{
                      ...styles.calendarDay,
                      color: !day.isCurrentMonth ? '#9ca3af' : 
                        isWeekend ? (isDarkMode ? '#d1d5db' : '#4b5563') : 
                        isDarkMode ? '#f9fafb' : '#1f2937',
                      backgroundColor: day.isToday ? (isDarkMode ? '#fbbf24' : '#fef3c7') : 
                        isWeekend ? (isDarkMode ? '#1f2937' : '#f8fafc') : 
                        isDarkMode ? '#374151' : 'transparent',
                      fontWeight: day.isToday ? '700' : isWeekend ? '600' : '500',
                      border: day.isToday ? '2px solid #f59e0b' : 
                        isWeekend ? (isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0') : 
                        isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
                    }}
                  >
                    {day.dayNumber}
                    
                                        {/* Vacation Events */}
                    {day.vacation && (
                      <div 
                  style={{
                          position: 'absolute',
                          bottom: hasHoliday ? '32px' : '8px',
                          left: '4px',
                          right: '4px',
                          backgroundColor: isDarkMode ? '#dc2626' : '#fee2e2',
                          color: isDarkMode ? '#fef2f2' : '#dc2626',
                          fontSize: '9px',
                          fontWeight: '500',
                          padding: '2px 4px',
                          borderRadius: '4px',
                    textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.05s ease'
                        }}
                        title={`${day.vacation.name} (${day.vacation.days} days total)`}
                  onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? '#b91c1c' : '#fecaca';
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.zIndex = '10';
                  }}
                  onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? '#dc2626' : '#fee2e2';
                          e.target.style.transform = 'scale(1)';
                          e.target.style.zIndex = '1';
                        }}
                        onClick={(e) => {
                      e.preventDefault();
                          e.stopPropagation();
                          console.log('🏖️ VACATION CLICKED!', day.vacation);
                          alert(`Clicked vacation: ${day.vacation.name}`);
                          
                          // Simple navigation test
                          const today = new Date();
                          setCurrentDate(new Date(today.getFullYear(), today.getMonth() + 1, 1));
                        }}
                      >
                        🏖️ {day.vacation.name.length > 8 ? day.vacation.name.substring(0, 8) + '...' : day.vacation.name}
                </div>
                    )}
                
                    {/* Holiday Events */}
                    {day.holiday && (
                <div
                  style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '4px',
                          right: '4px',
                          backgroundColor: isDarkMode ? '#059669' : '#d1fae5',
                          color: isDarkMode ? '#d1fae5' : '#059669',
                          fontSize: '9px',
                          fontWeight: '500',
                          padding: '2px 4px',
                          borderRadius: '4px',
                    textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.05s ease'
                        }}
                        title={`${day.holiday.name} (Official Holiday)`}
                  onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? '#047857' : '#a7f3d0';
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.zIndex = '10';
                  }}
                  onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? '#059669' : '#d1fae5';
                          e.target.style.transform = 'scale(1)';
                          e.target.style.zIndex = '1';
                        }}
                        onClick={(e) => {
                      e.preventDefault();
                          e.stopPropagation();
                          console.log('🎉 HOLIDAY CLICKED!', day.holiday);
                          alert(`Clicked holiday: ${day.holiday.name}`);
                          
                          // Simple navigation test
                          const today = new Date();
                          setCurrentDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
                        }}
                      >
                        🎉 {day.holiday.name.length > 8 ? day.holiday.name.substring(0, 8) + '...' : day.holiday.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>

          {/* Vacations Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Vacations 2025</h2>
            
            {/* Vacation Form */}
            <form onSubmit={handleAddVacation} style={styles.vacationForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vacation Name</label>
                  <input
                  type="text"
                  placeholder="e.g. Summer Break"
                  value={newVacation.name}
                  onChange={e => setNewVacation({ ...newVacation, name: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={newVacation.fromDate}
                    onChange={e => setNewVacation({ ...newVacation, fromDate: e.target.value })}
                  style={styles.input}
                  />
                </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    value={newVacation.toDate}
                    onChange={e => setNewVacation({ ...newVacation, toDate: e.target.value })}
                  style={styles.input}
                  />
                </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select
                  value={newVacation.leaveType}
                  onChange={e => setNewVacation({ ...newVacation, leaveType: e.target.value })}
                  style={styles.input}
                >
                  <option value="EL">EL</option>
                  <option value="SL">SL</option>
                  <option value="CL">CL</option>
                </select>
              </div>
              </form>

            {/* Vacation List */}
            <div style={{ marginBottom: '16px' }}>
                {vacations.map(v => (
                <div key={v._id} style={styles.vacationCard}>
                  <div style={styles.vacationInfo}>
                    <span style={styles.vacationName}>{v.name}</span>
                    <span style={styles.vacationDates}>{v.fromDate} - {v.toDate}</span>
                    </div>
                  <div style={styles.vacationActions}>
                    <span style={styles.badge}>
                      {v.leaveType}: {v.days} days
                    </span>
                    <button 
                      onClick={() => handleRemoveVacation(v._id)}
                      style={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                  </div>
                ))}
              </div>

            {/* Add Vacation Button */}
            <button onClick={handleAddVacation} style={styles.button}>
              ➕ Add Vacation
                </button>
            </div>

          {/* Holidays Section */}
          <div style={styles.card}>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: showHolidaysDropdown ? '24px' : '0'
              }}
              onClick={() => setShowHolidaysDropdown(!showHolidaysDropdown)}
            >
              <h2 style={styles.cardTitle}>Show Holidays ({indianHolidays.length})</h2>
              <button style={{
                ...styles.navButton,
                transform: showHolidaysDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ⬇️
              </button>
            </div>
            
            {showHolidaysDropdown && (
              <div>
                {/* Add Holiday Form */}
                <form onSubmit={handleAddHoliday} style={styles.vacationForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Holiday Name</label>
                <input
                  type="text"
                      placeholder="e.g. New Year"
                  value={newHoliday.name}
                  onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={newHoliday.date}
                    onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      style={styles.input}
                  />
                </div>
                  <div style={styles.formGroup}>
                    <button
                      type="submit"
                      style={{
                        ...styles.button,
                        backgroundColor: '#16a34a',
                        padding: '8px 16px'
                      }}
                    >
                      ➕ Add Holiday
                </button>
                  </div>
              </form>

                {/* Holiday List */}
                <div style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                    {indianHolidays.map(h => (
                    <div key={h._id} style={{
                      ...styles.vacationCard,
                      backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff',
                      border: isDarkMode ? '1px solid #3b82f6' : '1px solid #bfdbfe'
                    }}>
                      <div style={styles.vacationInfo}>
                          <span style={{ 
                          ...styles.vacationName,
                          color: isDarkMode ? '#dbeafe' : '#1e40af'
                          }}>{h.name}</span>
                          <span style={{ 
                          ...styles.vacationDates,
                          color: isDarkMode ? '#93c5fd' : '#2563eb'
                          }}>{h.date}</span>
                        </div>
                      <button 
                        onClick={() => handleRemoveHoliday(h._id)}
                        style={styles.deleteBtn}
                      >
                        🗑️
                        </button>
                      </div>
                    ))}
                  {indianHolidays.length === 0 && (
                    <p style={{
                      textAlign: 'center',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      fontStyle: 'italic',
                      margin: '20px 0'
                    }}>
                      No holidays added yet. Click "Official Holidays" to add some!
                    </p>
                  )}
                        </div>
                      </div>
              )}
            </div>
                  </div>

        {/* Right Column - Vacation Planner */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div>
              <h2 style={styles.cardTitle}>Vacation Planner</h2>
              <div style={styles.leaveBalances}>
                <button
                  onClick={() => handleEditLeave('EL')}
                  style={styles.leaveBadge}
                >
                  EL: {leaveBalance.EL}
                </button>
                <button
                  onClick={() => handleEditLeave('SL')}
                  style={styles.leaveBadge}
                >
                  SL: {leaveBalance.SL}
                </button>
                <button
                  onClick={() => handleEditLeave('CL')}
                  style={styles.leaveBadge}
                >
                  CL: {leaveBalance.CL}
                </button>
                <button
                  style={{
                    ...styles.leaveBadge, 
                    color: '#2563eb',
                    cursor: 'pointer',
                    transition: 'all 0.05s ease'
                  }}
                  onClick={() => {
                    console.log('🔄 RESET BUTTON CLICKED!');
                    setShowResetModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dbeafe';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Reset
                </button>
                                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  Default: EL:30, SL:6, CL:3
              </div>
              </div>
            </div>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: backendStatus === 'connected' ? '#dcfce7' : '#fee2e2',
              color: backendStatus === 'connected' ? '#16a34a' : '#dc2626'
            }}>
              <span style={{
                ...styles.statusDot,
                backgroundColor: backendStatus === 'connected' ? '#16a34a' : '#dc2626'
              }}></span>
              {backendStatus === 'connected' ? 'Backend Connected' : 'Backend Disconnected'}
            </span>
            </div>
            
            {/* Long Weekend Opportunities */}
          <div>
            <h3 style={styles.sectionTitle}>Long Weekend Opportunities</h3>
            <div>
                {indianHolidays
                  .filter(h => {
                    const date = new Date(h.date);
                  const day = date.getDay();
                  return day === 1 || day === 5; // Monday or Friday
                  })
                  .map(h => (
                  <div 
                    key={h._id} 
                    style={{
                      ...styles.longWeekendCard,
                      cursor: 'pointer',
                      transition: 'all 0.05s ease'
                    }}
                    onClick={() => {
                      console.log('🎯 LONG WEEKEND CLICKED!', h);
                      const holidayDate = new Date(h.date);
                      setCurrentDate(new Date(holidayDate.getFullYear(), holidayDate.getMonth(), 1));
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dbeafe';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#eff6ff';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <p style={{ fontWeight: '600', color: '#1e40af', margin: '0 0 4px 0' }}>{h.name}</p>
                    <p style={{ fontSize: '14px', color: '#2563eb', margin: 0 }}>
                      {h.date} <span style={{ fontWeight: '600' }}>
                          {new Date(h.date).getDay() === 1 ? 'Mon' : 'Fri'}
                        </span>
                    </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Planned Vacations */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={styles.sectionTitle}>Planned Vacations</h3>
            <div>
                {vacations.map(v => (
                <div 
                  key={v._id} 
                  style={{
                    ...styles.plannedVacationCard,
                    cursor: 'pointer',
                    transition: 'all 0.05s ease'
                  }}
                  onClick={() => {
                    console.log('🏖️ PLANNED VACATION CLICKED!', v);
                    const vacationStartDate = new Date(v.fromDate);
                    setCurrentDate(new Date(vacationStartDate.getFullYear(), vacationStartDate.getMonth(), 1));
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dcfce7';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f0fdf4';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600', color: '#166534', margin: '0 0 4px 0' }}>{v.name}</p>
                    <p style={{ fontSize: '14px', color: '#16a34a', margin: 0 }}>{v.fromDate} - {v.toDate}</p>
                  </div>
                      <span style={{ 
                    backgroundColor: '#bbf7d0',
                    color: '#166534',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '20px'
                  }}>
                    {v.days} days
                      </span>
                  </div>
                ))}
                {vacations.length === 0 && (
                <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No planned vacations yet</p>
                )}
              </div>
            </div>
        </div>
        </div>

        {/* Leave Balance Edit Modal */}
        {showLeaveEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: isDarkMode ? '#f9fafb' : '#1f2937', 
              marginBottom: '16px' 
            }}>
              Edit Leave Balance
            </h2>
            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>
                  {editingLeave.type} (Leave Days)
                </label>
                <input
                  type="number"
                  min="0"
                value={editingLeave.value === 0 ? '' : editingLeave.value}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditingLeave({ 
                    ...editingLeave, 
                    value: value === '' ? '' : parseInt(value) || 0 
                  });
                }}
                style={styles.input}
                placeholder="Enter number of days"
                />
              </div>
            <div style={styles.modalActions}>
                <button
                  onClick={() => setShowLeaveEditModal(false)}
                  style={{
                  ...styles.modalButton,
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLeave}
                  style={{
                  ...styles.modalButton,
                  backgroundColor: '#2563eb',
                  color: '#ffffff'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Official Holidays Modal */}
      {showOfficialModal && (
        <div style={styles.modal}>
          <div style={{
            ...styles.modalContent,
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: isDarkMode ? '#f9fafb' : '#1f2937', 
              marginBottom: '16px' 
            }}>
              Official Indian Holidays 2025
            </h2>
            
            {loadingOfficial ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Loading holidays...</p>
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'grid', 
                  gap: '8px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {officialHolidays.filter(h => 
                    !indianHolidays.some(existing => 
                      existing.name === h.name && existing.date === h.date.iso
                    )
                  ).map((holiday, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                      borderRadius: '8px',
                      border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
                    }}>
                      <div>
                        <p style={{ 
                          fontWeight: '600', 
                          color: isDarkMode ? '#f9fafb' : '#1f2937',
                          margin: '0 0 4px 0' 
                        }}>
                          {holiday.name}
                        </p>
                        <p style={{ 
                          fontSize: '14px', 
                          color: isDarkMode ? '#9ca3af' : '#6b7280',
                          margin: 0 
                        }}>
                          {holiday.date.iso}
                        </p>
                      </div>
                <button
                        onClick={() => handleAddOfficialHoliday(holiday)}
                  style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                        Add
                </button>
                    </div>
                  ))}
                  
                  {officialHolidays.filter(h => 
                    !indianHolidays.some(existing => 
                      existing.name === h.name && existing.date === h.date.iso
                    )
                  ).length === 0 && !loadingOfficial && (
                    <p style={{ 
                      textAlign: 'center', 
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      padding: '20px 0',
                      fontStyle: 'italic'
                    }}>
                      All official holidays have been added!
                    </p>
                  )}
                </div>
              </div>
            )}
            
                <button
              onClick={() => setShowOfficialModal(false)}
                  style={{
                width: '100%',
                backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                color: isDarkMode ? '#f9fafb' : '#1f2937',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
              Close
                </button>
            </div>
          </div>
        )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div style={styles.modal}>
          <div style={{
            ...styles.modalContent,
            maxWidth: '400px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: isDarkMode ? '#f9fafb' : '#1f2937', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ Reset Leave Balances
            </h2>
            
            <p style={{ 
              color: isDarkMode ? '#d1d5db' : '#4b5563', 
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              This will reset all your leave balances to the default values:
            </p>

            <div style={{
              backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
              border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontWeight: '600',
                  color: isDarkMode ? '#f9fafb' : '#1f2937'
                }}>
                  Current Values:
                </span>
                <span style={{ 
                  color: isDarkMode ? '#d1d5db' : '#6b7280'
                }}>
                  EL: {leaveBalance.EL}, SL: {leaveBalance.SL}, CL: {leaveBalance.CL}
                </span>
            </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontWeight: '600',
                  color: isDarkMode ? '#f9fafb' : '#1f2937'
                }}>
                  Default Values:
                </span>
                <span style={{ 
                  color: '#059669',
                  fontWeight: '600'
                }}>
                  EL: 30, SL: 6, CL: 3
                </span>
          </div>
      </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowResetModal(false)}
                style={{
                  backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                  color: isDarkMode ? '#f9fafb' : '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetBalances}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🔄 Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 