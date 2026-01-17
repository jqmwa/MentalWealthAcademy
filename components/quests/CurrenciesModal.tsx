'use client';

import React from 'react';
import Image from 'next/image';
import styles from './CurrenciesModal.module.css';

interface CurrenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CurrenciesModal: React.FC<CurrenciesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Currencies</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close" type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.currenciesGrid}>
            {/* Shards */}
            <div className={styles.currencyItem}>
              <div className={styles.currencyIcon}>
                <Image
                  src="/icons/shard.svg"
                  alt="Shards"
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>Shards</h3>
                <p className={styles.currencyDescription}>Purified rewards earned by staking with an Academic Angel. The more you stake, the more you harvest.</p>
              </div>
            </div>

            {/* Coin / $MWG for Governance */}
            <div className={styles.currencyItem}>
              <div className={styles.currencyIcon}>
                <Image
                  src="/icons/Coin Poly.svg"
                  alt="Coin"
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>$MWG</h3>
                <p className={styles.currencyDescription}>Governance token for Mental Wealth Academy. Vote on proposals, shape the future, and participate in the DAO.</p>
              </div>
            </div>

            {/* Angel NFT */}
            <div className={styles.angelSection}>
              <div className={styles.angelImageWrapper}>
                <Image
                  src="/anbel01.png"
                  alt="Academic Angel NFT"
                  width={56}
                  height={56}
                  className={styles.angelImage}
                  unoptimized
                />
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>Academic Angel</h3>
                <p className={styles.currencyDescription}>Limited celestial guardian NFT. Grants special privileges, enhanced rewards, and shard harvesting abilities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrenciesModal;
