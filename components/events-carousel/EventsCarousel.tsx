'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './EventsCarousel.module.css';

// Registration Success Toast Component
const RegistrationToast: React.FC<{
  isVisible: boolean;
  eventTitle: string;
  onClose: () => void;
}> = ({ isVisible, eventTitle, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.toastOverlay}>
      <div className={styles.toast}>
        <div className={styles.toastIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className={styles.toastContent}>
          <h4 className={styles.toastTitle}>Registration Complete!</h4>
          <p className={styles.toastMessage}>
            You&apos;re registered for <strong>{eventTitle}</strong>. We&apos;ll send you a reminder before the event.
          </p>
        </div>
        <button className={styles.toastClose} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  category: string;
  imageUrl?: string;
  color: string;
}

// Brutalist pop-color palette from design system
const POP_COLORS = [
  '#5168FF', // primary blue
  '#FF7729', // surge orange
  '#74C465', // lime green
  '#50599B', // secondary purple
  '#1A1D33', // dark
  '#F472B6', // pink pop
];

// Mental Wealth Pathway Events - 12 events
const mentalWealthEvents: EventData[] = [
  {
    id: '1',
    title: 'Introduction to Mental Wealth',
    date: 'January 20, 2026',
    time: '10:00 AM PST',
    description: 'Discover the foundations of mental wealth and how to build a sustainable practice for lifelong wellbeing.',
    category: 'Foundation',
    color: POP_COLORS[0],
  },
  {
    id: '2',
    title: 'Mindfulness & Meditation Basics',
    date: 'January 27, 2026',
    time: '10:00 AM PST',
    description: 'Learn practical meditation techniques and mindfulness exercises you can incorporate into your daily routine.',
    category: 'Practice',
    color: POP_COLORS[1],
  },
  {
    id: '3',
    title: 'Emotional Intelligence Workshop',
    date: 'February 3, 2026',
    time: '10:00 AM PST',
    description: 'Develop your EQ skills to better understand, manage, and express your emotions effectively.',
    category: 'Skills',
    color: POP_COLORS[2],
  },
  {
    id: '4',
    title: 'Stress Management Strategies',
    date: 'February 10, 2026',
    time: '10:00 AM PST',
    description: 'Evidence-based techniques to identify, manage, and reduce stress in your personal and professional life.',
    category: 'Wellness',
    color: POP_COLORS[3],
  },
  {
    id: '5',
    title: 'Building Resilience',
    date: 'February 17, 2026',
    time: '10:00 AM PST',
    description: 'Learn how to bounce back from setbacks and develop mental toughness for life\'s challenges.',
    category: 'Growth',
    color: POP_COLORS[4],
  },
  {
    id: '6',
    title: 'Healthy Relationships & Boundaries',
    date: 'February 24, 2026',
    time: '10:00 AM PST',
    description: 'Navigate interpersonal dynamics and set healthy boundaries for better mental health.',
    category: 'Relationships',
    color: POP_COLORS[5],
  },
  {
    id: '7',
    title: 'Sleep & Recovery Optimization',
    date: 'March 3, 2026',
    time: '10:00 AM PST',
    description: 'Understand the science of sleep and learn techniques to improve your rest and recovery.',
    category: 'Wellness',
    color: POP_COLORS[0],
  },
  {
    id: '8',
    title: 'Nutrition for Mental Health',
    date: 'March 10, 2026',
    time: '10:00 AM PST',
    description: 'Explore the gut-brain connection and learn which foods support optimal mental function.',
    category: 'Nutrition',
    color: POP_COLORS[1],
  },
  {
    id: '9',
    title: 'Movement & Exercise for Mind',
    date: 'March 17, 2026',
    time: '10:00 AM PST',
    description: 'Discover how physical activity impacts mental health and create a sustainable movement practice.',
    category: 'Fitness',
    color: POP_COLORS[2],
  },
  {
    id: '10',
    title: 'Digital Wellness & Tech Balance',
    date: 'March 24, 2026',
    time: '10:00 AM PST',
    description: 'Develop a healthy relationship with technology and learn to manage digital overwhelm.',
    category: 'Balance',
    color: POP_COLORS[3],
  },
  {
    id: '11',
    title: 'Purpose & Meaning Discovery',
    date: 'March 31, 2026',
    time: '10:00 AM PST',
    description: 'Explore what gives your life meaning and align your daily actions with your core values.',
    category: 'Purpose',
    color: POP_COLORS[4],
  },
  {
    id: '12',
    title: 'Creating Your Mental Wealth Plan',
    date: 'April 7, 2026',
    time: '10:00 AM PST',
    description: 'Integrate everything you\'ve learned into a personalized, sustainable mental wealth action plan.',
    category: 'Integration',
    color: POP_COLORS[5],
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
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastEventTitle, setToastEventTitle] = useState('');

  const handleRegister = useCallback((eventId: string, eventTitle: string) => {
    // If already registered, do nothing
    if (registeredEvents.has(eventId)) return;

    // Mark as registered
    setRegisteredEvents(prev => new Set(prev).add(eventId));

    // Show success toast
    setToastEventTitle(eventTitle);
    setShowToast(true);

    // Call external handler if provided
    onRegister?.(eventId);
  }, [registeredEvents, onRegister]);

  const closeToast = useCallback(() => {
    setShowToast(false);
  }, []);

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
                  style={{ background: event.color }}
                >
                  {event.imageUrl && (
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className={styles.cardImage}
                      style={{ objectFit: 'cover' }}
                    />
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
                      className={`${styles.cardButton} ${registeredEvents.has(event.id) ? styles.cardButtonRegistered : styles.cardButtonPrimary}`}
                      onClick={() => handleRegister(event.id, event.title)}
                      disabled={registeredEvents.has(event.id)}
                    >
                      {registeredEvents.has(event.id) ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Registered
                        </>
                      ) : (
                        'Register'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Success Toast */}
      <RegistrationToast
        isVisible={showToast}
        eventTitle={toastEventTitle}
        onClose={closeToast}
      />
    </div>
  );
};

export default EventsCarousel;
