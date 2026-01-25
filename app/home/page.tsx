'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import OnboardingTour from '@/components/onboarding-tour/OnboardingTour';
import Navbar from '@/components/navbar/Navbar';
import AvatarSelectionModal from '@/components/avatar-selection/AvatarSelectionModal';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { ShardAnimation } from '@/components/quests/ShardAnimation';
import { ConfettiCelebration } from '@/components/quests/ConfettiCelebration';
import PencilLoader from '@/components/landing/PencilLoader';
import { CalendarDays } from '@/components/calendar-days/CalendarDays';
import { CheckinCard } from '@/components/checkin-card/CheckinCard';
import { EventsCarousel } from '@/components/events-carousel/EventsCarousel';
import Surveys from '@/components/survey/Surveys';
import AngelMintSection from '@/components/angel-mint-section/AngelMintSection';
import MintModal from '@/components/mint-modal/MintModal';
import { useBaseKitAutoSignin } from '@/components/miniapp/useBaseKitAutoSignin';
import styles from './page.module.css';

export default function Home() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { isBaseKit, walletAddress } = useBaseKitAutoSignin();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [me, setMe] = useState<{ avatarUrl: string | null; username?: string | null; shardCount?: number; eventReservations?: string[] } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardData, setRewardData] = useState<{ shards: number; startingShards: number } | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const hasCheckedAuthRef = useRef(false);

  // Handle X auth callback and auto quest completion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const xAuth = params.get('x_auth');
    const autoCheck = params.get('auto_check');
    const onboardingParam = params.get('onboarding');
    
    // Check for onboarding query parameter
    if (onboardingParam === 'true') {
      // Remove query param from URL
      window.history.replaceState({}, '', '/home');
      // Open onboarding modal
      setShowOnboarding(true);
    }
    
    if (xAuth) {
      // Remove query params from URL
      window.history.replaceState({}, '', '/home');
      // Trigger refresh of X account status
      if (xAuth === 'success') {
        // Dispatch event to refresh X account status in modals
        window.dispatchEvent(new Event('xAccountUpdated'));
        
        // If auto_check is enabled, check and complete quest automatically
        if (autoCheck === 'true') {
          const autoCompleteQuest = async () => {
            try {
              // Get current shard count before check
              const meResponse = await fetch('/api/me', { cache: 'no-store' });
              const meData = await meResponse.json();
              const startingShards = meData?.user?.shardCount ?? 0;
              
              // Check and auto-complete quest
              const response = await fetch('/api/quests/auto-complete-twitter-quest', {
                method: 'POST',
                cache: 'no-store',
              });
              
              const data = await response.json();
              
              if (data.ok && data.shardsAwarded > 0) {
                // Show reward animation
                setRewardData({
                  shards: data.shardsAwarded,
                  startingShards: data.startingShards || startingShards,
                });
                setShowRewardAnimation(true);
                
                // Refresh shard count in navbar
                window.dispatchEvent(new Event('shardsUpdated'));
                
                // Close animation after completion
                setTimeout(() => {
                  setShowRewardAnimation(false);
                  setRewardData(null);
                }, 5000);
              }
            } catch (error) {
              console.error('Failed to auto-complete quest:', error);
            }
          };
          
          // Small delay to ensure X account is saved
          setTimeout(() => {
            autoCompleteQuest();
          }, 1000);
        } else {
          // Just reload if no auto check
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    }
  }, []);

  // Check authentication via /api/me (supports both Privy and session-based auth)
  useEffect(() => {
    // Only check if we haven't checked yet
    // Don't re-check just because wallet address changed - session cookie is sufficient
    if (hasCheckedAuthRef.current) {
      return;
    }
    
    let isMounted = true;
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        // FIRST: Try session-based auth (no wallet signature needed)
        // This works if user just logged in from landing page
        const response = await fetch('/api/me', { 
          cache: 'no-store',
          credentials: 'include', // Include session cookie
        });
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (data.user) {
          setHasValidSession(true);
          setMe(data.user);
          hasCheckedAuthRef.current = true;
          
          // Check if user needs onboarding (incomplete profile)
          // Session cookie will be included automatically
          try {
            const profileResponse = await fetch('/api/profile', {
              cache: 'no-store',
              credentials: 'include',
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const userProfile = profileData.user;
              
              // Check if profile is incomplete
              // Username is incomplete if it starts with "user_" (temporary username)
              const hasUsername = userProfile.username &&
                !userProfile.username.startsWith('user_');

              // Only require username for onboarding - birthday/gender are optional profile fields
              const needsOnboarding = !hasUsername;
              
              // Skip onboarding for BaseKit users with complete profiles
              // BaseKit users are auto-signed in, so if they have a complete profile, skip onboarding
              const isBaseKitUserWithCompleteProfile = isBaseKit && !needsOnboarding;
              
              if (needsOnboarding && !isBaseKitUserWithCompleteProfile) {
                // Show onboarding modal first (unless BaseKit user with complete profile)
                setShowOnboarding(true);
              } else if (!data.user.avatarUrl) {
                // Profile is complete but no avatar - show avatar selection
                setShowAvatarModal(true);
              }
            } else {
              // If profile fetch fails, check avatar anyway
              if (!data.user.avatarUrl) {
                setShowAvatarModal(true);
              }
            }
          } catch (profileError) {
            console.error('Failed to fetch profile:', profileError);
            // If profile fetch fails, check avatar anyway
            if (!data.user.avatarUrl) {
              setShowAvatarModal(true);
            }
          }
        } else {
          // No session - redirect to login
          setHasValidSession(false);
        }
      } catch (err) {
        console.error('Failed to check authentication:', err);
        if (isMounted) {
          setHasValidSession(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - session cookie handles auth

  // Listen for profile updates to refresh avatar status and check onboarding
  useEffect(() => {
    const handleProfileUpdate = async () => {
      // Use session-based auth - no wallet signature needed
      try {
        const meResponse = await fetch('/api/me', { 
          cache: 'no-store',
          credentials: 'include',
        });
        const meData = await meResponse.json();
        
        if (meData.user) {
          setMe(meData.user);
          
          // Check if onboarding was just completed
          if (showOnboarding) {
            // Fetch full profile to check if it's now complete
            const profileResponse = await fetch('/api/profile', {
              cache: 'no-store',
              credentials: 'include',
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const userProfile = profileData.user;
              
              const hasUsername = userProfile.username &&
                !userProfile.username.startsWith('user_');

              // Only require username for onboarding - birthday/gender are optional
              const needsOnboarding = !hasUsername;

              if (!needsOnboarding) {
                // Onboarding complete - close onboarding modal and show avatar selection if needed
                setShowOnboarding(false);
                if (!meData.user.avatarUrl) {
                  setShowAvatarModal(true);
                }
              }
            }
          } else {
            // Close avatar modal if avatar was selected
            if (meData.user.avatarUrl) {
              setShowAvatarModal(false);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [showOnboarding]);

  // Listen for openOnboarding event from navbar or other components
  useEffect(() => {
    const handleOpenOnboarding = () => {
      setShowOnboarding(true);
    };

    window.addEventListener('openOnboarding', handleOpenOnboarding);
    return () => window.removeEventListener('openOnboarding', handleOpenOnboarding);
  }, []);

  useEffect(() => {
    // Redirect if we've finished checking auth and user has no valid session
    // This works for both Privy auth and session-based auth
    // Only redirect if we've actually checked auth (not on initial mount)
    if (hasCheckedAuthRef.current && !isCheckingAuth && !hasValidSession && !isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        router.push('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCheckingAuth, hasValidSession, router, isRedirecting]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <>
        <PencilLoader hidden={false} />
        <main className={styles.main} style={{ visibility: 'hidden' }}></main>
      </>
    );
  }

  // Redirect if not authenticated (this will be handled by useEffect)
  // Show loading state while redirecting instead of returning null
  if (!hasValidSession && hasCheckedAuthRef.current) {
    return (
      <>
        <PencilLoader hidden={false} />
        <main className={styles.main} style={{ visibility: 'hidden' }}></main>
      </>
    );
  }

  return (
    <main className={styles.main}>
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        isWalletSignup={isConnected && !!address}
      />
      <AvatarSelectionModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onAvatarSelected={async () => {
          // Refresh user data after avatar selection - use session auth
          fetch('/api/me', { 
            cache: 'no-store',
            credentials: 'include',
          })
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setMe(data.user);
              }
            })
            .catch(err => console.error('Failed to fetch user data:', err));
        }}
      />
      <OnboardingTour
        isBlocked={showOnboarding || showAvatarModal || !me?.username || me?.username?.startsWith('user_')}
      />
      <Navbar />
      <div className={styles.content}>
        {me?.username && !me.username.startsWith('user_') && (
          <h1 className={styles.welcomeHeading}>Welcome {me.username}</h1>
        )}
        <CalendarDays />
        <CheckinCard />
        <div className={styles.eventsAndSurveysRow}>
          <EventsCarousel />
          <Surveys />
        </div>
      </div>
      <AngelMintSection onOpenMintModal={() => setShowMintModal(true)} />
      <MintModal isOpen={showMintModal} onClose={() => setShowMintModal(false)} />
      {showRewardAnimation && rewardData && (
        <>
          <ConfettiCelebration trigger={true} />
          <ShardAnimation 
            shards={rewardData.shards} 
            startingShards={rewardData.startingShards}
            onComplete={() => setShowRewardAnimation(false)}
          />
        </>
      )}
    </main>
  );
}

