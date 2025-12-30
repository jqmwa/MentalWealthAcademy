'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import styles from './AccountLinkingModal.module.css';

interface AccountLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  questId?: string; // Optional: if triggered by quest completion
  shardsEarned?: number; // Display rewards earned
  onAccountLinked?: () => void; // Callback after successful linking
}

export function AccountLinkingModal({
  isOpen,
  onClose,
  questId,
  shardsEarned,
  onAccountLinked,
}: AccountLinkingModalProps) {
  const { user: privyUser, authenticated, connectWallet, createWallet, ready } = usePrivy();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setError(null);
        setIsSuccess(false);
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLinking) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLinking, onClose]);

  const handleLinkAccount = async () => {
    if (!authenticated || !ready) {
      setError('Please sign in first.');
      return;
    }

    setIsLinking(true);
    setError(null);

    try {
      // Check if user already has a wallet
      const hasWallet = privyUser?.wallet;
      
      if (!hasWallet) {
        // User doesn't have a wallet yet, create one
        try {
          await createWallet();
          // Wait a moment for Privy to update
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (err: any) {
          // If createWallet fails, try connectWallet (for external wallets)
          try {
            await connectWallet();
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (connectErr: any) {
            throw new Error(connectErr?.message || 'Failed to connect account. Please try again.');
          }
        }
      }

      // Call the API to link the account
      // The API will extract the wallet address from Privy server-side
      const response = await fetch('/api/account/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link account');
      }

      setIsSuccess(true);
      
      // Call the callback if provided
      if (onAccountLinked) {
        onAccountLinked();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error linking account:', err);
      setError(err.message || 'Failed to link account. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`${styles.overlay} ${isAnimating ? styles.open : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget && !isLinking) {
        onClose();
      }
    }}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          disabled={isLinking}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {isSuccess ? (
          <div className={styles.successContent}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>Account Linked Successfully!</h2>
            <p className={styles.message}>
              Your account has been linked. You can now receive rewards directly to your account.
            </p>
          </div>
        ) : (
          <div className={styles.content}>
            <h2 className={styles.title}>Link an Account to Receive Rewards</h2>
            
            {shardsEarned !== undefined && shardsEarned > 0 && (
              <div className={styles.rewardMessage}>
                <p>You&apos;ve earned <strong>{shardsEarned} shards</strong>! To receive your rewards, sync an eligible account.</p>
              </div>
            )}

            <div className={styles.benefitsList}>
              <h3 className={styles.benefitsTitle}>Benefits:</h3>
              <ul className={styles.benefits}>
                <li>Receive quest rewards directly to your account</li>
                <li>Participate in governance and voting</li>
                <li>Earn your digital items</li>
              </ul>
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                onClick={handleLinkAccount}
                disabled={isLinking || !authenticated || !ready}
              >
                {isLinking ? 'Linking...' : 'Link an Account'}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={onClose}
                disabled={isLinking}
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

