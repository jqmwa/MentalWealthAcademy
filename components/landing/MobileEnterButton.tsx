'use client';

import React from 'react';
import styles from './LandingPage.module.css';

export const MobileEnterButton: React.FC = () => {
  const handleEnterAcademy = () => {
    window.location.replace('/home');
  };

  return (
    <div className={styles.mobileEnterButtonContainer}>
      <button
        type="button"
        onClick={handleEnterAcademy}
        className={styles.mobileEnterButton}
      >
        Enter Academy
      </button>
    </div>
  );
};

export default MobileEnterButton;
