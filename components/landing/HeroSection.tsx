'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './LandingPage.module.css';
import MobileOnboarding from '../mobile-onboarding/MobileOnboarding';

export const HeroSection: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleEnterAcademy = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.replace('/home');
  };

  return (
    <>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeadline}>THE NEXT GEN<br />MICRO-UNIVERSITY</h1>
          <p className={styles.heroSubtext}>
            12 weeks. Real skills. A community that helps you thrive and find your next horizon with a group of peers. Here when you need it most.
          </p>
          <button
            type="button"
            onClick={handleEnterAcademy}
            className={styles.heroButton}
          >
            Enter Academy
          </button>
        </div>

        <div className={styles.heroImages}>
          {/* Top image - Blue background (Chat1 - anime elf) */}
          <div className={`${styles.heroImageBlock} ${styles.heroImageTop}`}>
            <div className={styles.heroImageShape}>
              <Image
                src="/uploads/chat1.png"
                alt="Community member"
                fill
                className={styles.heroImagePhoto}
                priority
              />
            </div>
          </div>

          {/* Left image - Green background (Chat3 - ant character) */}
          <div className={`${styles.heroImageBlock} ${styles.heroImageLeft}`}>
            <div className={styles.heroImageShape}>
              <Image
                src="/uploads/chat3.png"
                alt="Community member"
                fill
                className={styles.heroImagePhoto}
                priority
              />
            </div>
          </div>

          {/* Right image - Orange background (Chat2 - woman) */}
          <div className={`${styles.heroImageBlock} ${styles.heroImageRight}`}>
            <div className={styles.heroImageShape}>
              <Image
                src="/uploads/chat2.png"
                alt="Community member"
                fill
                className={styles.heroImagePhoto}
                priority
              />
            </div>
          </div>

          {/* Decorative arrows connecting images */}
          <svg className={styles.heroArrows} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Arrow from top to right */}
            <path d="M140 30 C180 50, 190 100, 170 140" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M165 130 L170 140 L180 135" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* Arrow from right to left */}
            <path d="M150 160 C120 180, 80 170, 50 140" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M55 150 L50 140 L60 135" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

            {/* Arrow from left to top */}
            <path d="M30 120 C10 80, 40 40, 90 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M80 30 L90 25 L88 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      {showOnboarding && (
        <MobileOnboarding onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default HeroSection;
