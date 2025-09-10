import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = memo(({ holidays, vacations, onNavigate, currentDate, onViewChange, isLoading = false }) => {
  const [view, setView] = useState('month');
  // Use currentDate from parent, fallback to current date if not provided
  const date = useMemo(() => currentDate || new Date(), [currentDate]);



  // Create stable keys for holidays and vacations to prevent unnecessary re-renders
  const holidaysKey = useMemo(() => {
    if (!holidays || !Array.isArray(holidays)) return '';
    return holidays.map(h => `${h._id || h.name}-${h.date}`).join('|');
  }, [holidays]);

  const vacationsKey = useMemo(() => {
    if (!vacations || !Array.isArray(vacations)) return '';
    return vacations.map(v => `${v._id || v.name}-${v.startDate}-${v.endDate}`).join('|');
  }, [vacations]);

  // Combine holidays and vacations into calendar events - optimized to prevent unnecessary re-renders
  const events = useMemo(() => {
    const calendarEvents = [];
    
    // Add holidays - only process if holidays array actually changed
    if (holidays && Array.isArray(holidays)) {
      holidays.forEach(holiday => {
        if (holiday.date) {
          calendarEvents.push({
            id: `holiday-${holiday._id || holiday.name}-${holiday.date}`,
            title: holiday.name,
            start: new Date(holiday.date),
            end: new Date(holiday.date),
            type: 'holiday',
            allDay: true,
            resource: holiday
          });
        }
      });
    }
    
    // Add vacations - only process if vacations array actually changed
    if (vacations && Array.isArray(vacations)) {
      vacations.forEach(vacation => {
        if (vacation.startDate && vacation.endDate) {
          calendarEvents.push({
            id: `vacation-${vacation._id || vacation.name}-${vacation.startDate}`,
            title: vacation.name,
            start: new Date(vacation.startDate),
            end: new Date(vacation.endDate),
            type: 'vacation',
            allDay: true,
            resource: vacation
          });
        }
      });
    }
    
    return calendarEvents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidaysKey, vacationsKey]); // Use stable keys to prevent unnecessary re-renders

  // Memoized event style getter to prevent recreation on every render
  const eventStyleGetter = useCallback((event) => {
    let style = {
      backgroundColor: '#3B82F6', // Blue for holidays
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    
    if (event.type === 'vacation') {
      style.backgroundColor = '#10B981'; // Green for vacations
    }
    
    return { style };
  }, []);

  // Handle navigation - memoized to prevent recreation
  const handleNavigate = useCallback((newDate, view, action) => {
    if (onNavigate) {
      onNavigate(action, newDate);
    }
  }, [onNavigate]);

  // Handle view change - memoized to prevent recreation
  const handleViewChange = useCallback((newView) => {
    setView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  }, [onViewChange]);



  // Debug logging - only log when view or date changes (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Calendar render:', { view, date, eventsCount: events.length, holidaysKey: holidaysKey.substring(0, 50), vacationsKey: vacationsKey.substring(0, 50) });
    }
  }, [view, date, events.length, holidaysKey, vacationsKey]); // Include stable keys dependency

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 md:p-6" style={{ minHeight: '400px' }}>
      {/* Custom styled wrapper around the calendar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-3 md:p-6 mb-4 md:mb-6 shadow-sm">
        <div className="flex flex-col space-y-4">
          {/* Title and Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                  handleNavigate(newDate, view, 'PREV');
                }}
                className="p-2 md:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm touch-manipulation"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  handleNavigate(today, view, 'TODAY');
                }}
                className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md transform hover:scale-105 text-sm md:text-base touch-manipulation"
                title="Go to Today"
              >
                Today
              </button>
              
              <button
                onClick={() => {
                  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                  handleNavigate(newDate, view, 'NEXT');
                }}
                className="p-2 md:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm touch-manipulation"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
          
          {/* View Selection */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-full sm:w-auto">
            {['month', 'week', 'day'].map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => handleViewChange(viewOption)}
                className={`flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 touch-manipulation ${
                  view === viewOption
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading calendar data...</p>
          </div>
        </div>
      ) : (
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: window.innerWidth < 768 ? 400 : 600 }}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          toolbar={false}
          eventPropGetter={eventStyleGetter}
          selectable
          popup
          defaultView="month"
          views={['month', 'week', 'day']}
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            noEventsInRange: "No events in this range."
          }}
          step={60}
          timeslots={1}
        />
      )}
    </div>
  );
});

export default Calendar;
