'use client';

import React from 'react';
import Image from 'next/image';
import styles from './SoulGemDisplay.module.css';

interface SoulGemDisplayProps {
  amount: string;
  label?: string;
  showLabel?: boolean;
}

/**
 * Soul Gem Icon SVG
 */
const SoulGemIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2L3 8L12 14L21 8L12 2Z" 
      fill="url(#gem-gradient-1)" 
      stroke="rgba(139, 92, 246, 0.8)" 
      strokeWidth="1"
    />
    <path 
      d="M3 8L12 22L21 8" 
      fill="url(#gem-gradient-2)" 
      stroke="rgba(99, 102, 241, 0.6)" 
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="gem-gradient-1" x1="12" y1="2" x2="12" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(139, 92, 246, 0.9)" />
        <stop offset="1" stopColor="rgba(99, 102, 241, 0.9)" />
      </linearGradient>
      <linearGradient id="gem-gradient-2" x1="12" y1="8" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="rgba(99, 102, 241, 0.8)" />
        <stop offset="1" stopColor="rgba(79, 70, 229, 0.9)" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Display Soul Gem count with icon
 */
export const SoulGemDisplay: React.FC<SoulGemDisplayProps> = ({
  amount,
  label,
  showLabel = true,
}) => {
  // Format amount (remove decimals for cleaner display)
  const formatAmount = (amt: string) => {
    const num = parseFloat(amt);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toFixed(0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.gemIcon}>
        <SoulGemIcon />
      </div>
      <span className={styles.amount}>{formatAmount(amount)}</span>
      {showLabel && <span className={styles.label}>{label || 'Soul Gems'}</span>}
    </div>
  );
};

/**
 * Azura's Power Indicator with link to BaseScan
 */
interface AzuraPowerIndicatorProps {
  soulGems: string;
  walletAddress: string;
  governanceTokenAddress: string;
}

export const AzuraPowerIndicator: React.FC<AzuraPowerIndicatorProps> = ({
  soulGems,
  walletAddress,
  governanceTokenAddress,
}) => {
  const handleViewWallet = () => {
    window.open(`https://basescan.org/token/${governanceTokenAddress}?a=${walletAddress}`, '_blank');
  };

  return (
    <div className={styles.azuraPower}>
      <Image
        src="/uploads/HappyEmote.png"
        alt="Azura"
        width={40}
        height={40}
        className={styles.azuraAvatar}
        unoptimized
      />
      <div className={styles.azuraInfo}>
        <h4 className={styles.azuraName}>
          Azura AI
          <span className={styles.aiTag}>Agent</span>
        </h4>
        <SoulGemDisplay amount={soulGems} label="Voting Power (40%)" />
      </div>
      <button
        className={styles.viewWalletButton}
        onClick={handleViewWallet}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
        View Wallet
      </button>
    </div>
  );
};

export default SoulGemDisplay;
