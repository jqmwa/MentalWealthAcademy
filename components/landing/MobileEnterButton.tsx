'use client';

import React, { useState, useEffect } from 'react';
import styles from './LandingPage.module.css';
import MobileOnboarding from '../mobile-onboarding/MobileOnboarding';

const STORAGE_KEY = 'hasSeenMobileOnboarding';

export const MobileEnterButton: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY) === 'true';
    setShouldShowOnboarding(!hasSeenOnboarding);
    setHasCheckedStorage(true);
  }, []);

  const handleEnterAcademy = () => {
    if (shouldShowOnboarding) {
      setShowOnboarding(true);
    } else {
      window.location.replace('/home');
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.replace('/home');
  };

  // Don't render onboarding until we've checked storage
  if (!hasCheckedStorage) {
    return (
      <div className={styles.mobileEnterButtonContainer}>
        <button
          type="button"
          className={styles.mobileEnterButton}
          disabled
        >
          Enter Academy
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.mobileEnterButtonContainer}>
        <button
          type="button"
          onClick={handleEnterAcademy}
          className={styles.mobileEnterButton}
        >
          Enter Academy
        </button>
      </div>

      {showOnboarding && (
        <MobileOnboarding onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default MobileEnterButton;
