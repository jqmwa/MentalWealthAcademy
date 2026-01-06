'use client';

import React from 'react';
import { RotatingTextSection } from './LandingPage';
import styles from './PatternTextSection.module.css';
import landingStyles from './LandingPage.module.css';

export const PatternTextSection: React.FC = () => {
  return (
    <section className={styles.patternSection}>
      <div className={styles.patternOverlay}></div>
      <div className={landingStyles.rotatingTextContainer}>
        <RotatingTextSection />
      </div>
    </section>
  );
};
