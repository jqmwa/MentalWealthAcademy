import React from 'react';
import styles from './FarcasterFriends.module.css';

const ProfileIcon: React.FC = () => {
  return (
    <div className={styles.profileIcon}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" fill="currentColor" />
      </svg>
    </div>
  );
};

const FarcasterFriends: React.FC = () => {
  // Create 6 profile icons for 2x3 grid
  const profileIcons = Array.from({ length: 6 }, (_, i) => i);

  const stats = [
    { label: 'Classrooms Available', value: '13' },
    { label: 'Blockchain Actions', value: '542' },
    { label: 'Votes Declares', value: '3542' },
    { label: 'Certificates Earned', value: '34' },
    { label: 'Shards Distributed', value: '324k' },
  ];

  return (
    <>
      <div className={styles.container} data-intro="farcaster-friends">
        <div className={styles.header}>
          <h2 className={styles.title}>Top Connects</h2>
          <p className={styles.description}>Top contributors from Farcaster platform.</p>
        </div>
        
        <div className={styles.iconsGrid}>
          {profileIcons.map((_, index) => (
            <ProfileIcon key={index} />
          ))}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.footer}>
          <button className={styles.seeAllButton}>See More</button>
        </div>
      </div>

      <div className={styles.statsContainer}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FarcasterFriends;

