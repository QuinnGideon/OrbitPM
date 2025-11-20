import React, { useState } from 'react';
import { JobApplication, StageStatus } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Clock } from './Icons';

interface CalendarViewProps {
  jobs: JobApplication[];
  onJobClick: (job: JobApplication) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ jobs, onJobClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Collect all stages with dates
  const events = jobs.flatMap(job => 
    job.stages
      .filter(stage => stage.date)
      .map(stage => ({
        date: stage.date!.split('T')[0], // Ensure YYYY-MM-DD
        stageName: stage.name,
        jobTitle: job.title,
        company: job.company,
        status: stage.status,
        jobId: job.id,
        job: job
      }))
  );

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    
    return events.filter(e => e.date === dateKey);
  };

  const renderCalendarDays = () => {
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = 
        day === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div key={day} className={`min-h-[120px] border border-gray-100 dark:border-gray-700 p-2 relative group transition-colors ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'}`}>
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {day} {isToday && <span className="ml-1 text-xs font-normal">(Today)</span>}
          </div>
          
          <div className="space-y-1.5 overflow-y-auto max-h-[80px] scrollbar-hide">
            {dayEvents.map((evt, idx) => (
              <div 
                key={idx}
                onClick={() => onJobClick(evt.job)}
                className={`text-xs p-1.5 rounded border cursor-pointer truncate transition-transform hover:scale-[1.02] ${
                  evt.status === StageStatus.COMPLETED || evt.status === StageStatus.PASSED 
                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                    : evt.status === StageStatus.SCHEDULED 
                    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
                title={`${evt.stageName} - ${evt.company}`}
              >
                <div className="font-semibold truncate">{evt.company}</div>
                <div className="truncate opacity-80">{evt.stageName}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-primary-500" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-300">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-300">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <button 
          onClick={resetToToday}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 bg-gray-200 dark:bg-gray-700 gap-px border-b border-gray-200 dark:border-gray-700">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarView;