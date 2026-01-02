import React from 'react';
import Image from 'next/image';
import styles from './AzuraFaucet.module.css';

const AzuraFaucet: React.FC = () => {
  return (
    <div className={styles.azuraFaucet} data-intro="azurafaucet">
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h2 className={styles.title}>Daily Shards</h2>
          <p className={styles.subtitle}>Get shards for daily check-ins.</p>
        </div>
        <button className={styles.actionButton}>
          <span className={styles.buttonText}>Daily Faucet</span>
          <Image 
            src="/icons/Eye.svg" 
            alt="Eye icon" 
            width={16} 
            height={16} 
            className={styles.powerIcon}
          />
        </button>
      </div>
    </div>
  );
};

export default AzuraFaucet;
