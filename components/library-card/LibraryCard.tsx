import React from 'react';
import styles from './LibraryCard.module.css';

const LibraryCard: React.FC = () => {
  return (
    <div className={styles.libraryCard}>
      <div className={styles.header}>
        <span className={styles.title}>IPFS://Library</span>
        <div className={styles.icons}>
          <img 
            src="/icons/lovebadge.svg" 
            alt="Love badge" 
            className={styles.iconFrame}
          />
          <img 
            src="/icons/badge2.svg" 
            alt="Badge 2" 
            className={styles.iconFrame}
          />
          <img 
            src="/icons/badge3.svg" 
            alt="Badge 3" 
            className={styles.iconFrame}
          />
        </div>
      </div>
      
      <div className={styles.wrapper}>
        <div className={styles.transmissionCard}>
          <div className={styles.transmissionHeader}>
            <span className={styles.messageText}>message</span>
            <span className={styles.transmissionText}>INCOMING Transmission</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <span className={styles.footerText}>let&apos;s check out some books...</span>
        </div>
      </div>
    </div>
  );
};

export default LibraryCard;

