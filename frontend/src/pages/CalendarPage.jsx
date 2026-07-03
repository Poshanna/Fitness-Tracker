import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon,
  CheckCircle,
  Clock,
  Flame,
  AlertCircle
} from 'lucide-react';
import api from '../services/api.js';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Fetch all workouts for the current month range
  const fetchMonthWorkouts = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      
      const response = await api.get(`/api/workouts?startDate=${startDate}&endDate=${endDate}`);
      setWorkouts(response.data);
    } catch (err) {
      console.error('Failed to fetch month workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthWorkouts();
    setSelectedDayWorkouts(null);
    setSelectedDay(null);
  }, [currentDate]);

  // Calendar Day Generation Logic
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week first day starts on (0 = Sun, 6 = Sat)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in this month
    
    const days = [];
    
    // Pad previous month's days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Add current month's days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDayWorkouts = (day) => {
    if (!day) return [];
    const dayStr = day.toDateString();
    return workouts.filter(w => new Date(w.date).toDateString() === dayStr);
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    const dayLogs = getDayWorkouts(day);
    setSelectedDay(day);
    setSelectedDayWorkouts(dayLogs);
  };

  const calendarDays = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-55 tracking-tight flex items-center gap-2">
          <CalIcon className="w-8 h-8 text-indigo-500" />
          <span>Training Calendar</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Track and schedule workouts. Inspect completed and pending tasks on the grid.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
          {/* Calendar Controller Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-zinc-100">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 border dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl"
              >
                <ChevronLeft className="w-4.5 h-4.5 text-slate-500 dark:text-zinc-400" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl"
              >
                <ChevronRight className="w-4.5 h-4.5 text-slate-500 dark:text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {/* Weekdays */}
            {weekDays.map(wd => (
              <div key={wd} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1">
                {wd}
              </div>
            ))}

            {/* Days Grid */}
            {loading ? (
              <div className="col-span-7 py-20 text-xs text-slate-405 animate-pulse">Loading logs...</div>
            ) : (
              calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="h-14 sm:h-20" />;

                const dayLogs = getDayWorkouts(day);
                const hasCompleted = dayLogs.some(l => l.completed);
                const hasUncompleted = dayLogs.some(l => !l.completed);
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = selectedDay && day.toDateString() === selectedDay.toDateString();

                // Style indicators
                let indicatorColor = 'bg-transparent';
                if (dayLogs.length > 0) {
                  if (hasCompleted && !hasUncompleted) indicatorColor = 'bg-emerald-500';
                  else if (hasUncompleted) {
                    // If in the past, it's a missed workout (red). Otherwise, it's planned (blue)
                    const past = day < new Date(new Date().setHours(0,0,0,0));
                    indicatorColor = past ? 'bg-red-500' : 'bg-indigo-500';
                  } else {
                    indicatorColor = 'bg-slate-350';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectDay(day)}
                    className={`h-14 sm:h-20 rounded-2xl border flex flex-col items-center justify-between p-2 transition-all relative group
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/5' 
                        : isToday 
                          ? 'border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 font-bold' 
                          : 'border-slate-100 hover:border-slate-200 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800/20'}`}
                  >
                    <span className={`text-xs ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                      {day.getDate()}
                    </span>

                    {/* Completion status dot */}
                    {dayLogs.length > 0 && (
                      <span className={`w-2 h-2 rounded-full ${indicatorColor} animate-pulse`} />
                    )}
                  </button>
                );
              })
            )}
          </div>
          
          {/* Calendar Indicators Legend */}
          <div className="flex gap-4 pt-4 border-t dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 justify-center">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Planned</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Missed</span>
          </div>

        </div>

        {/* Selected Day Workout Details Drawer */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6 self-start">
          <h3 className="text-sm font-extrabold text-slate-850 dark:text-zinc-100">
            {selectedDay ? selectedDay.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}
          </h3>

          {!selectedDay ? (
            <div className="text-center py-10 text-xs text-slate-400 leading-relaxed border border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
              Click any calendar cell containing log markers to load workout details.
            </div>
          ) : selectedDayWorkouts && selectedDayWorkouts.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 leading-relaxed border border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
              No workout logs found on this day.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayWorkouts?.map(w => (
                <div key={w.id} className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-100/50 dark:border-zinc-900/50 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-zinc-100 leading-tight">{w.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase
                      ${w.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                      {w.completed ? 'Completed' : 'Planned'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 uppercase font-semibold">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {w.duration} min</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {w.caloriesBurned} kcal</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t dark:border-zinc-900">
                    {w.exercises?.map((ex, eIdx) => (
                      <div key={eIdx} className="text-[11px] flex justify-between text-slate-650 dark:text-zinc-350">
                        <span>{ex.exerciseName}</span>
                        <span className="font-bold text-slate-500">{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CalendarPage;
