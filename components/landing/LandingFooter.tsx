'use client';

import React from 'react';
import styles from './LandingFooter.module.css';

export const LandingFooter: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Mental Wealth Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
