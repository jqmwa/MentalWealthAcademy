'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import styles from './PersonalDashboard.module.css';

interface PersonalDashboardProps {
  username?: string | null;
  avatarUrl?: string | null;
  shardCount?: number;
  streak?: number;
  lastActiveDate?: string | null;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  username,
  avatarUrl,
  shardCount = 0,
  streak = 0,
  lastActiveDate,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const today = new Date().toLocaleDateString();
  const isActiveToday = lastActiveDate === today;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const greeting = 
    new Date().getHours() < 12 ? 'Good morning' : 
    new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.dashboard}>
      {/* Hero Section */}
      <div className={styles.heroContainer}>
        <div className={styles.hero}>
          <header className={`${styles.header} ${isLoaded ? styles.headerLoaded : ''}`}>
            <p className={styles.eyebrow}>MWA • Personal Dashboard</p>
            <h1 className={styles.title}>
              {greeting}
              {username && !username.startsWith('user_') && (
                <span className={styles.username}> {username}</span>
              )}
            </h1>
            <p className={styles.subtitle}>
              Track your progress, complete quests, and shape the future of mental health research.
            </p>
          </header>
        </div>

        {/* Bento Grid Layout */}
        <div className={styles.bentoGridContainer}>
          <div className={styles.bentoGrid}>
          {/* Left Column - Main Content */}
          <div className={styles.leftColumn}>
          </div>

          {/* Right Column - Side Content */}
          <div className={styles.rightColumn}>
          </div>
        </div>
        
        {/* Full Width Cards */}
        {/* Daemon Terminal Card */}
        <div className={`${styles.bentoCard} ${styles.daemonCard} ${styles.fullWidthCard}`}>
          <DaemonTerminal />
        </div>

        {/* Proposals Card */}
        <div className={`${styles.bentoCard} ${styles.statsCard} ${styles.fullWidthCard}`}>
          {/* Proposals Moving Toward Funding */}
          <div className={styles.proposalsContainer}>
            <div className={styles.proposalsHeader}>
              <span className={styles.proposalsTitle}>Proposals Moving Toward Funding</span>
            </div>
            <div className={styles.proposalsList}>
              <div className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>Mental Health Access Initiative</span>
                  <span className={styles.proposalStatus}>Moving toward funding</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
              <div className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>Community Support Program</span>
                  <span className={styles.proposalStatus}>In review</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
              <div className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>Prevention Framework</span>
                  <span className={styles.proposalStatus}>Gathering input</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
