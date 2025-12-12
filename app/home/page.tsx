'use client';

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
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <OnboardingTour />
      <Navbar />
      <Banner />
      <div className={styles.content}>
        <div data-intro="side-navigation">
          <SideNavigation />
        </div>
        <div className={styles.middleSection}>
          <div className={styles.daemonTerminalWrap}>
            <DaemonTerminal />
          </div>
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
      </div>
      <Footer />
    </main>
  );
}

