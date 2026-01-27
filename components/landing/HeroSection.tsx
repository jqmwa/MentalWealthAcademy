'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './LandingPage.module.css';
import MobileOnboarding from '../mobile-onboarding/MobileOnboarding';

const STORAGE_KEY = 'hasSeenMobileOnboarding_v2';

export const HeroSection: React.FC = () => {
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

  return (
    <>
      <div className={styles.heroSection}>
        <Image
          src="/icons/spacey2klogo.png"
          alt="Logo"
          width={150}
          height={138}
          className={styles.heroLogo}
          priority
        />
        <h1 className={styles.heroHeadline}>THE NEXT GEN<br />MICRO-UNIVERSITY</h1>
        <p className={styles.heroSubtext}>
          12 weeks. Real skills. A community that helps you thrive and find your next horizon with a group of peers. Here when you need it most.
        </p>
        <button
          type="button"
          onClick={handleEnterAcademy}
          className={styles.heroButton}
          disabled={!hasCheckedStorage}
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

export default HeroSection;
