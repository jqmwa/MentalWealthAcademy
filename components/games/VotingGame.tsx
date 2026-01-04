'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './VotingGame.module.css';
import AzuraDialogue from '@/components/azura-dialogue/AzuraDialogue';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';

interface Submission {
  id: string;
  user_id: string;
  image_url: string | null;
  username: string;
  avatar_url: string | null;
  created_at: string;
  isRevealed: boolean;
  voteCount: number;
}

interface GameData {
  id: string;
  state: 'submission' | 'voting' | 'revealed' | 'daemon' | 'finished';
  submissionDeadline: string;
  votingDeadline: string | null;
  createdAt: string;
  submissions: Submission[];
  userVote: string | null;
  azuraVote: string | null;
  userHasSubmitted: boolean;
}

async function uploadIfPresent(file: File | null) {
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Upload failed');
  }
  return (await res.json()) as { url: string; mime: string };
}

const VotingGame: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { setOpen: setConnectKitOpen } = useModal();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null); // Track which slot is submitting
  const [voting, setVoting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Map<number, File>>(new Map()); // Track file per slot
  const [previewUrls, setPreviewUrls] = useState<Map<number, string>>(new Map()); // Track preview per slot
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map()); // Track file inputs per slot
  const [azuraMessage, setAzuraMessage] = useState<string>('');
  const [showAzura, setShowAzura] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(24 * 60 * 60); // 24 hours in seconds
  const [countdownFinished, setCountdownFinished] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [revealingResults, setRevealingResults] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [demoState, setDemoState] = useState<'voting' | 'revealed' | 'daemon' | 'finished'>('voting');
  const [demoSubmissions, setDemoSubmissions] = useState<Submission[]>([]);
  const [demoAzuraVote, setDemoAzuraVote] = useState<string | null>(null);

  // Test data - 5 users with uploaded pictures
  const createTestData = (state: 'submission' | 'voting' | 'revealed' | 'daemon' | 'finished', submissions?: Submission[], azuraVote?: string | null): GameData => {
    const defaultSubmissions = [
      {
        id: 'test-sub-1',
        user_id: 'test-user-1',
        image_url: 'https://picsum.photos/seed/meme1/400/400',
        username: 'alice',
        avatar_url: null,
        created_at: new Date().toISOString(),
        isRevealed: state !== 'voting' && state !== 'submission',
        voteCount: 3,
      },
      {
        id: 'test-sub-2',
        user_id: 'test-user-2',
        image_url: 'https://picsum.photos/seed/meme2/400/400',
        username: 'bob',
        avatar_url: null,
        created_at: new Date().toISOString(),
        isRevealed: state !== 'voting' && state !== 'submission',
        voteCount: 1,
      },
      {
        id: 'test-sub-3',
        user_id: 'test-user-3',
        image_url: 'https://picsum.photos/seed/meme3/400/400',
        username: 'charlie',
        avatar_url: null,
        created_at: new Date().toISOString(),
        isRevealed: state !== 'voting' && state !== 'submission',
        voteCount: 2,
      },
      {
        id: 'test-sub-4',
        user_id: 'test-user-4',
        image_url: 'https://picsum.photos/seed/meme4/400/400',
        username: 'diana',
        avatar_url: null,
        created_at: new Date().toISOString(),
        isRevealed: state !== 'voting' && state !== 'submission',
        voteCount: 4,
      },
      {
        id: 'test-sub-5',
        user_id: 'test-user-5',
        image_url: 'https://picsum.photos/seed/meme5/400/400',
        username: 'eve',
        avatar_url: null,
        created_at: new Date().toISOString(),
        isRevealed: state !== 'voting' && state !== 'submission',
        voteCount: 0,
      },
    ];
    
    const finalSubmissions = submissions || defaultSubmissions;
    const finalAzuraVote = azuraVote !== undefined ? azuraVote : (state === 'daemon' || state === 'finished' ? 'test-sub-4' : null);
    
    return {
      id: 'test-game-1',
      state,
      submissionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      votingDeadline: state === 'voting' || state === 'revealed' || state === 'daemon' || state === 'finished'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
        : null,
      createdAt: new Date().toISOString(),
      submissions: finalSubmissions,
      userVote: state === 'revealed' || state === 'daemon' || state === 'finished' ? 'test-sub-1' : null,
      azuraVote: finalAzuraVote,
      userHasSubmitted: true,
    };
  };

  const fetchGameData = async () => {
    try {
      const response = await fetch('/api/games/voting/current', { cache: 'no-store' });
      const data = await response.json();
      if (data.game) {
        setGameData(data.game);
        
        // 24-hour countdown timer for daily rotating game

        // Show Azura message when revealed
        if (data.game.state === 'revealed' && data.game.azuraVote) {
          const azuraSubmission = data.game.submissions.find((s: Submission) => s.id === data.game.azuraVote);
          if (azuraSubmission) {
            setAzuraMessage(`I've added 2 votes to ${azuraSubmission.username}'s submission - it's my favorite! 😊`);
            setShowAzura(true);
          }
        }
      } else {
        setGameData(null);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testMode) {
      setLoading(false);
      return;
    }
    fetchGameData();
    const interval = setInterval(fetchGameData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [testMode]);

  const handleCountdownComplete = () => {
    if (testMode) {
      // Initialize demo with user votes (each user voted once)
      const initialSubmissions: Submission[] = [
        {
          id: 'test-sub-1',
          user_id: 'test-user-1',
          image_url: 'https://picsum.photos/seed/meme1/400/400',
          username: 'alice',
          avatar_url: null,
          created_at: new Date().toISOString(),
          isRevealed: true,
          voteCount: 3, // 3 users voted for this
        },
        {
          id: 'test-sub-2',
          user_id: 'test-user-2',
          image_url: 'https://picsum.photos/seed/meme2/400/400',
          username: 'bob',
          avatar_url: null,
          created_at: new Date().toISOString(),
          isRevealed: true,
          voteCount: 1,
        },
        {
          id: 'test-sub-3',
          user_id: 'test-user-3',
          image_url: 'https://picsum.photos/seed/meme3/400/400',
          username: 'charlie',
          avatar_url: null,
          created_at: new Date().toISOString(),
          isRevealed: true,
          voteCount: 2,
        },
        {
          id: 'test-sub-4',
          user_id: 'test-user-4',
          image_url: 'https://picsum.photos/seed/meme4/400/400',
          username: 'diana',
          avatar_url: null,
          created_at: new Date().toISOString(),
          isRevealed: true,
          voteCount: 4, // Highest - Azura will pick this
        },
        {
          id: 'test-sub-5',
          user_id: 'test-user-5',
          image_url: 'https://picsum.photos/seed/meme5/400/400',
          username: 'eve',
          avatar_url: null,
          created_at: new Date().toISOString(),
          isRevealed: true,
          voteCount: 0,
        },
      ];
      setDemoSubmissions(initialSubmissions);
      setDemoState('revealed');
      setDemoAzuraVote(null);
    }
  };

  // 24-hour countdown timer
  useEffect(() => {
    if (countdownActive && countdownSeconds > 0) {
      const timer = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            setCountdownActive(false);
            setCountdownFinished(true);
            handleCountdownComplete();
            return 24 * 60 * 60; // Reset to 24 hours
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownActive, countdownSeconds]);

  const startCountdown = () => {
    if (testMode) {
      setDemoState('voting');
      setDemoSubmissions([]);
      setDemoAzuraVote(null);
      setShowAzura(false);
    }
    setCountdownSeconds(24 * 60 * 60); // 24 hours
    setCountdownActive(true);
    setCountdownFinished(false);
  };

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelect = (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => new Map(prev).set(slotIndex, file));
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => new Map(prev).set(slotIndex, url));
    }
  };

  const handleSubmit = async (slotIndex: number) => {
    const file = selectedFiles.get(slotIndex);
    if (!file || !gameData) return;

    setSubmitting(slotIndex);
    try {
      const uploadResult = await uploadIfPresent(file);
      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      const response = await fetch('/api/games/voting/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadResult.url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      // Refresh game data
      await fetchGameData();
      setSelectedFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(slotIndex);
        return newMap;
      });
      setPreviewUrls(prev => {
        const newMap = new Map(prev);
        const url = newMap.get(slotIndex);
        if (url) URL.revokeObjectURL(url);
        newMap.delete(slotIndex);
        return newMap;
      });
      const input = fileInputRefs.current.get(slotIndex);
      if (input) {
        input.value = '';
      }
    } catch (error: any) {
      alert(error.message || 'Failed to submit image');
    } finally {
      setSubmitting(null);
    }
  };

  const handleRevealResults = async () => {
    if (!isConnected || !address) {
      setConnectKitOpen(true);
      return;
    }

    setRevealingResults(true);
    try {
      // TODO: Trigger blockchain transaction here
      // For now, just proceed to revealed state
      if (testMode) {
        setDemoState('revealed');
      }
      // In real mode, this would trigger a blockchain transaction
      // await sendTransaction(...);
    } catch (error: any) {
      alert(error.message || 'Failed to reveal results');
    } finally {
      setRevealingResults(false);
    }
  };

  const handleEndGame = async () => {
    if (!isConnected || !address) {
      setConnectKitOpen(true);
      return;
    }

    try {
      // TODO: Trigger blockchain transaction here to end the game
      // await sendTransaction(...);
      setCountdownFinished(false);
      setCountdownActive(false);
      setCountdownSeconds(60);
      if (testMode) {
        setDemoState('voting');
        setDemoSubmissions([]);
        setDemoAzuraVote(null);
        setShowAzura(false);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to end game');
    }
  };

  const handleVote = async (submissionId: string) => {
    if (!gameData) return;

    setVoting(true);
    try {
      const response = await fetch('/api/games/voting/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Vote failed');
      }

      // Refresh game data
      await fetchGameData();
    } catch (error: any) {
      alert(error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  // Transition from daemon to finished after Azura dialogue completes
  const handleAzuraComplete = () => {
    if (testMode && demoState === 'daemon' && demoAzuraVote) {
      // Update vote counts when dialogue completes
      setDemoSubmissions(prevSubmissions => {
        return prevSubmissions.map(sub => 
          sub.id === demoAzuraVote 
            ? { ...sub, voteCount: sub.voteCount + 2 }
            : sub
        );
      });
      // Transition to finished, but keep dialogue visible
      setTimeout(() => {
        setDemoState('finished');
        // Don't hide Azura dialogue - keep it visible
      }, 500);
    }
  };

  // Test mode toggle button
  const currentGameData = testMode 
    ? createTestData(demoState, demoSubmissions.length > 0 ? demoSubmissions : undefined, demoAzuraVote)
    : gameData;

  // Handle Azura's vote after revealed phase
  useEffect(() => {
    if (testMode && demoState === 'revealed' && demoSubmissions.length > 0 && !demoAzuraVote) {
      // Wait 2 seconds then show Azura picking
      const timer = setTimeout(() => {
        // Find the submission with highest votes (Azura picks the leader)
        const sorted = [...demoSubmissions].sort((a, b) => b.voteCount - a.voteCount);
        const azuraPick = sorted[0].id;
        setDemoAzuraVote(azuraPick);
        setDemoState('daemon');
        setShowAzura(true);
        setAzuraMessage(`I've added 2 votes to ${sorted[0].username}'s submission - it's my favorite! 😊`);
        // Don't update vote counts yet - wait for dialogue to complete
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode, demoState, demoSubmissions.length, demoAzuraVote]);

  if (loading && !testMode) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading game...</div>
      </div>
    );
  }

  if (!currentGameData && !testMode) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h2>No Active Game</h2>
          <p>A new game will start soon!</p>
          <button 
            onClick={() => setTestMode(true)}
            className={styles.testButton}
            style={{ marginTop: '20px' }}
          >
            View Test/Demo (5 Users)
          </button>
        </div>
      </div>
    );
  }

  if (testMode && !currentGameData) {
    return null;
  }

  return (
    <div className={styles.container}>
      {testMode && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '16px', 
          padding: '12px', 
          background: '#fff3cd', 
          border: '2px solid #ffc107',
          borderRadius: '8px'
        }}>
          <strong>TEST MODE</strong> - Showing 5 users with submissions
          <button 
            onClick={() => setTestMode(false)}
            style={{ 
              marginLeft: '16px', 
              padding: '4px 12px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Exit Test Mode
          </button>
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Daily Meme Contest</h1>
              {!testMode && (
                <button 
                  onClick={() => setTestMode(true)}
                  className={styles.demoButton}
                >
                  View Demo
                </button>
              )}
              <button 
                onClick={countdownFinished ? handleEndGame : startCountdown}
                className={styles.countdownButton}
                disabled={countdownActive && !countdownFinished}
              >
                {countdownFinished ? 'End Game' : countdownActive ? formatCountdown(countdownSeconds) : 'Start'}
              </button>
            </div>
            <p className={styles.description}>
              Choose a slot (1-5) and upload your funniest picture. Once 5 users submit, voting begins!
            </p>
          </div>
        </div>
      </div>

      {showAzura && azuraMessage && (demoState === 'daemon' || demoState === 'finished') && (
        <div className={styles.azuraContainer}>
          <AzuraDialogue
            message={azuraMessage}
            emotion="happy"
            onComplete={handleAzuraComplete}
            showSkip={false}
            autoStart={true}
          />
        </div>
      )}

      {/* Submission Phase */}
      {currentGameData!.state === 'submission' && (
        <div className={styles.submissionSection}>
          <div className={styles.roundHeader}>
            <h2 className={styles.roundTitle}>Round {roundNumber}</h2>
            <div className={styles.roundHeaderSpacer}></div>
            <div className={styles.stateBadge} data-state={currentGameData!.state}>
              Submission Phase
            </div>
          </div>

          <div className={styles.submissionsGrid}>
            {/* Render 5 slots */}
            {Array.from({ length: 5 }).map((_, slotIndex) => {
              const submission = currentGameData!.submissions[slotIndex];
              const previewUrl = previewUrls.get(slotIndex);
              const isSubmitting = submitting === slotIndex;
              
              return (
                <div key={slotIndex} className={styles.submissionCard}>
                  {submission ? (
                    // Slot is filled
                    submission.isRevealed ? (
                      <Image
                        src={submission.image_url!}
                        alt={`Submission`}
                        width={200}
                        height={200}
                        className={styles.submissionImage}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.maskedCard}>
                        <div className={styles.maskedContent}>
                          <Image
                            src="/icons/card.svg"
                            alt="Card"
                            width={48}
                            height={48}
                            className={styles.cardIcon}
                          />
                          <span className={styles.maskedLabel}>@{submission.username}</span>
                        </div>
                      </div>
                    )
                  ) : previewUrl ? (
                    // User has selected a file for this slot
                    <div className={styles.previewContainer}>
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className={styles.submissionImage}
                        unoptimized
                      />
                      <button
                        onClick={() => handleSubmit(slotIndex)}
                        disabled={isSubmitting}
                        className={styles.submitButton}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  ) : (
                    // Empty slot - show upload option
                    <div className={styles.emptyCard}>
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current.set(slotIndex, el);
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(slotIndex, e)}
                        className={styles.fileInput}
                        id={`image-upload-${slotIndex}`}
                      />
                      <label htmlFor={`image-upload-${slotIndex}`} className={styles.uploadLabel}>
                        Upload
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voting Phase */}
      {currentGameData!.state === 'voting' && (
        <div className={styles.votingSection}>
          <div className={styles.roundHeader}>
            <h2 className={styles.roundTitle}>Round {roundNumber}</h2>
            <div className={styles.roundHeaderSpacer}></div>
            <div className={styles.stateBadge} data-state={currentGameData!.state}>
              Voting Phase
            </div>
          </div>
          <p className={styles.instruction}>
            {currentGameData!.userVote
              ? "You've already voted! Waiting for voting to end..."
              : 'Click on the picture you think is the funniest!'}
          </p>
          
          {currentGameData!.userVote && !revealingResults && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <button
                onClick={handleRevealResults}
                className={styles.revealButton}
                disabled={revealingResults}
              >
                {revealingResults ? 'Revealing...' : 'Reveal Results'}
              </button>
            </div>
          )}

          <div className={styles.submissionsGrid}>
            {currentGameData!.submissions.map((sub) => (
              <div
                key={sub.id}
                className={`${styles.submissionCard} ${currentGameData!.userVote === sub.id ? styles.votedCard : ''} ${!currentGameData!.userVote ? styles.votableCard : ''}`}
                onClick={() => !currentGameData!.userVote && !voting && handleVote(sub.id)}
              >
                {/* Show all images in voting phase (locked round) */}
                {sub.isRevealed ? (
                  <Image
                    src={sub.image_url!}
                    alt={`Submission`}
                    width={200}
                    height={200}
                    className={styles.submissionImage}
                    unoptimized
                  />
                ) : (
                  <div className={styles.maskedCard}>
                    <div className={styles.maskedContent}>
                      <Image
                        src="/icons/card.svg"
                        alt="Card"
                        width={48}
                        height={48}
                        className={styles.cardIcon}
                      />
                      <span className={styles.maskedLabel}>@{sub.username}</span>
                    </div>
                  </div>
                )}
                {currentGameData!.userVote === sub.id && (
                  <div className={styles.votedBadge}>Your Vote ✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revealed Phase - Initial Results */}
      {currentGameData!.state === 'revealed' && (
        <div className={styles.revealedSection}>
          <div className={styles.roundHeader}>
            <h2 className={styles.roundTitle}>Round {roundNumber}</h2>
            <div className={styles.roundHeaderSpacer}></div>
            <div className={styles.stateBadge} data-state={currentGameData!.state}>
              Results
            </div>
          </div>
          <p className={styles.instruction}>All cards have been revealed! Check out the vote counts below.</p>

          <div className={styles.submissionsGrid}>
            {currentGameData!.submissions
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((sub) => (
                <div
                  key={sub.id}
                  className={`${styles.submissionCard} ${currentGameData!.userVote === sub.id ? styles.userPick : ''}`}
                >
                  <Image
                    src={sub.image_url!}
                    alt={`Submission`}
                    width={200}
                    height={200}
                    className={styles.submissionImage}
                    unoptimized
                  />
                  <div className={styles.submissionInfo}>
                    <div className={styles.voteCount}>
                      <span className={styles.voteCountNumber}>{sub.voteCount}</span>
                      <span className={styles.voteCountLabel}>votes</span>
                      {currentGameData!.userVote === sub.id && (
                        <span className={styles.userVoteBadge}>Your vote</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Daemon Phase - Azura is selecting */}
      {currentGameData!.state === 'daemon' && (
        <div className={styles.revealedSection}>
          <div className={styles.roundHeader}>
            <h2 className={styles.roundTitle}>Round {roundNumber}</h2>
            <div className={styles.roundHeaderSpacer}></div>
            <div className={styles.stateBadge} data-state={currentGameData!.state}>
              Daemon Phase
            </div>
          </div>
          <p className={styles.instruction}>Azura is selecting her favorite meme...</p>

          <div className={styles.submissionsGrid}>
            {currentGameData!.submissions
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((sub) => (
                <div
                  key={sub.id}
                  className={`${styles.submissionCard} ${currentGameData!.azuraVote === sub.id ? styles.azuraPick : ''} ${currentGameData!.userVote === sub.id ? styles.userPick : ''}`}
                >
                  <Image
                    src={sub.image_url!}
                    alt={`Submission`}
                    width={200}
                    height={200}
                    className={styles.submissionImage}
                    unoptimized
                  />
                  <div className={styles.submissionInfo}>
                    <div className={styles.voteCount}>
                      <span className={styles.voteCountNumber}>{sub.voteCount}</span>
                      <span className={styles.voteCountLabel}>votes</span>
                      {currentGameData!.azuraVote === sub.id && (
                        <span className={styles.azuraBadge}>Azura&apos;s pick</span>
                      )}
                      {currentGameData!.userVote === sub.id && (
                        <span className={styles.userVoteBadge}>Your vote</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Finished Phase - Final Results with Azura's votes */}
      {currentGameData!.state === 'finished' && (
        <div className={styles.revealedSection}>
          <div className={styles.roundHeader}>
            <h2 className={styles.roundTitle}>Round {roundNumber}</h2>
            <div className={styles.roundHeaderSpacer}></div>
            <div className={styles.stateBadge} data-state={currentGameData!.state}>
              Final Results
            </div>
          </div>
          <p className={styles.instruction}>All votes are in! Check out the final vote counts including Azura&apos;s 2 votes.</p>

          <div className={styles.submissionsGrid}>
            {currentGameData!.submissions
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((sub) => (
                <div
                  key={sub.id}
                  className={`${styles.submissionCard} ${currentGameData!.azuraVote === sub.id ? styles.azuraPick : ''} ${currentGameData!.userVote === sub.id ? styles.userPick : ''}`}
                >
                  <Image
                    src={sub.image_url!}
                    alt={`Submission`}
                    width={200}
                    height={200}
                    className={styles.submissionImage}
                    unoptimized
                  />
                  <div className={styles.submissionInfo}>
                    <div className={styles.voteCount}>
                      <span className={styles.voteCountNumber}>{sub.voteCount}</span>
                      <span className={styles.voteCountLabel}>votes</span>
                      {currentGameData!.azuraVote === sub.id && (
                        <span className={styles.azuraBadge}>+2 from Azura</span>
                      )}
                      {currentGameData!.userVote === sub.id && (
                        <span className={styles.userVoteBadge}>Your vote</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingGame;
