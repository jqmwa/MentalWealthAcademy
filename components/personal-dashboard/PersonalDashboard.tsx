'use client';

import React from 'react';
import Image from 'next/image';
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import Quests from '@/components/quests/Quests';
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
  const today = new Date().toLocaleDateString();
  const isActiveToday = lastActiveDate === today;

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <div className={styles.greeting}>
            <span className={styles.greetingTime}>
              {new Date().getHours() < 12 ? 'Good morning' : 
               new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </span>
            {username && !username.startsWith('user_') && (
              <h1 className={styles.welcomeName}>{username}</h1>
            )}
          </div>
          {avatarUrl && (
            <div className={styles.avatarWrapper}>
              <Image
                src={avatarUrl}
                alt={username || 'User'}
                width={56}
                height={56}
                className={styles.avatar}
                unoptimized
              />
              {isActiveToday && (
                <div className={styles.activeDot} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daemon Terminal */}
      <div className={styles.daemonTerminalWrapper}>
        <DaemonTerminal />
      </div>

      {/* Quests Component */}
      <Quests />
    </div>
  );
};

export default PersonalDashboard;
