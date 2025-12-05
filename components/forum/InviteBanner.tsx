import React from 'react';
import styles from './InviteBanner.module.css';

export function InviteBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.title}>Invite Friends, Earn Rewards</span>
        <span className={styles.subtitle}>
          Up To 2,000 $DAEMON when users join
        </span>
        <span className={styles.highlight}>
          through your referral link!
        </span>
      </div>
    </div>
  );
}

