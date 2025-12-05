import React from 'react';
import Image from 'next/image';
import styles from './BannerCard.module.css';

const BannerCard: React.FC = () => {
  return (
    <div className={styles.bannerCard}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.textSection}>
            <h2 className={styles.title}>Rubi AI: Recommend Me Learning Paths!</h2>
            <p className={styles.subtitle}>Reach your learning goals by finding hand-picked Digital Classes.</p>
          </div>
          <button className={styles.actionButton}>
            <span className={styles.buttonText}>Entry Exams</span>
            <Image 
              src="/icons/Eye.svg" 
              alt="Eye icon" 
              width={14.31} 
              height={14.31} 
              className={styles.powerIcon}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;

