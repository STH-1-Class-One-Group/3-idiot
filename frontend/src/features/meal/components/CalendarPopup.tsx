import React, { useState, useEffect } from 'react';

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarPopup: React.FC<CalendarPopupProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIdx = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Get previous month days to fill
  const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    onClose();
  };

  const renderDays = () => {
    const days = [];
    
    // Fill prev month days
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      days.push(
        <span key={`prev-${i}`} className="py-1 text-slate-300 dark:text-slate-600 cursor-not-allowed">
          {prevMonthDays - i}
        </span>
      );
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = 
        selectedDate.getFullYear() === currentMonth.getFullYear() &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getDate() === i;

      const isToday = 
        new Date().getFullYear() === currentMonth.getFullYear() &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getDate() === i;

      let wrapperClass = "py-1 cursor-pointer hover:bg-surface-container-high dark:hover:bg-slate-800 rounded-full transition-colors";
      let textClass = "font-medium text-on-surface dark:text-slate-200";

      if (isSelected) {
        wrapperClass = "py-1 bg-primary dark:bg-blue-600 meal-gradient rounded-full shadow-md";
        textClass = "text-white font-bold";
      } else if (isToday) {
        wrapperClass = "py-1 bg-surface-container-high dark:bg-slate-700 rounded-full";
        textClass = "text-primary dark:text-blue-400 font-bold";
      }

      days.push(
        <button 
          key={`current-${i}`} 
          className={wrapperClass}
          onClick={() => handleDayClick(i)}
        >
          <span className={textClass}>{i}</span>
        </button>
      );
    }

    // Fill next month days to complete 42 cells (6 rows)
    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <span key={`next-${i}`} className="py-1 text-slate-300 dark:text-slate-600 cursor-not-allowed">
          {i}
        </span>
      );
    }

    return days;
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-64 bg-surface-container-lowest dark:bg-slate-900 rounded-3xl shadow-2xl p-6 flex flex-col space-y-4 border border-outline-variant/10 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-sm text-on-surface dark:text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <div className="flex space-x-2">
            <span 
              className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors text-on-surface-variant dark:text-slate-400" 
              onClick={handlePrevMonth}
              translate="no"
            >
              chevron_left
            </span>
            <span 
              className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors text-on-surface-variant dark:text-slate-400" 
              onClick={handleNextMonth}
              translate="no"
            >
              chevron_right
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-on-surface-variant dark:text-slate-400">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
          {renderDays()}
        </div>

        <button 
          className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase pt-2 text-center hover:underline"
          onClick={() => {
            onSelectDate(new Date());
            onClose();
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
};
