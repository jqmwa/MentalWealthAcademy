'use client';

import { useState, useEffect, useMemo } from 'react';
import classes from './CalendarDays.module.css';

interface DayButton {
  day: string;
  date: number;
  month: number;
  year: number;
  isToday?: boolean;
}

export function CalendarDays() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Update current date every minute and check for day changes
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(now);
    };

    // Update immediately
    updateDate();

    // Update every minute to keep calendar current
    const interval = setInterval(updateDate, 60000); // 60000ms = 1 minute

    // Also check if we've crossed midnight
    const now = new Date();
    const msUntilMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    ).getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      updateDate();
      // Set up recurring interval after midnight
      const dailyInterval = setInterval(updateDate, 86400000); // 24 hours
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, []);

  // Generate current week dynamically
  const days: DayButton[] = useMemo(() => {
    const today = currentDate;
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday of current week (or Sunday if we want week to start on Sunday)
    // We'll start the week on Monday (ISO week)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Monday start
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const weekDays: DayButton[] = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      
      const isToday = 
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();
      
      weekDays.push({
        day: dayNames[dayDate.getDay()],
        date: dayDate.getDate(),
        month: dayDate.getMonth(),
        year: dayDate.getFullYear(),
        isToday,
      });
    }
    
    return weekDays;
  }, [currentDate]);

  const handleDayClick = (date: number, month: number, year: number) => {
    // Create a unique identifier for the selected day
    const selectedDate = new Date(year, month, date);
    setSelectedDay(selectedDate.getTime());
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.daysRow}>
        {days.map((day) => {
          const dayKey = `${day.year}-${day.month}-${day.date}`;
          const selectedDate = selectedDay ? new Date(selectedDay) : null;
          const isSelected = selectedDate && 
            selectedDate.getDate() === day.date &&
            selectedDate.getMonth() === day.month &&
            selectedDate.getFullYear() === day.year;
          
          return (
            <button
              key={dayKey}
              className={`${classes.dayButton} ${
                day.isToday ? classes.today : ''
              } ${isSelected ? classes.selected : ''}`}
              onClick={() => handleDayClick(day.date, day.month, day.year)}
            >
              <span className={classes.dayName}>{day.day}</span>
              <span className={classes.dayDate}>{day.date}</span>
              {day.isToday && <div className={classes.todayIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
