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
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <OnboardingTour />
      <Navbar />
      <Hero />
      <Banner />
      <div className={styles.content}>
        <div data-intro="side-navigation">
          <SideNavigation />
        </div>
        <div className={styles.middleSection}>
          <div data-intro="quests">
            <Quests />
          </div>
          <div data-intro="banner-card">
            <BannerCard />
          </div>
          <div className={styles.eventsAndPromptRow}>
          <div className={styles.eventsSection}>
            <h1 className={styles.sectionTitle}>Events</h1>
            <EventCard
              imageUrl="https://i.imgur.com/CBTfcoP.jpeg"
              heading="Xmas Party"
              badge1Text="Workshop"
              badge2Text="Dec 15"
              authorName="Alex Rivera"
              authorRole="Event Curator"
              authorAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
            />
          </div>
          <div className={styles.promptSection}>
              <h1 className={styles.sectionTitle}>Forum</h1>
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

