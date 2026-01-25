'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GraduationCap,
  Brain,
  UsersThree,
  Scales,
  Wallet,
  IconProps,
} from '@phosphor-icons/react';
import styles from './MobileOnboarding.module.css';

interface Screen {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
}

const screens: Screen[] = [
  {
    title: 'Welcome to the Academy',
    description:
      'A research-driven learning platform where knowledge flows freely and communities grow together.',
    icon: GraduationCap,
  },
  {
    title: 'AI-Powered Learning',
    description:
      'Adaptive content that responds to your needs. Learn at your pace with guidance that grows with you.',
    icon: Brain,
  },
  {
    title: 'Collaborative Networks',
    description:
      'Join learning communities where ideas connect and wisdom strengthens the entire network.',
    icon: UsersThree,
  },
  {
    title: 'Transparent Governance',
    description:
      'Participate in decisions. Vote on proposals and help shape the future of the Academy.',
    icon: Scales,
  },
  {
    title: 'Ready to Begin?',
    description:
      'Connect your wallet to join, or continue as a guest to explore.',
    icon: Wallet,
  },
];

const STORAGE_KEY = 'hasSeenMobileOnboarding';

interface MobileOnboardingProps {
  onComplete: () => void;
}

export const MobileOnboarding: React.FC<MobileOnboardingProps> = ({
  onComplete,
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Lock body scroll when mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const markAsComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  }, [onComplete]);

  const handleSkip = () => {
    markAsComplete();
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setDirection(1);
      setCurrentScreen((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setDirection(-1);
      setCurrentScreen((prev) => prev - 1);
    }
  };

  const handleConnectWallet = () => {
    // For now, just complete onboarding - wallet connection can be added later
    markAsComplete();
  };

  const handleContinueAsGuest = () => {
    markAsComplete();
  };

  const isLastScreen = currentScreen === screens.length - 1;
  const CurrentIcon = screens[currentScreen].icon;

  // Reduced motion: fade only. Full motion: slide + fade with bounce on forward
  const slideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({
          x: dir > 0 ? 100 : -100,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (dir: number) => ({
          x: dir < 0 ? 100 : -100,
          opacity: 0,
        }),
      };

  // Bounce easing for forward, smooth ease-out for backward
  const getTransition = () => {
    if (prefersReducedMotion) {
      return { duration: 0.15, ease: [0, 0, 0.2, 1] as const };
    }
    return {
      duration: direction > 0 ? 0.28 : 0.32,
      ease: direction > 0
        ? ([0.34, 1.56, 0.64, 1] as const)
        : ([0, 0, 0.2, 1] as const),
    };
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentScreen ? 1 : -1);
    setCurrentScreen(index);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.skipButton}
          onClick={handleSkip}
        >
          Skip
        </button>

        <div className={styles.screenWrapper}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              className={styles.screen}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={getTransition()}
            >
              <div className={styles.iconContainer}>
                <CurrentIcon size={48} weight="duotone" />
              </div>
              <h1 className={styles.title}>{screens[currentScreen].title}</h1>
              <p className={styles.description}>
                {screens[currentScreen].description}
              </p>

              {isLastScreen && (
                <div className={styles.walletActions}>
                  <button
                    type="button"
                    className={`${styles.walletButton} ${styles.connectWalletButton}`}
                    onClick={handleConnectWallet}
                  >
                    Connect Wallet
                  </button>
                  <button
                    type="button"
                    className={`${styles.walletButton} ${styles.guestButton}`}
                    onClick={handleContinueAsGuest}
                  >
                    Continue as Guest
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.progressDots}>
          {screens.map((_, index) => (
            <motion.button
              key={index}
              type="button"
              className={styles.dot}
              onClick={() => handleDotClick(index)}
              animate={{
                width: index === currentScreen ? 24 : 8,
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 500, damping: 30 }
              }
              aria-label={`Go to screen ${index + 1}`}
              aria-current={index === currentScreen ? 'step' : undefined}
            />
          ))}
        </div>

        <div
          className={`${styles.navigation} ${
            isLastScreen ? styles.navigationHidden : ''
          }`}
        >
          <button
            type="button"
            className={`${styles.navButton} ${styles.backButton}`}
            onClick={handleBack}
            disabled={currentScreen === 0}
          >
            Back
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOnboarding;
