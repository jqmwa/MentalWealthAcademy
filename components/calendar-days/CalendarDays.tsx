'use client';

import { useState } from 'react';
import classes from './CalendarDays.module.css';

interface DayButton {
  day: string;
  date: number;
  isToday?: boolean;
}

export function CalendarDays() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Generate current week
  const days: DayButton[] = [
    { day: 'MON', date: 13 },
    { day: 'TUE', date: 14 },
    { day: 'WED', date: 15, isToday: true },
    { day: 'THU', date: 16 },
    { day: 'FRI', date: 17 },
    { day: 'SAT', date: 18 },
    { day: 'SUN', date: 19 },
  ];

  const handleDayClick = (date: number) => {
    setSelectedDay(date);
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.daysRow}>
        {days.map((day) => (
          <button
            key={day.date}
            className={`${classes.dayButton} ${
              day.isToday ? classes.today : ''
            } ${selectedDay === day.date ? classes.selected : ''}`}
            onClick={() => handleDayClick(day.date)}
          >
            <span className={classes.dayName}>{day.day}</span>
            <span className={classes.dayDate}>{day.date}</span>
            {day.isToday && <div className={classes.todayIndicator} />}
          </button>
        ))}
      </div>
    </div>
  );
}
