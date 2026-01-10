'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useSignMessage } from 'wagmi';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import styles from './QuestDetailSidebar.module.css';
import { ConfettiCelebration } from './ConfettiCelebration';
import { ShardAnimation } from './ShardAnimation';
import { XConnectingModal } from '../x-connecting/XConnectingModal';

// Daemon Icon Component
const DaemonIcon: React.FC<{ size?: number }> = ({ size = 18.83 }) => {
  return (
    <Image
      src="/icons/Coin Poly.svg"
      alt="Daemon"
      width={size}
      height={size}
      className={styles.shardIcon}
    />
  );
};

// Close Icon Component
const CloseIcon: React.FC = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

interface QuestDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  quest: {
    id: string;
    title: string;
    academy: string;
    date: string;
    time: string;
    questName: string;
    usdcBonded: string;
    usdcReward: string;
    imageUrl?: string;
    questType?: 'proof-required' | 'no-proof' | 'follow-and-own' | 'twitter-follow';
    description?: string;
  } | null;
}

const QuestDetailSidebar: React.FC<QuestDetailSidebarProps> = ({ isOpen, onClose, quest }) => {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShardAnimation, setShowShardAnimation] = useState(false);
  const [shardsAwarded, setShardsAwarded] = useState(0);
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [startingShards, setStartingShards] = useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      setShouldRender(true);
      // Use requestAnimationFrame to ensure DOM is ready before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Check if Twitter is linked via X OAuth and auto-check follow status
  useEffect(() => {
    if (!quest || quest.questType !== 'twitter-follow' || !isConnected) {
      setStep1Completed(false);
      setStep2Completed(false);
      return;
    }
    
    const checkXAccountAndFollow = async (autoCheckFollow = false) => {
      if (!isConnected || !address) {
        setStep1Completed(false);
        return;
      }
      
      try {
        const response = await fetch('/api/x-auth/status', { 
          cache: 'no-store',
          credentials: 'include',
          headers: await getWalletAuthHeaders(address, signMessageAsync)
        });
        
        if (response.status === 401) {
          setStep1Completed(false);
          return;
        }
        
        const data = await response.json();
        const isConnected = data.connected === true;
        setStep1Completed(isConnected);
        
        // If just connected, automatically check follow status
        if (isConnected && autoCheckFollow && !step2Completed) {
          const followResponse = await fetch('/api/x-auth/check-follow', {
            method: 'POST',
            cache: 'no-store',
            credentials: 'include',
            headers: await getWalletAuthHeaders(address, signMessageAsync)
          });
          const followData = await followResponse.json();
          
          if (followData.isFollowing) {
            setStep2Completed(true);
            
            // Auto-complete quest if following
            try {
              const completeResponse = await fetch('/api/quests/auto-complete-twitter-quest', {
                method: 'POST',
                cache: 'no-store',
                credentials: 'include',
                headers: await getWalletAuthHeaders(address, signMessageAsync)
              });
              const completeData = await completeResponse.json();
              
              if (completeData.ok && completeData.shardsAwarded > 0) {
                setShardsAwarded(completeData.shardsAwarded);
                setStartingShards(completeData.startingShards || 0);
                setShowConfetti(true);
                setShowShardAnimation(true);
                window.dispatchEvent(new Event('shardsUpdated'));
                
                setTimeout(() => {
                  setShowConfetti(false);
                  setShowShardAnimation(false);
                }, 5000);
              }
            } catch (error) {
              console.error('Failed to auto-complete quest:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check X account:', error);
        setStep1Completed(false);
      }
    };
    
    // Check for auto_check parameter in URL
    const params = new URLSearchParams(window.location.search);
    const autoCheck = params.get('auto_check');
    
    checkXAccountAndFollow(autoCheck === 'true');

    // Refresh when window regains focus (after OAuth redirect)
    const handleFocus = () => {
      checkXAccountAndFollow(true);
    };
    
    // Listen for X account update events
    const handleXAccountUpdate = () => {
      checkXAccountAndFollow(true);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('xAccountUpdated', handleXAccountUpdate);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('xAccountUpdated', handleXAccountUpdate);
    };
  }, [quest, isConnected, address, step2Completed]);

  const handleConnectTwitter = async () => {
    try {
      // Show connecting modal
      setShowConnectingModal(true);
      
      // Initiate X OAuth flow - no wallet connection required
      const response = await fetch('/api/x-auth/initiate', {
        credentials: 'include',
      });
      
      // Handle 401 (not authenticated) - user needs to sign in
      if (response.status === 401) {
        console.error('Not authenticated. Please sign in first.');
        setShowConnectingModal(false);
        alert('Please sign in to connect your X account.');
        return;
      }
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to initiate X OAuth:', errorData);
        setShowConnectingModal(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.authUrl) {
        // Small delay to show the modal, then redirect
        setTimeout(() => {
          window.location.href = data.authUrl;
        }, 800);
      } else {
        console.error('Failed to get auth URL:', data);
        setShowConnectingModal(false);
      }
    } catch (error) {
      console.error('Failed to connect X account:', error);
      setShowConnectingModal(false);
    }
  };

  const handleCheckFollow = async () => {
    setIsCheckingFollow(true);
    try {
      const response = await fetch('/api/x-auth/check-follow', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.isFollowing) {
        setStep2Completed(true);
      } else if (data.requiresManualVerification) {
        // Allow manual verification if API check fails
        setStep2Completed(true);
      } else if (data.error) {
        console.error('Follow check error:', data.error);
        alert(data.message || 'Failed to verify follow status. Please try again.');
      } else {
        alert('Please make sure you are following @MentalWealthDAO on X, then click Verify again.');
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
      alert('Failed to check follow status. Please try again.');
    } finally {
      setIsCheckingFollow(false);
    }
  };

  const handleCompleteQuest = async () => {
    if (!quest) return;
    
    // For twitter-follow quests, require both steps to be completed
    // For no-proof quests, allow direct completion
    if (quest.questType === 'twitter-follow' && (!step1Completed || !step2Completed)) {
      return;
    }
    
    setIsCompleting(true);
    try {
      // Get current shard count before completion
      const meResponse = await fetch('/api/me', { cache: 'no-store' });
      const meData = await meResponse.json();
      const currentStartingShards = meData?.user?.shardCount ?? 0;
      setStartingShards(currentStartingShards);
      
      const shardReward = parseInt(quest.usdcReward) || 10;
      const response = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: quest.id,
          shards: shardReward,
        }),
      });
      
      const data = await response.json();
      if (data.ok) {
        setShardsAwarded(shardReward);
        setShowConfetti(true);
        setShowShardAnimation(true);
        
        // Refresh shard count in navbar
        window.dispatchEvent(new Event('shardsUpdated'));
        
        // Close sidebar after animation
        setTimeout(() => {
          onClose();
          // Reset states after a delay
          setTimeout(() => {
            setShowConfetti(false);
            setShowShardAnimation(false);
            setShardsAwarded(0);
          }, 2000);
        }, 5000);
      } else {
        alert(data.error || 'Failed to complete quest. Please try again.');
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
      alert('Failed to complete quest. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!quest || !shouldRender) return null;

  return (
    <>
      <div className={`${styles.backdrop} ${isAnimating ? styles.backdropVisible : ''}`} onClick={onClose} />
      <div className={`${styles.sidebar} ${isAnimating ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarContent}>
          {/* Header with close button */}
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>Quest Details</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          {/* Top Section */}
          <div className={styles.topSection}>
            {/* Quest Image */}
            <div className={styles.questImageContainer}>
              <Image
                src={quest.imageUrl || "/icons/questbadge.png"}
                alt={quest.title}
                width={120}
                height={120}
                className={styles.questImage}
              />
            </div>

            {/* Quest Title */}
            <h1 className={styles.questTitle}>{quest.title}</h1>

            {/* Quest Details Grid */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date Added</span>
                <span className={styles.detailValue}>{quest.date}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time Added</span>
                <span className={styles.detailValue}>{quest.time}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Resolver</span>
                <span className={styles.detailValue}>Academy Oracle</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Daemon Pool Total</span>
                <span className={styles.detailValue}>
                  <DaemonIcon size={16} />
                  {quest.usdcBonded}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Completions Per Person</span>
                <span className={styles.detailValue}>1</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Minimum Daemon Received</span>
                <span className={styles.detailValue}>
                  <DaemonIcon size={16} />
                  {quest.usdcReward}
                </span>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className={styles.spacer} />

          {/* Bottom Section - Conditional based on quest type */}
          <div className={styles.bottomSection}>
            {/* Quest Description */}
            {quest.description && (
              <div className={styles.descriptionBox}>
                <h3 className={styles.sectionTitle}>Quest Description</h3>
                <p className={styles.sectionDescription}>{quest.description}</p>
                <div className={styles.questBannerImage}>
                  <Image
                    src="https://i.imgur.com/JEvcVXO.jpeg"
                    alt="Quest Banner"
                    width={600}
                    height={300}
                    className={styles.bannerImage}
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Proof Required Quest Type */}
            {quest.questType === 'proof-required' && (
              <>
                <h3 className={styles.sectionTitle}>Provide Proof</h3>
                <p className={styles.sectionDescription}>
                  Upload your marketing video proof into a ZK-Rollup. The rollup will be processed and sent for submission by the Daemon Model and the MWA Team.
                </p>

                {/* Upload Area */}
                <div className={styles.uploadArea}>
                  <div className={styles.uploadContent}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.uploadIcon}>
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className={styles.uploadText}>Click to upload or drag and drop</p>
                    <p className={styles.uploadSubtext}>Upload your CapCut marketing video (video files)</p>
                  </div>
                  <input
                    type="file"
                    id="proof-upload"
                    className={styles.fileInput}
                    accept="video/*"
                    onChange={(e) => {
                      // Handle file upload
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file);
                        // TODO: Implement ZK-Rollup upload logic
                      }
                    }}
                  />
                </div>

                {/* ZK-Rollup Info */}
                <div className={styles.zkInfo}>
                  <div className={styles.zkInfoHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.zkInfoTitle}>ZK-Rollup Processing</span>
                  </div>
                  <p className={styles.zkInfoText}>
                    Your proof will be encrypted and processed through a ZK-Rollup for privacy and verification. Once processed, it will be automatically submitted to the Daemon Model and MWA Team for review.
                  </p>
                </div>

                {/* Submit Button */}
                <button className={styles.submitButton} type="button">
                  Submit Proof
                </button>

                <Link href="/mwa/quests/admin" className={styles.adminVotingButton}>
                  ADMIN VOTING
                </Link>
              </>
            )}

            {/* No Proof Required Quest Type */}
            {quest.questType === 'no-proof' && (
              <>
                <h3 className={styles.sectionTitle}>Complete Quest</h3>
                <p className={styles.sectionDescription}>
                  Register for the event on the homepage. After registering, click the button below to complete the quest and claim your {quest.usdcReward} Daemon.
                </p>

                <div className={styles.actionBox}>
                  <div className={styles.actionIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className={styles.actionText}>
                    Visit the homepage and click &quot;Register&quot; on the event card, then return here to complete the quest.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    className={styles.submitButton} 
                    type="button"
                    onClick={handleCompleteQuest}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'Completing...' : `Complete Quest & Claim ${quest.usdcReward} Daemon`}
                  </button>
                  
                  <button 
                    className={styles.secondaryButton} 
                    type="button"
                    onClick={() => {
                      window.location.href = '/home';
                    }}
                    style={{ 
                      background: 'transparent', 
                      color: 'var(--color-primary)', 
                      border: '2px solid var(--color-primary)',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-button)',
                      fontSize: '14px',
                      fontWeight: 'var(--font-weight-medium)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Go to Homepage
                  </button>
                </div>
              </>
            )}

            {/* Twitter Follow Quest Type */}
            {quest.questType === 'twitter-follow' && (
              <>
                <h3 className={styles.sectionTitle}>Complete Quest</h3>
                <p className={styles.sectionDescription}>
                  Connect your X (Twitter) account and follow @MentalWealthDAO to earn Daemon!
                </p>

                <div className={styles.requirementsList}>
                  {/* Step 1: Connect Twitter */}
                  <div className={styles.requirementItem}>
                    <div className={`${styles.checkIcon} ${step1Completed ? styles.checkIconCompleted : ''}`}>
                      {step1Completed ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles.requirementContent}>
                      <span className={styles.requirementTitle}>Step 1: Connect X Account</span>
                      <span className={styles.requirementDescription}>Link your X (Twitter) account to get started</span>
                    </div>
                    {!step1Completed && isConnected && (
                      <button 
                        className={styles.stepButton}
                        onClick={handleConnectTwitter}
                      >
                        Connect X
                      </button>
                    )}
                  </div>

                  {/* Step 2: Follow @MentalWealthDAO */}
                  <div className={styles.requirementItem}>
                    <div className={`${styles.checkIcon} ${step2Completed ? styles.checkIconCompleted : ''}`}>
                      {step2Completed ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles.requirementContent}>
                      <span className={styles.requirementTitle}>Step 2: Follow @MentalWealthDAO</span>
                      <span className={styles.requirementDescription}>Follow @MentalWealthDAO on X (Twitter)</span>
                    </div>
                    {step1Completed && !step2Completed && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <a
                          href="https://twitter.com/MentalWealthDAO"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.stepButton}
                          style={{ textDecoration: 'none' }}
                        >
                          Open Twitter
                        </a>
                        <button 
                          className={styles.stepButton}
                          onClick={handleCheckFollow}
                          disabled={isCheckingFollow}
                        >
                          {isCheckingFollow ? 'Checking...' : '✓ Verify'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Complete Quest Button */}
                {step1Completed && step2Completed && (
                  <button 
                    className={styles.submitButton} 
                    type="button"
                    onClick={handleCompleteQuest}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'Completing...' : 'Complete Quest & Claim Daemon'}
                  </button>
                )}

                {!isConnected && (
                  <div className={styles.zkInfo}>
                    <p className={styles.zkInfoText}>
                      Please sign in to complete this quest.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Follow and Own Quest Type */}
            {quest.questType === 'follow-and-own' && (
              <>
                <h3 className={styles.sectionTitle}>Complete Quest</h3>
                <p className={styles.sectionDescription}>
                  Follow the Farcaster account @daemonagent and own an Academic Angel to complete this quest.
                </p>

                <div className={styles.requirementsList}>
                  <div className={styles.requirementItem}>
                    <div className={styles.checkIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.requirementContent}>
                      <span className={styles.requirementTitle}>Follow @daemonagent</span>
                      <span className={styles.requirementDescription}>Follow the Farcaster account on Warpcast</span>
                    </div>
                  </div>
                  <div className={styles.requirementItem}>
                    <div className={styles.checkIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className={styles.requirementContent}>
                      <span className={styles.requirementTitle}>Own an Academic Angel</span>
                      <span className={styles.requirementDescription}>Verify ownership of an Academic Angel NFT</span>
                    </div>
                  </div>
                </div>

                <div className={styles.zkInfo}>
                  <div className={styles.zkInfoHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.zkInfoTitle}>Verification</span>
                  </div>
                  <p className={styles.zkInfoText}>
                    Your Farcaster follow status and Academic Angel ownership will be automatically verified. No manual proof submission required.
                  </p>
                </div>

                <button className={styles.submitButton} type="button">
                  Verify Completion
                </button>
              </>
            )}

            {/* Default/No Quest Type - Show proof upload */}
            {!quest.questType && (
              <>
                <h3 className={styles.sectionTitle}>Provide Proof</h3>
                <p className={styles.sectionDescription}>
                  Upload your proof into a ZK-Rollup. The rollup will be processed and sent for submission by the Daemon Model and the MWA Team.
                </p>

                {/* Upload Area */}
                <div className={styles.uploadArea}>
                  <div className={styles.uploadContent}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.uploadIcon}>
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className={styles.uploadText}>Click to upload or drag and drop</p>
                    <p className={styles.uploadSubtext}>Your proof will be processed via ZK-Rollup</p>
                  </div>
                  <input
                    type="file"
                    id="proof-upload"
                    className={styles.fileInput}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      // Handle file upload
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file);
                        // TODO: Implement ZK-Rollup upload logic
                      }
                    }}
                  />
                </div>

                {/* ZK-Rollup Info */}
                <div className={styles.zkInfo}>
                  <div className={styles.zkInfoHeader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className={styles.zkInfoTitle}>ZK-Rollup Processing</span>
                  </div>
                  <p className={styles.zkInfoText}>
                    Your proof will be encrypted and processed through a ZK-Rollup for privacy and verification. Once processed, it will be automatically submitted to the Daemon Model and MWA Team for review.
                  </p>
                </div>

                {/* Submit Button */}
                <button className={styles.submitButton} type="button">
                  Submit Proof
                </button>

                <Link href="/mwa/quests/admin" className={styles.adminVotingButton}>
                  ADMIN VOTING
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfettiCelebration trigger={showConfetti} />
      {showShardAnimation && (
        <ShardAnimation 
          shards={shardsAwarded}
          startingShards={startingShards}
          onComplete={() => setShowShardAnimation(false)}
        />
      )}
      <XConnectingModal isOpen={showConnectingModal} />
    </>
  );
};

export default QuestDetailSidebar;

