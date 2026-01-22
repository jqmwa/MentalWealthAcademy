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
            {/* Angel NFT - Membership */}
            <div className={styles.angelSection}>
              <div className={styles.angelImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.imgur.com/GXA3DBV.gif"
                  alt="Academic Angel NFT"
                  className={styles.angelImage}
                />
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>Academic Angel</h3>
                <p className={styles.currencyDescription}>Your subscription is made out of art. Limited celestial guardian NFTs grant you access to the full 12-weeks of rewards and prizes.</p>
              </div>
            </div>

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
                <p className={styles.currencyDescription}>Fragments of the underworking Daemon. Shards can be used to unlock prizes at the end of the 12-weeks.</p>
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
                <p className={styles.currencyDescription}>Decision-making token for Mental Wealth Academy funds. You shape the future of the brand.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrenciesModal;
