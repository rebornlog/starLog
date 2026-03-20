'use client';

import { useState, useCallback } from 'react';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

// 内联 SVG 图标
const ChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Calendar = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export function DateSelector({ 
  selectedDate, 
  onDateChange,
  minDate,
  maxDate 
}: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  // 快速切换到今天
  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  // 快速切换到明天
  const goToTomorrow = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onDateChange(tomorrow);
  }, [onDateChange]);

  // 切换到前一天
  const goToPreviousDay = useCallback(() => {
    const previous = new Date(selectedDate);
    previous.setDate(previous.getDate() - 1);
    if (!minDate || previous >= minDate) {
      onDateChange(previous);
    }
  }, [selectedDate, onDateChange, minDate]);

  // 切换到后一天
  const goToNextDay = useCallback(() => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (!maxDate || next <= maxDate) {
      onDateChange(next);
    }
  }, [selectedDate, onDateChange, maxDate]);

  // 判断是否是今天
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 判断是否是明天
  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  // 格式化日期显示
  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) return '今天';
    if (isTomorrow(date)) return '明天';
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 生成日历网格
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();
    
    const days: { date: Date; currentMonth: boolean; day: number }[] = [];
    
    // 添加上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({ date, currentMonth: false, day });
    }
    
    // 添加当月的日期
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      days.push({ date, currentMonth: true, day });
    }
    
    // 添加下个月的日期（补齐 6 行）
    const remaining = 42 - days.length; // 6 行 * 7 天 = 42
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, currentMonth: false, day });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 判断日期是否可选
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar />
          选择日期
        </h3>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="text-white/80 hover:text-white transition-colors text-sm"
        >
          {showCalendar ? '收起' : '日历'}
        </button>
      </div>

      {/* 快捷按钮 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={goToToday}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
            isToday(selectedDate)
              ? 'bg-white text-purple-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          今天
        </button>
        <button
          onClick={goToTomorrow}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
            isTomorrow(selectedDate)
              ? 'bg-white text-purple-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          明天
        </button>
      </div>

      {/* 日期导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousDay}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="前一天"
        >
          <ChevronLeft />
        </button>
        
        <div className="text-center">
          <div className="text-white font-bold text-lg">
            {formatDateDisplay(selectedDate)}
          </div>
          <div className="text-white/60 text-sm">
            {selectedDate.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <button
          onClick={goToNextDay}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="后一天"
        >
          <ChevronRight />
        </button>
      </div>

      {/* 日历视图 */}
      {showCalendar && (
        <div className="animate-fade-in">
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-white/60 text-sm py-1"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, currentMonth, day }, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const disabled = isDateDisabled(date);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => !disabled && onDateChange(date)}
                  disabled={disabled}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${!currentMonth ? 'text-white/30' : 'text-white'}
                    ${isSelected 
                      ? 'bg-white text-purple-900' 
                      : disabled 
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-white/20'
                    }
                    ${isTodayDate && !isSelected ? 'ring-1 ring-white/50' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
