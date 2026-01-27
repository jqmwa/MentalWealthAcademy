'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './LandingHeader.module.css';

export const LandingHeader: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);

  const handleLogin = () => {
    window.location.href = '/home';
  };

  const handleJoinNow = () => {
    window.location.href = '/home';
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <a href="/" className={styles.logoLink}>
          <Image
            src="/icons/mwa-logo-horizontal.png"
            alt="Mental Wealth Academy"
            width={160}
            height={58}
            className={styles.logo}
            priority
          />
        </a>

        <nav className={styles.nav}>
          <button
            type="button"
            onClick={handleLogin}
            className={styles.loginButton}
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleJoinNow}
            className={styles.joinButton}
          >
            Join Now
          </button>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;
