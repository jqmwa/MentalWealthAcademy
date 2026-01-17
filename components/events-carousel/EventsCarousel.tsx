'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './EventsCarousel.module.css';

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  category: string;
  imageUrl?: string;
  emoji?: string;
  gradient?: string;
}

// Mental Wealth Pathway Events - 12 events
const mentalWealthEvents: EventData[] = [
  {
    id: '1',
    title: 'Introduction to Mental Wealth',
    date: 'January 20, 2026',
    time: '10:00 AM PST',
    description: 'Discover the foundations of mental wealth and how to build a sustainable practice for lifelong wellbeing.',
    category: 'Foundation',
    emoji: '💎',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #00a4e6 50%, #5ba3d0 100%)',
  },
  {
    id: '2',
    title: 'Mindfulness & Meditation Basics',
    date: 'January 27, 2026',
    time: '10:00 AM PST',
    description: 'Learn practical meditation techniques and mindfulness exercises you can incorporate into your daily routine.',
    category: 'Practice',
    emoji: '🌀',
    gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c471ed 50%, #ff00ff 100%)',
  },
  {
    id: '3',
    title: 'Emotional Intelligence Workshop',
    date: 'February 3, 2026',
    time: '10:00 AM PST',
    description: 'Develop your EQ skills to better understand, manage, and express your emotions effectively.',
    category: 'Skills',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #00d4ff 0%, #00ffff 50%, #5ba3d0 100%)',
  },
  {
    id: '4',
    title: 'Stress Management Strategies',
    date: 'February 10, 2026',
    time: '10:00 AM PST',
    description: 'Evidence-based techniques to identify, manage, and reduce stress in your personal and professional life.',
    category: 'Wellness',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg, #0099cc 0%, #00ccff 50%, #66d9ff 100%)',
  },
  {
    id: '5',
    title: 'Building Resilience',
    date: 'February 17, 2026',
    time: '10:00 AM PST',
    description: 'Learn how to bounce back from setbacks and develop mental toughness for life\'s challenges.',
    category: 'Growth',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, #ff00ff 0%, #ff6b9d 50%, #ff1493 100%)',
  },
  {
    id: '6',
    title: 'Healthy Relationships & Boundaries',
    date: 'February 24, 2026',
    time: '10:00 AM PST',
    description: 'Navigate interpersonal dynamics and set healthy boundaries for better mental health.',
    category: 'Relationships',
    emoji: '💫',
    gradient: 'linear-gradient(135deg, #c471ed 0%, #f64f59 50%, #ff00ff 100%)',
  },
  {
    id: '7',
    title: 'Sleep & Recovery Optimization',
    date: 'March 3, 2026',
    time: '10:00 AM PST',
    description: 'Understand the science of sleep and learn techniques to improve your rest and recovery.',
    category: 'Wellness',
    emoji: '🌙',
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #5ba3d0 100%)',
  },
  {
    id: '8',
    title: 'Nutrition for Mental Health',
    date: 'March 10, 2026',
    time: '10:00 AM PST',
    description: 'Explore the gut-brain connection and learn which foods support optimal mental function.',
    category: 'Nutrition',
    emoji: '🍑',
    gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ff8c9e 50%, #ffb3c1 100%)',
  },
  {
    id: '9',
    title: 'Movement & Exercise for Mind',
    date: 'March 17, 2026',
    time: '10:00 AM PST',
    description: 'Discover how physical activity impacts mental health and create a sustainable movement practice.',
    category: 'Fitness',
    emoji: '⚡',
    gradient: 'linear-gradient(135deg, #00ccff 0%, #00ffff 50%, #5ba3d0 100%)',
  },
  {
    id: '10',
    title: 'Digital Wellness & Tech Balance',
    date: 'March 24, 2026',
    time: '10:00 AM PST',
    description: 'Develop a healthy relationship with technology and learn to manage digital overwhelm.',
    category: 'Balance',
    emoji: '💿',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #00a4e6 50%, #00d4ff 100%)',
  },
  {
    id: '11',
    title: 'Purpose & Meaning Discovery',
    date: 'March 31, 2026',
    time: '10:00 AM PST',
    description: 'Explore what gives your life meaning and align your daily actions with your core values.',
    category: 'Purpose',
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #ff00ff 0%, #c471ed 50%, #5ba3d0 100%)',
  },
  {
    id: '12',
    title: 'Creating Your Mental Wealth Plan',
    date: 'April 7, 2026',
    time: '10:00 AM PST',
    description: 'Integrate everything you\'ve learned into a personalized, sustainable mental wealth action plan.',
    category: 'Integration',
    emoji: '🌈',
    gradient: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #5ba3d0 100%)',
  },
];

interface EventsCarouselProps {
  title?: string;
  events?: EventData[];
  onRegister?: (eventId: string) => void;
  onLearnMore?: (eventId: string) => void;
}

export const EventsCarousel: React.FC<EventsCarouselProps> = ({
  title = 'Mental Wealth Pathway',
  events = mentalWealthEvents,
  onRegister,
  onLearnMore,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      track.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => track.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  const scrollToIndex = (index: number) => {
    if (trackRef.current) {
      const slideWidth = trackRef.current.children[0]?.clientWidth || 280;
      const gap = 16;
      trackRef.current.scrollTo({
        left: index * (slideWidth + gap),
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const scrollLeft = () => {
    if (trackRef.current) {
      const slideWidth = trackRef.current.children[0]?.clientWidth || 280;
      const gap = 16;
      const newScroll = trackRef.current.scrollLeft - (slideWidth + gap);
      trackRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      const slideWidth = trackRef.current.children[0]?.clientWidth || 280;
      const gap = 16;
      const newScroll = trackRef.current.scrollLeft + (slideWidth + gap);
      trackRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const slideWidth = trackRef.current.children[0]?.clientWidth || 280;
      const gap = 16;
      const newIndex = Math.round(trackRef.current.scrollLeft / (slideWidth + gap));
      setActiveIndex(newIndex);
      updateScrollButtons();
    }
  };

  // Create dot indicators (show max 6 dots for better UX)
  const maxDots = 6;
  const totalSlides = events.length;
  const dotsToShow = Math.min(maxDots, totalSlides);

  return (
    <div className={styles.carouselSection}>
      <div className={styles.carouselContainer}>
        <div className={styles.carouselNav}>
          <button
            className={styles.navButton}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Previous events"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className={styles.navButton}
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Next events"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div
          ref={trackRef}
          className={styles.carouselTrack}
          onScroll={handleScroll}
        >
          {events.map((event) => (
            <div key={event.id} className={styles.carouselSlide}>
              <div className={styles.carouselCard}>
                <div
                  className={styles.cardImageBox}
                  style={{ background: event.gradient }}
                >
                  {event.imageUrl ? (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className={styles.cardImage}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span className={styles.cardImagePlaceholder}>{event.emoji}</span>
                  )}
                  <span className={styles.cardBadge}>{event.category}</span>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <div className={styles.cardMeta}>
                    <p className={styles.cardDate}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {event.date}
                    </p>
                    <p className={styles.cardTime}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {event.time}
                    </p>
                  </div>
                  <p className={styles.cardDescription}>{event.description}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.cardButton} ${styles.cardButtonPrimary}`}
                      onClick={() => onRegister?.(event.id)}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EventsCarousel;
