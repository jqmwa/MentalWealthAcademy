'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import Quests from '@/components/quests/Quests';
import YourImpact from '@/components/your-impact/YourImpact';
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
      {/* Hero Section with Bento Grid */}
      <div className={styles.heroContainer}>
        {/* Hero Header */}
        <div className={styles.hero}>
          <header className={`${styles.header} ${isLoaded ? styles.headerLoaded : ''}`}>
            <div className={styles.headerContent}>
              <div className={styles.greeting}>
                <p className={styles.eyebrow}>MWA • Personal Dashboard</p>
                <span className={styles.greetingTime}>{greeting}</span>
                {username && !username.startsWith('user_') && (
                  <h1 className={styles.welcomeName}>{username}</h1>
                )}
              </div>
              {avatarUrl && (
                <div className={styles.avatarWrapper}>
                  <Image
                    src={avatarUrl}
                    alt={username || 'User'}
                    width={64}
                    height={64}
                    className={styles.avatar}
                    unoptimized
                  />
                  {isActiveToday && (
                    <div className={styles.activeDot} />
                  )}
                </div>
              )}
            </div>
          </header>
        </div>

        {/* Bento Grid Layout */}
        <div className={styles.bentoGrid}>
          {/* Left Column - Main Content */}
          <div className={styles.leftColumn}>
            {/* Your Impact Card */}
            <div className={`${styles.bentoCard} ${styles.impactCard}`}>
              <YourImpact />
            </div>
          </div>

          {/* Right Column - Side Content */}
          <div className={styles.rightColumn}>
            {/* Daemon Terminal Card */}
            <div className={`${styles.bentoCard} ${styles.daemonCard}`}>
              <DaemonTerminal />
            </div>

            {/* Stats Card */}
            <div className={`${styles.bentoCard} ${styles.statsCard}`}>
              <div className={styles.statsHeader}>
                <h3 className={styles.statsTitle}>Your Stats</h3>
              </div>
              <div className={styles.statsContent}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Shards</span>
                  <span className={styles.statValue}>{shardCount.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Streak</span>
                  <span className={styles.statValue}>{streak} days</span>
                </div>
                {isActiveToday && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Status</span>
                    <span className={styles.statValueActive}>Active today</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quests Card */}
            <div className={`${styles.bentoCard} ${styles.questsCard}`}>
              <Quests />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
