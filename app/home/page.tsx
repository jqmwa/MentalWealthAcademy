'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import Hero from '@/components/hero/Hero';
import Banner from '@/components/banner/Banner';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import BannerCard from '@/components/banner-card/BannerCard';
import PromptLibraryCard from '@/components/prompt-library-card/PromptLibraryCard';
import Quests from '@/components/quests/Quests';
import BookCard from '@/components/book-card/BookCard';
import OnboardingTour from '@/components/onboarding-tour/OnboardingTour';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import EventCard from '@/components/event-card/EventCard';
import styles from './page.module.css';

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for Privy to be ready before checking authentication
    // Add a small delay to ensure authentication state is stable
    if (ready && !authenticated && !isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        router.push('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authenticated, ready, router, isRedirecting]);

  // Show loading state while checking authentication
  if (!ready) {
    return (
      <main className={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  // Redirect if not authenticated (this will be handled by useEffect)
  if (!authenticated) {
    return null;
  }

  return (
    <main className={styles.main}>
      <OnboardingTour />
      <Navbar />
      <Banner />
      <div className={styles.content}>
        <div className={styles.middleSection}>
          <div data-intro="quests">
            <Quests />
          </div>
          <div data-intro="banner-card">
            <BannerCard />
          </div>
          <div className={styles.eventsAndPromptRow}>
          <div className={styles.eventsSection} data-intro="events">
            <h1 className={styles.sectionTitle}>Events</h1>
            <EventCard
              imageUrl="/uploads/task_01kd2j4dbvebba56djx7072mtz_1766391492_img_0 2.png"
              heading="Week 1: Self-Mastery"
              badge1Text="Workshop"
              badge2Text="Dec 15"
              description="Join us for an immersive workshop focused on self-mastery and personal development. Learn essential skills and connect with like-minded individuals."
              onRegister={() => console.log('Register clicked')}
              onSecondaryAction={() => console.log('Learn more clicked')}
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
    </main>
  );
}

