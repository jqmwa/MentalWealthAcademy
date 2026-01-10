'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { providers, Contract } from 'ethers';
import styles from './TreasuryDisplay.module.css';

interface TreasuryDisplayProps {
  contractAddress: string;
  usdcAddress: string;
}

const USDC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const TreasuryDisplay: React.FC<TreasuryDisplayProps> = ({
  contractAddress,
  usdcAddress,
}) => {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  const loadBalance = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new providers.Web3Provider(window.ethereum);
        const usdcContract = new Contract(usdcAddress, USDC_ABI, provider);
        
        const balanceRaw = await usdcContract.balanceOf(contractAddress);
        const decimals = await usdcContract.decimals();
        
        // Format USDC (6 decimals)
        const balanceNum = Number(balanceRaw) / (10 ** Number(decimals));
        setBalance(balanceNum.toLocaleString('en-US', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        }));
      }
    } catch (error) {
      console.error('Error loading treasury balance:', error);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, usdcAddress]);

  useEffect(() => {
    loadBalance();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadBalance, 30000);
    return () => clearInterval(interval);
  }, [loadBalance]);

  const handleRefresh = () => {
    setLoading(true);
    loadBalance();
  };

  return (
    <div className={`${styles.container} ${loading ? styles.loading : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8.5C2 8.5 3 7 6.5 7C10 7 10 9 13.5 9C17 9 18 7.5 18 7.5V17.5C18 17.5 17 19 13.5 19C10 19 10 17 6.5 17C3 17 2 18.5 2 18.5V8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 14.5C2 14.5 3 13 6.5 13C10 13 10 15 13.5 15C17 15 18 13.5 18 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="18" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.titleText}>
            <p className={styles.label}>Available Funding</p>
            <h3 className={styles.title}>Treasury</h3>
          </div>
        </div>
        <button 
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loading}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.8273 3 17.35 4.30367 19 6.34267M21 3V9M21 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      <p className={styles.balance}>
        ${balance}
        <span className={styles.currency}>USDC</span>
      </p>
      <p className={styles.subtext}>
        Available for approved proposals
      </p>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Contract</p>
          <p className={styles.statValue}>
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Network</p>
          <p className={styles.statValue}>Base Mainnet</p>
        </div>
      </div>
    </div>
  );
};

export default TreasuryDisplay;
