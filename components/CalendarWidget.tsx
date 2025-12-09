
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus } from 'lucide-react';

const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-zinc-50/50 dark:bg-black/20 border-r border-b border-zinc-200 dark:border-white/5"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
      
      // Adjusted dummy data to ONLY show trades
      const hasTrade = [2, 5, 8, 12, 15, 19, 22, 24, 26, 29].includes(d);
      const isWin = [2, 8, 15, 19, 24, 29].includes(d);
      const isLoss = [5, 12, 22, 26].includes(d);
      
      const pnl = isWin 
        ? `+$${(Math.random() * 500 + 200).toFixed(0)}` 
        : isLoss 
            ? `-$${(Math.random() * 300 + 100).toFixed(0)}` 
            : '';

      days.push(
        <div key={d} className={`h-32 border-r border-b border-zinc-200 dark:border-white/5 p-3 relative group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40 ${isToday ? 'bg-zinc-50 dark:bg-zinc-900/60' : ''}`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'bg-zinc-900 dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center rounded-full' : 'text-zinc-500'}`}>
              {d}
            </span>
            {hasTrade && (
               <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isWin ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                 {pnl}
               </span>
            )}
          </div>
          
          {hasTrade && (
            <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-zinc-900 dark:bg-white' : 'bg-rose-500'}`}></div>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">
                        {isWin ? 'Long ES' : 'Short NQ'}
                    </span>
                </div>
            </div>
          )}

          <button className="absolute bottom-2 right-2 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={14} />
          </button>
        </div>
      );
    }

    return days;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-900">
        <div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-white font-geist">Trading Calendar</h2>
            <p className="text-xs text-zinc-500">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium w-24 text-center">{monthNames[currentDate.getMonth()]}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><ChevronRight size={16} /></button>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"><MoreHorizontal size={16} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 bg-zinc-100 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-white/5">
        {daysOfWeek.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {day}
            </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 bg-white dark:bg-black/40">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarWidget;
