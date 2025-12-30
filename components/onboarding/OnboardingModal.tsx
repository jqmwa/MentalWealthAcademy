'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

type Step = 'account';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthday, setBirthday] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [avatarChoices, setAvatarChoices] = useState<Avatar[]>([]);
  const [seed, setSeed] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const checkingRef = useRef<string | null>(null); // Track which username we're currently checking
  const [userId, setUserId] = useState<string | null>(null); // Store userId after signup

  // Username validation (minimum 5 characters) - memoized to prevent re-renders
  const usernameRegex = useMemo(() => /^[a-zA-Z0-9_]{5,32}$/, []);
  const isUsernameValid = usernameRegex.test(username);
  
  // Email validation (required)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email && emailRegex.test(email);
  
  // Password validation
  const isPasswordValid = password.length >= 8;
  
  // Calculate max date (13 years ago from today)
  const maxDate = (() => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() - 13);
    return maxDate.toISOString().split('T')[0];
  })();

  // Birthday validation (must be at least 13 years old) - reactive
  const isBirthdayValid = useMemo(() => {
    if (!birthday) return false;
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Calculate exact age
    let exactAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      exactAge = age - 1;
    }
    
    return exactAge >= 13;
  }, [birthday]);
  
  // Account step validation (email, username, password, gender, birthday) - FIRST STEP
  const isAccountStepValid = 
    isEmailValid &&
    isUsernameValid && 
    usernameAvailable !== false && // Only block if explicitly unavailable
    isPasswordValid &&
    gender !== '' &&
    isBirthdayValid;

  // Generate avatar choices using userId (after account is created)
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
    // Prevent duplicate checks for the same username
    if (checkingRef.current === name) {
      return;
    }

    if (!usernameRegex.test(name)) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      checkingRef.current = null;
      return;
    }
    
    checkingRef.current = name;
    setCheckingUsername(true);
    setUsernameAvailable(null); // Reset while checking
    try {
      const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(name)}`);
      const data = await response.json();
      
      // Only update state if this is still the current check
      if (checkingRef.current !== name) {
        return;
      }
      
      // Handle both success and error responses
      if (response.ok) {
        if (typeof data.available === 'boolean') {
          setUsernameAvailable(data.available);
        } else {
          // If available is not a boolean, assume null (unknown)
          setUsernameAvailable(null);
        }
      } else {
        // If there's an error in the response, check if available is still provided
        if (typeof data.available === 'boolean') {
          setUsernameAvailable(data.available);
        } else {
          // If request failed and no availability info, don't set availability
          setUsernameAvailable(null);
        }
      }
    } catch (err) {
      console.error('Username check error:', err);
      // On network error, don't set availability (will be validated on server)
      if (checkingRef.current === name) {
        setUsernameAvailable(null);
      }
    } finally {
      if (checkingRef.current === name) {
        setCheckingUsername(false);
        checkingRef.current = null;
      }
    }
  }, [usernameRegex]);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 5) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      checkingRef.current = null;
      return;
    }

    // Don't re-check if we're already checking this exact username
    if (checkingRef.current === username) {
      return;
    }

    // Don't re-check if we already confirmed it's available (and not currently checking)
    if (usernameAvailable === true && checkingRef.current === null) {
      return;
    }

    const timer = setTimeout(() => {
      // Double-check username hasn't changed during debounce and we're not already checking it
      if (username && username.length >= 5 && checkingRef.current !== username) {
        checkUsername(username);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]); // Only depend on username - checkUsername is stable, and we use refs to prevent loops

  // Clear error when changing steps
  useEffect(() => {
    setError(null);
  }, [currentStep]);

  // Handle step transitions
  const handleNextStep = async () => {
    setError(null);

    if (currentStep === 'account') {
      if (!isEmailValid) {
        setError('Please enter a valid email address');
        return;
      }
      if (!isUsernameValid) {
        setError('Username must be 5-32 characters (letters, numbers, underscores only)');
        return;
      }
      if (usernameAvailable === false) {
        setError('This username is already taken');
        return;
      }
      if (!isPasswordValid) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!gender) {
        setError('Please select a gender');
        return;
      }
      if (!isBirthdayValid) {
        setError('You must be at least 13 years old to create an account');
        return;
      }
      
      // Create the account now so we can use userId for avatar generation
      setIsLoading(true);
      try {
        const signupResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        let signupData;
        try {
          const text = await signupResponse.text();
          signupData = text ? JSON.parse(text) : {};
        } catch (err) {
          console.error('Failed to parse signup response:', err);
          setError('Failed to create account. Please try again.');
          setIsLoading(false);
          return;
        }

        if (!signupResponse.ok) {
          // If account already exists, we can't proceed - user needs to sign in instead
          if (signupResponse.status === 409) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(signupData.error || 'Failed to create account');
          }
          setIsLoading(false);
          return;
        }

        // Store userId for profile creation
        if (signupData.userId) {
          setUserId(signupData.userId);
          // Create profile with username, gender, birthday (no avatar yet)
          await createProfile();
        } else {
          setError('Account creation failed. Please try again.');
        }
      } catch (err) {
        console.error('Signup error:', err);
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    setError(null);
    // No previous step now - account is the only step
  };

  const createProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Account was already created in the account step, just create/update the profile
      // Note: avatar_id is not included - user will select avatar on homepage
      const profileResponse = await fetch('/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          gender,
          birthday,
          // No avatar_id - user selects avatar on homepage
        }),
      });

      let profileData;
      try {
        const text = await profileResponse.text();
        profileData = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error('Failed to parse profile response:', err);
        setError('Failed to create profile. Please try again.');
        setIsLoading(false);
        return;
      }

      if (profileResponse.ok) {
        // Dispatch event to notify navbar of profile update
        window.dispatchEvent(new Event('profileUpdated'));
        // Redirect to home immediately - avatar selection will happen there
        router.push('/home');
        onClose();
      } else {
        // Log detailed error for debugging
        console.error('Profile creation failed:', {
          status: profileResponse.status,
          statusText: profileResponse.statusText,
          data: profileData,
          username,
        });
        const errorMessage = profileData.message || profileData.error || 'Failed to create profile';
        setError(`${errorMessage}${profileData.validChoices ? ` Valid choices: ${profileData.validChoices.join(', ')}` : ''}`);
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
      if (e.key === 'Escape') {
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
              width: currentStep === 'account' ? '100%' 
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

        {/* Step 1: Account Details (Email, Username, Password) */}
        {currentStep === 'account' && (
          <div className={styles.stepContent}>
            <div className={styles.stepIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 7L13.03 12.7C12.7213 12.8934 12.3643 12.996 12 12.996C11.6357 12.996 11.2787 12.8934 10.97 12.7L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className={styles.stepTitle}>Create Your Account</h2>
            <p className={styles.stepDescription}>
              Set up your login credentials.
            </p>
            
            <div className={styles.formFields}>
              <div className={styles.inputGroup}>
                <label htmlFor="onboarding-email" className={styles.inputLabel}>Email Address</label>
                <input
                  id="onboarding-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@example.com"
                  className={styles.input}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="onboarding-username" className={styles.inputLabel}>Username</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputPrefix}>@</span>
                  <input
                    id="onboarding-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="your_username"
                    className={styles.input}
                    maxLength={32}
                    autoComplete="username"
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
                  5-32 characters, letters, numbers, and underscores only
                </p>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="onboarding-password" className={styles.inputLabel}>Password</label>
                <input
                  id="onboarding-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={styles.input}
                  autoComplete="new-password"
                />
                <p className={styles.inputHint}>
                  At least 8 characters
                </p>
              </div>

              <div className={styles.inputGroup}>
                <fieldset>
                  <legend className={styles.inputLabel}>Gender</legend>
                  <div className={styles.radioGroup}>
                    <label className={`${styles.radioOption} ${gender === 'male' ? styles.radioOptionChecked : ''}`}>
                      <input
                        id="onboarding-gender-male"
                        name="gender"
                        type="radio"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      />
                      <span>Male</span>
                    </label>
                    <label className={`${styles.radioOption} ${gender === 'female' ? styles.radioOptionChecked : ''}`}>
                      <input
                        id="onboarding-gender-female"
                        name="gender"
                        type="radio"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                </fieldset>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="onboarding-birthday" className={styles.inputLabel}>Birthday</label>
                <input
                  id="onboarding-birthday"
                  name="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setBirthday(selectedDate);
                    // Clear error when user selects a date
                    if (error && error.includes('13 years old')) {
                      setError(null);
                    }
                  }}
                  onBlur={(e) => {
                    // Validate on blur
                    const selectedDate = e.target.value;
                    if (selectedDate && selectedDate > maxDate) {
                      setError('You must be at least 13 years old to create an account');
                      setBirthday('');
                    }
                  }}
                  className={styles.input}
                  max={maxDate}
                  autoComplete="bday"
                />
                <p className={styles.inputHint}>
                  You must be at least 13 years old
                </p>
              </div>
            </div>

            {error && currentStep === 'account' && <p className={styles.error}>{error}</p>}

            <button 
              className={styles.primaryButton}
              onClick={handleNextStep}
              disabled={!isAccountStepValid || isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Avatar selection moved to homepage */}
        {false && currentStep === 'avatar' && (
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

            <div className={styles.avatarGrid} role="radiogroup" aria-label="Select your avatar">
              {avatarChoices.map((avatar, index) => (
                <button
                  key={avatar.id}
                  id={`avatar-option-${index}`}
                  name="avatar-selection"
                  type="button"
                  className={`${styles.avatarOption} ${selectedAvatar?.id === avatar.id ? styles.avatarSelected : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                  aria-label={`Select avatar ${index + 1}`}
                  aria-pressed={selectedAvatar?.id === avatar.id}
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

            {error && currentStep === 'avatar' && <p className={styles.error}>{error}</p>}

            <div className={styles.buttonRow}>
              <button className={styles.secondaryButton} onClick={handlePrevStep}>
                Back
              </button>
              <button 
                className={styles.primaryButton}
                onClick={handleNextStep}
                disabled={!selectedAvatar || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}


        {/* Complete step removed - redirecting directly to home */}
      </div>
    </div>
  );
};

export default OnboardingModal;

