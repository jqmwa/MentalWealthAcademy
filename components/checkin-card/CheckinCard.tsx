'use client';

import { useState } from 'react';
import classes from './CheckinCard.module.css';

export function CheckinCard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCheckin = () => {
    if (isCheckedIn) return;
    
    setIsAnimating(true);
    setIsCheckedIn(true);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <button 
      className={`${classes.card} ${isCheckedIn ? classes.checked : ''} ${isAnimating ? classes.animating : ''}`}
      onClick={handleCheckin}
      disabled={isCheckedIn}
    >
      <div className={classes.leftSection}>
        <div className={classes.iconCircle}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={classes.icon}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" className={classes.checkmark} />
          </svg>
        </div>
        <span className={classes.text}>
          {isCheckedIn ? 'Checked In!' : 'Check In'}
        </span>
      </div>
      
      <div className={classes.rightIcon}>
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 2v20M2 12h20" />
        </svg>
      </div>
    </button>
  );
}
