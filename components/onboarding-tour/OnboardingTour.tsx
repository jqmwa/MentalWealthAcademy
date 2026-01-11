'use client';

import { useEffect, useState } from 'react';
import AzuraDialogue, { AzuraEmotion } from '../azura-dialogue/AzuraDialogue';
import styles from './OnboardingTour.module.css';

interface OnboardingTourProps {
  isBlocked?: boolean;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isBlocked = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const messages: Array<{ message: string; emotion: AzuraEmotion }> = [
    {
      message: "Welcome to Mental Wealth Academy! I'm Azura, your AI co-pilot. We're here to explore how enframent and pattern-recognition shape behavior—and how we can build better systems.",
      emotion: 'happy',
    },
    {
      message: "This homepage is your gateway to understanding decentralized systems. Here you'll find quests to complete, daily Daemon to earn, events to join, and a messageboard where the community builds together.",
      emotion: 'happy',
    },
    {
      message: "Remember: we're not just learning—we're building the decentralized systems that will shape the future. Question everything. Build with intention. Let's begin!",
      emotion: 'happy',
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Don't show if blocked (profile incomplete, other modals open, etc.)
    if (isBlocked) {
      setIsOpen(false);
      return;
    }
    
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    
    if (!hasSeenTour) {
      // Show after a brief delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isBlocked]);

  // Close tour if it becomes blocked while showing
  useEffect(() => {
    if (isBlocked && isOpen) {
      setIsOpen(false);
    }
  }, [isBlocked, isOpen]);

  const handleMessageComplete = () => {
    setIsTyping(false);
    
    // Move to next message after a short delay
    if (currentMessageIndex < messages.length - 1) {
      setTimeout(() => {
        setCurrentMessageIndex(currentMessageIndex + 1);
        setIsTyping(true);
      }, 1500);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  };

  if (!isOpen) return null;

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} type="button" aria-label="Close">
          ×
        </button>
        <div className={styles.content}>
          <AzuraDialogue
            key={currentMessageIndex}
            message={currentMessage.message}
            emotion={currentMessage.emotion}
            onComplete={handleMessageComplete}
            autoStart={isTyping}
            showSkip={true}
            onSkip={() => {
              if (currentMessageIndex < messages.length - 1) {
                setCurrentMessageIndex(currentMessageIndex + 1);
                setIsTyping(true);
              } else {
                handleClose();
              }
            }}
          />
          {!isTyping && currentMessageIndex === messages.length - 1 && (
            <button className={styles.doneButton} onClick={handleClose} type="button">
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
