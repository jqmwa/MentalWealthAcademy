'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './OnboardingModal.module.css';

interface Avatar {
  id: string;
  image_url: string;
  metadata_url: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'username' | 'avatar' | 'email' | 'complete';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [avatarChoices, setAvatarChoices] = useState<Avatar[]>([]);
  const [seed, setSeed] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Username validation
  const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
  const isUsernameValid = usernameRegex.test(username);

  // Generate avatar choices when username is confirmed
  const fetchAvatarChoices = useCallback(async (userSeed: string) => {
    try {
      const response = await fetch('/api/profile/preview-avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: userSeed }),
      });
      const data = await response.json();
      if (data.choices) {
        setAvatarChoices(data.choices);
        setSeed(data.seed);
      }
    } catch (err) {
      console.error('Failed to fetch avatars:', err);
      setError('Failed to load avatars. Please try again.');
    }
  }, []);

  // Check username availability
  const checkUsername = useCallback(async (name: string) => {
    if (!usernameRegex.test(name)) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(name)}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsername(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  // Handle step transitions
  const handleNextStep = async () => {
    setError(null);

    if (currentStep === 'username') {
      if (!isUsernameValid) {
        setError('Username must be 3-32 characters (letters, numbers, underscores only)');
        return;
      }
      if (usernameAvailable === false) {
        setError('This username is already taken');
        return;
      }
      // Generate seed from username for avatar selection
      await fetchAvatarChoices(username + Date.now().toString());
      setCurrentStep('avatar');
    } else if (currentStep === 'avatar') {
      if (!selectedAvatar) {
        setError('Please select an avatar');
        return;
      }
      setCurrentStep('email');
    } else if (currentStep === 'email') {
      // Create profile
      await createProfile();
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep === 'avatar') {
      setCurrentStep('username');
    } else if (currentStep === 'email') {
      setCurrentStep('avatar');
    }
  };

  const createProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: email || undefined,
          avatar_id: selectedAvatar?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('complete');
        // Redirect to home after brief celebration
        setTimeout(() => {
          router.push('/home');
          onClose();
        }, 2500);
      } else {
        setError(data.message || data.error || 'Failed to create profile');
      }
    } catch (err) {
      console.error('Profile creation error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== 'complete') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentStep, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Progress indicator */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ 
              width: currentStep === 'username' ? '25%' 
                : currentStep === 'avatar' ? '50%' 
                : currentStep === 'email' ? '75%' 
                : '100%' 
            }} 
          />
        </div>

        {/* Close button (not shown on complete step) */}
        {currentStep !== 'complete' && (
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Step 1: Username */}
        {currentStep === 'username' && (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.stepTitle}>Choose Your Username</h2>
            <p className={styles.stepDescription}>
              This is how other researchers will know you in the Academy.
            </p>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Username</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="your_username"
                  className={styles.input}
                  maxLength={32}
                  autoFocus
                />
                {checkingUsername && (
                  <span className={styles.inputSuffix}>
                    <div className={styles.spinner} />
                  </span>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className={`${styles.inputSuffix} ${styles.available}`}>✓</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className={`${styles.inputSuffix} ${styles.taken}`}>✗</span>
                )}
              </div>
              <p className={styles.inputHint}>
                3-32 characters, letters, numbers, and underscores only
              </p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button 
              className={styles.primaryButton}
              onClick={handleNextStep}
              disabled={!isUsernameValid || usernameAvailable === false || checkingUsername}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Avatar Selection */}
        {currentStep === 'avatar' && (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15L16 10L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 21L8 15L3 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.stepTitle}>Select Your Avatar</h2>
            <p className={styles.stepDescription}>
              These 5 avatars were uniquely assigned to you. Choose one to represent your identity.
            </p>

            <div className={styles.avatarGrid}>
              {avatarChoices.map((avatar) => (
                <button
                  key={avatar.id}
                  className={`${styles.avatarOption} ${selectedAvatar?.id === avatar.id ? styles.avatarSelected : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <Image
                    src={avatar.image_url}
                    alt={avatar.id}
                    width={100}
                    height={100}
                    className={styles.avatarImage}
                    unoptimized
                  />
                  {selectedAvatar?.id === avatar.id && (
                    <div className={styles.avatarCheckmark}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="var(--color-primary)"/>
                        <path d="M17 9L10 16L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.buttonRow}>
              <button className={styles.secondaryButton} onClick={handlePrevStep}>
                Back
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleNextStep}
                disabled={!selectedAvatar}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Email (Optional) */}
        {currentStep === 'email' && (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 7L13.03 12.7C12.7213 12.8934 12.3643 12.996 12 12.996C11.6357 12.996 11.2787 12.8934 10.97 12.7L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.stepTitle}>Add Your Email</h2>
            <p className={styles.stepDescription}>
              Optional: Get notified about new quests, events, and academy updates.
            </p>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@example.com"
                className={styles.input}
              />
              <p className={styles.inputHint}>
                You can skip this step and add an email later.
              </p>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.buttonRow}>
              <button className={styles.secondaryButton} onClick={handlePrevStep}>
                Back
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleNextStep}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>

            <button 
              className={styles.skipButton}
              onClick={() => {
                setEmail('');
                createProfile();
              }}
              disabled={isLoading}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div className={styles.stepContent}>
            <div className={styles.celebrationIcon}>
              <div className={styles.confettiContainer}>
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className={styles.confetti} 
                    style={{ 
                      '--delay': `${i * 0.1}s`,
                      '--x': `${(Math.random() - 0.5) * 200}px`,
                      '--rotation': `${Math.random() * 360}deg`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
              {selectedAvatar && (
                <Image
                  src={selectedAvatar.image_url}
                  alt="Your avatar"
                  width={120}
                  height={120}
                  className={styles.completedAvatar}
                  unoptimized
                />
              )}
            </div>
            <h2 className={styles.stepTitle}>Welcome to the Academy!</h2>
            <p className={styles.stepDescription}>
              Your profile is ready, <strong>@{username}</strong>. Let&apos;s start your research journey.
            </p>
            <div className={styles.shardReward}>
              <Image src="/icons/shard.svg" alt="Shard" width={24} height={24} />
              <span>+10 Welcome Shards</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;

