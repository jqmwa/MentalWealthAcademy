import React from 'react';
import Link from 'next/link';
import styles from './PromptLibraryCard.module.css';

const PromptLibraryCard: React.FC = () => {
  return (
    <div className={styles.promptLibraryCard}>
      <div className={styles.wrapper}>
        <div className={styles.transmissionCard}>
          <div className={styles.transmissionHeader}>
            <span className={styles.messageText}>message</span>
            <span className={styles.transmissionText}>INCOMING</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
      </div>
      <Link href="/forum" className={styles.footer}>
        <span className={styles.footerText}>Explore Forums</span>
      </Link>
    </div>
  );
};

export default PromptLibraryCard;

