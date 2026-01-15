'use client';

import { useEffect, useState } from 'react';
import classes from './ProgressCard.module.css';

interface ProgressCardProps {
  title?: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  color?: 'primary' | 'secondary' | 'wellness';
}

export function ProgressCard({
  title = 'Daily Wellness Goal',
  currentValue = 543,
  targetValue = 1000,
  unit = 'minutes',
  color = 'primary'
}: ProgressCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = (currentValue / targetValue) * 100;

  useEffect(() => {
    // Animate the progress bar
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  const formatValue = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className={`${classes.card} ${classes[color]}`}>
      <div className={classes.header}>
        <div className={classes.iconCircle}>
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div className={classes.titleSection}>
          <span className={classes.title}>{title}</span>
          <span className={classes.subtitle}>Keep it up!</span>
        </div>
      </div>

      <div className={classes.stats}>
        <span className={classes.currentValue}>
          {formatValue(currentValue)}
        </span>
        <span className={classes.separator}>/</span>
        <span className={classes.targetValue}>
          {formatValue(targetValue)}
        </span>
        <span className={classes.unit}>{unit}</span>
      </div>

      <div className={classes.progressContainer}>
        <div className={classes.progressTrack}>
          <div 
            className={classes.progressBar}
            style={{ width: `${animatedValue}%` }}
          >
            <div className={classes.progressGlow} />
          </div>
        </div>
        <span className={classes.percentage}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
