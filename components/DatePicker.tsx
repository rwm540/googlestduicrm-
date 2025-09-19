import React, { useState, useRef, useEffect } from 'react';

declare const jalaali: any;

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  name?: string;
  placeholder?: string;
}

const inputClass = "mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm cursor-pointer";


const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, required, name, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(0);
  const [displayMonth, setDisplayMonth] = useState(0);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  useEffect(() => {
    if (isOpen) {
      if (value) {
        const [y, m] = value.split('/');
        setDisplayYear(parseInt(y, 10));
        setDisplayMonth(parseInt(m, 10));
      } else {
        const today = jalaali.toJalaali(new Date());
        setDisplayYear(today.jy);
        setDisplayMonth(today.jm);
      }
    }
  }, [isOpen, value]);

  const { jy: currentJalaliYear, jm: currentJalaliMonth, jd: currentJalaliDay } = jalaali.toJalaali(new Date());
  const daysInMonth = jalaali.jalaaliMonthLength(displayYear, displayMonth);
  const firstDayGregorian = jalaali.toGregorian(displayYear, displayMonth, 1);
  const firstDay = new Date(firstDayGregorian.gy, firstDayGregorian.gm - 1, firstDayGregorian.gd);
  const dayOfWeek = firstDay.getDay(); 
  const startDayOffset = (dayOfWeek + 1) % 7; 

  const selectedDateParts = value ? value.split('/') : [];
  const isSelectedMonth = 
    selectedDateParts.length === 3 && 
    parseInt(selectedDateParts[0], 10) === displayYear && 
    parseInt(selectedDateParts[1], 10) === displayMonth;
  const currentDay = isSelectedMonth ? parseInt(selectedDateParts[2], 10) : 0;

  const handlePrevMonth = () => {
    let newMonth = displayMonth - 1;
    let newYear = displayYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = displayMonth + 1;
    let newYear = displayYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setDisplayMonth(newMonth);
    setDisplayYear(newYear);
  };

  const handleDateSelect = (day: number) => {
    const date = `${displayYear}/${String(displayMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    onChange(date);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = jalaali.toJalaali(new Date());
    const date = `${today.jy}/${String(today.jm).padStart(2, '0')}/${String(today.jd).padStart(2, '0')}`;
    onChange(date);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toPersianDigits = (n: string | number): string => {
    if(!n) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <input
        name={name}
        placeholder={placeholder}
        value={toPersianDigits(value)}
        onFocus={() => setIsOpen(true)}
        readOnly
        className={inputClass}
        autoComplete="off"
      />
      {/* Hidden input for form validation if needed */}
      <input type="hidden" name={name} value={value} required={required} />

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              type="button" 
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex space-x-2 space-x-reverse">
              <select
                value={displayYear}
                onChange={(e) => setDisplayYear(parseInt(e.target.value, 10))}
                className="border rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                {Array.from({ length: 150 }, (_, i) => 1300 + i).map(year => (
                  <option key={year} value={year}>{toPersianDigits(year)}</option>
                ))}
              </select>
              
              <select
                value={displayMonth}
                onChange={(e) => setDisplayMonth(parseInt(e.target.value, 10))}
                className="border rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"
              >
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>{name}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="button" 
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
              <div key={index} className="w-8 h-8 flex items-center justify-center font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 text-center text-sm">
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
            
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <div key={day} className="py-1 flex items-center justify-center">
                <button
                  type="button"
                  className={`w-8 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    currentDay === day 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-gray-700 hover:bg-cyan-100'
                  }`}
                  onClick={() => handleDateSelect(day)}
                >
                  {toPersianDigits(day)}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4 text-sm border-t pt-2">
            <button
              type="button"
              onClick={handleToday}
              className="text-cyan-600 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
            >
              امروز
            </button>
            <span className="text-gray-400">
              {toPersianDigits(`${currentJalaliYear}/${String(currentJalaliMonth).padStart(2, '0')}/${String(currentJalaliDay).padStart(2, '0')}`)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
