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
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Currencies</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* $DAEMON Token */}
          <div className={styles.currencyCard}>
            <div className={styles.currencyHeader}>
              <div className={styles.currencyIcon}>
                <Image
                  src="/icons/Coin Poly.svg"
                  alt="Daemon"
                  width={40}
                  height={40}
                />
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>$DAEMON</h3>
                <p className={styles.currencySubtitle}>Network Gold</p>
              </div>
            </div>
            <p className={styles.currencyDescription}>
              $DAEMON is the foundational currency of Mental Wealth Academy. It serves as network gold, 
              earned through completing quests and participating in the ecosystem. Use $DAEMON to unlock 
              features, participate in governance, and stake for rewards.
            </p>
          </div>

          {/* $ANGELS Token */}
          <div className={styles.currencyCard}>
            <div className={styles.currencyHeader}>
              <div className={styles.currencyIcon}>
                <div className={styles.angelIconPlaceholder}>👼</div>
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>$ANGELS</h3>
                <p className={styles.currencySubtitle}>Limited Celestial Guardians</p>
              </div>
            </div>
            <p className={styles.currencyDescription}>
              $ANGELS are limited celestial guardians—rare tokens that provide special privileges within 
              the Mental Wealth Academy ecosystem. Holding an $ANGEL grants you unique benefits and 
              enhanced rewards when staking $DAEMON.
            </p>
          </div>

          {/* Shards */}
          <div className={styles.currencyCard}>
            <div className={styles.currencyHeader}>
              <div className={styles.currencyIcon}>
                <Image
                  src="/icons/shard.svg"
                  alt="Shards"
                  width={40}
                  height={40}
                  style={{ filter: 'brightness(0)' }}
                />
              </div>
              <div className={styles.currencyInfo}>
                <h3 className={styles.currencyName}>Shards</h3>
                <p className={styles.currencySubtitle}>Purified Rewards</p>
              </div>
            </div>
            <p className={styles.currencyDescription}>
              Shards are harvestable rewards created when you hold an $ANGEL while staking $DAEMON. 
              This process purifies the daemon gold, transforming it into shards that can be collected 
              as rewards. The more $DAEMON you stake with an $ANGEL, the more shards you can harvest.
            </p>
          </div>

          {/* How It Works */}
          <div className={styles.howItWorksSection}>
            <h4 className={styles.howItWorksTitle}>How It Works</h4>
            <ol className={styles.stepsList}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>Acquire $DAEMON by completing quests and participating in the ecosystem</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>Obtain an $ANGEL token (limited celestial guardians)</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}>Hold your $ANGEL while staking your $DAEMON</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <span className={styles.stepText}>Watch as the daemon gold purifies into harvestable shards</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <span className={styles.stepText}>Collect your shards as rewards for your participation</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrenciesModal;
