'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Hero from '@/components/hero/Hero';
import Banner from '@/components/banner/Banner';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import AzuraFaucet from '@/components/azurafaucet/AzuraFaucet';
import PromptLibraryCard from '@/components/prompt-library-card/PromptLibraryCard';
import Quests from '@/components/quests/Quests';
import BookCard from '@/components/book-card/BookCard';
import OnboardingTour from '@/components/onboarding-tour/OnboardingTour';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import EventCard from '@/components/event-card/EventCard';
import AvatarSelectionModal from '@/components/avatar-selection/AvatarSelectionModal';
import { ShardAnimation } from '@/components/quests/ShardAnimation';
import { ConfettiCelebration } from '@/components/quests/ConfettiCelebration';
import styles from './page.module.css';

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [me, setMe] = useState<{ avatarUrl: string | null; shardCount?: number; eventReservations?: string[] } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardData, setRewardData] = useState<{ shards: number; startingShards: number } | null>(null);
  const [isReserving, setIsReserving] = useState(false);

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
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        const data = await response.json();
        if (data.user) {
          setHasValidSession(true);
          setMe(data.user);
          // Show avatar modal if user has no avatar
          if (!data.user.avatarUrl) {
            setShowAvatarModal(true);
          }
        } else {
          setHasValidSession(false);
        }
      } catch (err) {
        console.error('Failed to check authentication:', err);
        setHasValidSession(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch user data when wallet connection state changes
  useEffect(() => {
    if (isConnected && hasValidSession) {
      fetch('/api/me', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setMe(data.user);
            // Show avatar modal if user has no avatar
            if (!data.user.avatarUrl) {
              setShowAvatarModal(true);
            }
          }
        })
        .catch(err => console.error('Failed to fetch user data:', err));
    }
  }, [isConnected, hasValidSession]);

  // Listen for profile updates to refresh avatar status
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetch('/api/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setMe(data.user);
            // Close modal if avatar was selected
            if (data.user.avatarUrl) {
              setShowAvatarModal(false);
            }
          }
        })
        .catch(err => console.error('Failed to fetch user data:', err));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    // Redirect if we've finished checking auth and user has no valid session
    // This works for both Privy auth and session-based auth
    if (!isCheckingAuth && !hasValidSession && !isRedirecting) {
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
  if (!hasValidSession) {
    return null;
  }

  return (
    <main className={styles.main}>
      <AvatarSelectionModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onAvatarSelected={() => {
          // Refresh user data after avatar selection
          fetch('/api/me')
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
          <div data-intro="quests">
            <Quests />
          </div>
          <div data-intro="azurafaucet">
            <AzuraFaucet />
          </div>
          <div className={styles.eventsAndPromptRow}>
          <div className={styles.eventsSection} data-intro="events">
            <h1 className={styles.sectionTitle}>Events</h1>
            <EventCard
              heading="Crypto Clarity"
              badge1Text="Workshop"
              badge2Text="Jan 4"
              description="Institutions aren't speculating anymore. They're building. The question is: do you understand what's happening, or are you still watching from the sidelines?"
              onRegister={() => console.log('Register clicked')}
              eventDetails={{
                date: 'Sunday, January 4th, 2026',
                time: '7:00pm EST',
                description: "Institutions aren't speculating anymore. They're building. The question is: do you understand what's happening, or are you still watching from the sidelines?",
              }}
              onReserveSeat={async () => {
                setIsReserving(true);
                try {
                  const response = await fetch('/api/events/reserve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventSlug: 'crypto-clarity-2026-01-04' }),
                  });
                  const data = await response.json();
                  if (data.ok) {
                    // Refresh user data to update reservation status
                    const meResponse = await fetch('/api/me', { cache: 'no-store' });
                    const meData = await meResponse.json();
                    if (meData.user) {
                      setMe(meData.user);
                    }
                    // Optionally show success message
                    alert('Seat reserved successfully!');
                  } else {
                    alert(data.error || 'Failed to reserve seat');
                  }
                } catch (error) {
                  console.error('Failed to reserve seat:', error);
                  alert('Failed to reserve seat. Please try again.');
                } finally {
                  setIsReserving(false);
                }
              }}
              isReserved={me?.eventReservations?.includes('crypto-clarity-2026-01-04')}
              isReserving={isReserving}
            />
          </div>
          <div className={styles.promptSection}>
              <h1 className={styles.sectionTitle}>Messageboard</h1>
              <PromptLibraryCard />
              <div data-intro="farcaster-friends">
                <BookCard />
              </div>
            </div>
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

