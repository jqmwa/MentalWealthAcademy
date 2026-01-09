'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import styles from './FinalizeButton.module.css';

interface FinalizeButtonProps {
  proposalId: string;
  tokenAllocation: number;
  onFinalized?: () => void;
}

const FinalizeButton: React.FC<FinalizeButtonProps> = ({
  proposalId,
  tokenAllocation,
  onFinalized,
}) => {
  const { address, isConnected } = useAccount();
  const [finalizing, setFinalizing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Check if already finalized on mount
  useEffect(() => {
    checkFinalizationStatus();
  }, [proposalId]);

  const checkFinalizationStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch(`/api/voting/proposal/${proposalId}/finalize`);
      const data = await response.json();
      
      if (data.finalized && data.transaction) {
        setTxHash(data.transaction.hash);
      }
    } catch (error) {
      console.error('Error checking finalization status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleFinalize = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setFinalizing(true);
    setError(null);

    try {
      const response = await fetch(`/api/voting/proposal/${proposalId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWalletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finalize proposal');
      }

      setTxHash(data.transactionHash);
      
      // Show success message
      alert(`🎉 Proposal finalized!\n\nYou will receive ${tokenAllocation}% of Azura's token pool.\n\nTransaction: ${data.transactionHash.slice(0, 10)}...`);
      
      // Notify parent component
      if (onFinalized) {
        onFinalized();
      }

      // Poll for confirmation
      pollTransactionStatus(data.transactionHash);
    } catch (error: any) {
      console.error('Error finalizing proposal:', error);
      setError(error.message || 'Failed to finalize proposal');
      alert(`Error: ${error.message || 'Failed to finalize proposal'}`);
    } finally {
      setFinalizing(false);
    }
  };

  const pollTransactionStatus = async (hash: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.log('Stopped polling transaction status');
        return;
      }

      attempts++;

      try {
        const response = await fetch(`/api/voting/proposal/${proposalId}/finalize`);
        const data = await response.json();

        if (data.transaction?.status === 'confirmed') {
          console.log('Transaction confirmed!');
          if (onFinalized) {
            onFinalized();
          }
          return;
        }

        if (data.transaction?.status === 'failed') {
          console.error('Transaction failed');
          setError('Transaction failed on-chain');
          return;
        }

        // Continue polling
        setTimeout(poll, 10000); // Check every 10 seconds
      } catch (error) {
        console.error('Error polling transaction:', error);
      }
    };

    poll();
  };

  const viewTransaction = () => {
    if (txHash) {
      window.open(`https://basescan.org/tx/${txHash}`, '_blank');
    }
  };

  if (checking) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingText}>Checking status...</div>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className={styles.container}>
        <button
          className={styles.viewButton}
          onClick={viewTransaction}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          View on Basescan
        </button>
        <p className={styles.successText}>
          ✅ Finalized • {tokenAllocation}% tokens allocated
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.finalizeButton}
        onClick={handleFinalize}
        disabled={finalizing || !isConnected}
        type="button"
      >
        {finalizing ? (
          <>
            <div className={styles.spinner}></div>
            <span>Finalizing...</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor"/>
              <path d="M3 17L12 22L21 17" fill="currentColor" fillOpacity="0.6"/>
              <path d="M3 12L12 17L21 12" fill="currentColor" fillOpacity="0.8"/>
            </svg>
            <span>Finalize Proposal ({tokenAllocation}% tokens)</span>
          </>
        )}
      </button>
      {error && <p className={styles.errorText}>{error}</p>}
      {!isConnected && (
        <p className={styles.hintText}>Connect wallet to finalize</p>
      )}
    </div>
  );
};

export default FinalizeButton;
