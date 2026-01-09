'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import Hero from '@/components/hero/Hero';
import Banner from '@/components/banner/Banner';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import MessageboardCard from '@/components/messageboard-card/MessageboardCard';
import Quests from '@/components/quests/Quests';
import BookCard from '@/components/book-card/BookCard';
import OnboardingTour from '@/components/onboarding-tour/OnboardingTour';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import AvatarSelectionModal from '@/components/avatar-selection/AvatarSelectionModal';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { ShardAnimation } from '@/components/quests/ShardAnimation';
import { ConfettiCelebration } from '@/components/quests/ConfettiCelebration';
import ImpactSnapshot from '@/components/impact-snapshot/ImpactSnapshot';
import styles from './page.module.css';

export default function Home() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [me, setMe] = useState<{ avatarUrl: string | null; username?: string | null; shardCount?: number; eventReservations?: string[] } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardData, setRewardData] = useState<{ shards: number; startingShards: number } | null>(null);
  const hasCheckedAuthRef = useRef(false);
  const lastCheckedAddressRef = useRef<string | undefined>(undefined);

  // Handle X auth callback and auto quest completion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const xAuth = params.get('x_auth');
    const autoCheck = params.get('auto_check');
    
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
    // Only check if we haven't checked yet, or if wallet address changed
    const shouldCheck = !hasCheckedAuthRef.current || 
      (isConnected && address && address !== lastCheckedAddressRef.current);
    
    if (!shouldCheck) return;
    
    let isMounted = true;
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        // Include wallet auth headers if wallet is connected
        const headers: HeadersInit = {};
        if (isConnected && address) {
          Object.assign(headers, getWalletAuthHeaders(address));
          lastCheckedAddressRef.current = address;
        }
        
        const response = await fetch('/api/me', { 
          cache: 'no-store',
          headers
        });
        const data = await response.json();
        
        if (!isMounted) return;
        
        if (data.user) {
          setHasValidSession(true);
          setMe(data.user);
          hasCheckedAuthRef.current = true;
          
          // Check if user needs onboarding (incomplete profile)
          // Fetch full profile to check for username, birthday, gender
          const profileHeaders: HeadersInit = {};
          if (isConnected && address) {
            Object.assign(profileHeaders, getWalletAuthHeaders(address));
          }
          
          try {
            const profileResponse = await fetch('/api/profile', {
              cache: 'no-store',
              headers: profileHeaders
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const userProfile = profileData.user;
              
              // Check if profile is incomplete
              // Username is incomplete if it starts with "user_" (temporary username)
              const hasUsername = userProfile.username && 
                !userProfile.username.startsWith('user_');
              const hasBirthday = userProfile.birthday && userProfile.birthday !== null && userProfile.birthday !== '';
              const hasGender = userProfile.gender && userProfile.gender !== null && userProfile.gender !== '';
              
              const needsOnboarding = !hasUsername || !hasBirthday || !hasGender;
              
              if (needsOnboarding) {
                // Show onboarding modal first
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
  }, [isConnected, address]); // Re-check only when wallet connection state actually changes

  // Listen for profile updates to refresh avatar status and check onboarding
  useEffect(() => {
    const handleProfileUpdate = async () => {
      // Include wallet auth headers if wallet is connected
      const headers: HeadersInit = {};
      if (isConnected && address) {
        Object.assign(headers, getWalletAuthHeaders(address));
      }
      
      try {
        const meResponse = await fetch('/api/me', { 
          cache: 'no-store',
          headers
        });
        const meData = await meResponse.json();
        
        if (meData.user) {
          setMe(meData.user);
          
          // Check if onboarding was just completed
          if (showOnboarding) {
            // Fetch full profile to check if it's now complete
            const profileResponse = await fetch('/api/profile', {
              cache: 'no-store',
              headers
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const userProfile = profileData.user;
              
              const hasUsername = userProfile.username && 
                !userProfile.username.startsWith('user_');
              const hasBirthday = userProfile.birthday && userProfile.birthday !== null && userProfile.birthday !== '';
              const hasGender = userProfile.gender && userProfile.gender !== null && userProfile.gender !== '';
              
              const needsOnboarding = !hasUsername || !hasBirthday || !hasGender;
              
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
  }, [isConnected, address, showOnboarding]);

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
      <main className={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  // Redirect if not authenticated (this will be handled by useEffect)
  // Show loading state while redirecting instead of returning null
  if (!hasValidSession && hasCheckedAuthRef.current) {
    return (
      <main className={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Redirecting...</div>
        </div>
      </main>
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
        onAvatarSelected={() => {
          // Refresh user data after avatar selection
          const headers: HeadersInit = {};
          if (isConnected && address) {
            Object.assign(headers, getWalletAuthHeaders(address));
          }
          
          fetch('/api/me', { 
            cache: 'no-store',
            headers
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
      <OnboardingTour />
      <Navbar />
      <Banner />
      <div className={styles.content}>
        <div className={styles.middleSection}>
          <div data-intro="impact-snapshot">
            <ImpactSnapshot />
          </div>
          <div data-intro="quests">
            <Quests />
          </div>
          <div className={styles.promptSection}>
              <h1 className={styles.sectionTitle}>Messageboard</h1>
              <MessageboardCard />
              <BookCard />
            </div>
        </div>
        <div data-intro="side-navigation">
          <SideNavigation />
        </div>
      </div>
      <Footer />
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

