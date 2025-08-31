import React, { useState, useMemo, useEffect } from 'react';
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

const Calendar = ({ holidays, vacations, onNavigate, currentDate, onViewChange }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(currentDate || new Date());

  // Update internal date when currentDate prop changes
  useEffect(() => {
    if (currentDate && currentDate.getTime() !== date.getTime()) {
      setDate(currentDate);
    }
  }, [currentDate, date]);

  // Combine holidays and vacations into calendar events
  const events = useMemo(() => {
    const calendarEvents = [];
    
    // Add holidays
    if (holidays && Array.isArray(holidays)) {
      holidays.forEach(holiday => {
        if (holiday.date) {
          calendarEvents.push({
            id: `holiday-${holiday._id || Math.random()}`,
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
    
    // Add vacations
    if (vacations && Array.isArray(vacations)) {
      vacations.forEach(vacation => {
        if (vacation.startDate && vacation.endDate) {
          calendarEvents.push({
            id: `vacation-${vacation._id || Math.random()}`,
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
  }, [holidays, vacations]);

  const eventStyleGetter = (event) => {
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
  };

  // Handle navigation
  const handleNavigate = (newDate, view, action) => {
    console.log('Navigation called:', action, newDate, view);
    console.log('Current date before:', date);
    setDate(newDate);
    console.log('New date set to:', newDate);
    if (onNavigate) {
      onNavigate(action, newDate);
    }
  };

  // Handle view change
  const handleViewChange = (newView) => {
    console.log('View change called:', newView);
    console.log('Current view before:', view);
    setView(newView);
    console.log('New view set to:', newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };



  // Debug logging
  console.log('Calendar render:', { view, date, eventsCount: events.length });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" style={{ minHeight: '700px' }}>
      {/* Custom styled wrapper around the calendar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          {/* Left side - Title and Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                  setDate(newDate);
                  handleNavigate(newDate, view, 'PREV');
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  setDate(today);
                  handleNavigate(today, view, 'TODAY');
                }}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                title="Go to Today"
              >
                Today
              </button>
              
              <button
                onClick={() => {
                  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                  setDate(newDate);
                  handleNavigate(newDate, view, 'NEXT');
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Right side - View Selection */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {['month', 'week', 'day'].map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => handleViewChange(viewOption)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
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
      
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        date={date}
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
    </div>
  );
};

export default Calendar;
