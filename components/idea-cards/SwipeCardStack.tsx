'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SwipeCard from './SwipeCard';
import type { IdeaCard, SwipeDirection, SwipeAction } from './types';
import styles from './SwipeCardStack.module.css';

interface SwipeCardStackProps {
  cards: IdeaCard[];
  onSwipe?: (action: SwipeAction) => void;
  onComplete?: (actions: SwipeAction[]) => void;
  hasExpertAccess?: boolean;
  onExpertClick?: () => void;
}

export const SwipeCardStack: React.FC<SwipeCardStackProps> = ({
  cards,
  onSwipe,
  onComplete,
  hasExpertAccess = false,
  onExpertClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actions, setActions] = useState<SwipeAction[]>([]);
  const [exitDirection, setExitDirection] = useState<SwipeDirection>(null);

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];
  const isComplete = currentIndex >= cards.length;

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (!currentCard || !direction) return;

    const action: SwipeAction = {
      cardId: currentCard.id,
      direction,
      timestamp: Date.now(),
    };

    setExitDirection(direction);
    setActions(prev => [...prev, action]);
    
    if (onSwipe) {
      onSwipe(action);
    }

    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setExitDirection(null);
    }, 200);
  }, [currentCard, onSwipe]);

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handleSwipe('left');
          break;
        case 'ArrowRight':
          handleSwipe('right');
          break;
        case 'ArrowUp':
          handleSwipe('up');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, isComplete]);

  // Call onComplete when all cards are swiped
  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete(actions);
    }
  }, [isComplete, actions, onComplete]);

  const getExitAnimation = (direction: SwipeDirection) => {
    switch (direction) {
      case 'left':
        return { x: -500, opacity: 0, rotate: -30 };
      case 'right':
        return { x: 500, opacity: 0, rotate: 30 };
      case 'up':
        return { y: -500, opacity: 0 };
      default:
        return {};
    }
  };

  // Stats
  const learned = actions.filter(a => a.direction === 'right').length;
  const saved = actions.filter(a => a.direction === 'up').length;
  const skipped = actions.filter(a => a.direction === 'left').length;

  if (isComplete) {
    return (
      <div className={styles.completeContainer}>
        <motion.div 
          className={styles.completeCard}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className={styles.completeIcon}>🎉</div>
          <h2 className={styles.completeTitle}>Session Complete!</h2>
          <p className={styles.completeText}>
            You&apos;ve reviewed all {cards.length} ideas in this session.
          </p>
          
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{learned}</span>
              <span className={styles.statLabel}>Learned</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{saved}</span>
              <span className={styles.statLabel}>Saved</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{skipped}</span>
              <span className={styles.statLabel}>Skipped</span>
            </div>
          </div>

          <button 
            className={styles.continueButton}
            onClick={() => {
              setCurrentIndex(0);
              setActions([]);
            }}
            type="button"
          >
            Start Over
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.stackContainer}>
      {/* Progress */}
      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(currentIndex / cards.length) * 100}%` }}
          />
        </div>
        <span className={styles.progressText}>
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Card Stack */}
      <div className={styles.cardStack}>
        <AnimatePresence mode="popLayout">
          {/* Next card (background) */}
          {nextCard && (
            <SwipeCard
              key={nextCard.id}
              card={nextCard}
              onSwipe={() => {}}
              isTop={false}
              hasExpertAccess={hasExpertAccess}
            />
          )}

          {/* Current card (top) */}
          {currentCard && (
            <motion.div
              key={currentCard.id}
              exit={getExitAnimation(exitDirection)}
              transition={{ duration: 0.2 }}
              className={styles.topCard}
            >
              <SwipeCard
                card={currentCard}
                onSwipe={handleSwipe}
                isTop={true}
                hasExpertAccess={hasExpertAccess}
                onExpertClick={onExpertClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button 
          className={`${styles.actionButton} ${styles.skipButton}`}
          onClick={() => handleSwipe('left')}
          aria-label="Skip"
          type="button"
        >
          <span className={styles.actionIcon}>✕</span>
        </button>
        <button 
          className={`${styles.actionButton} ${styles.saveButton}`}
          onClick={() => handleSwipe('up')}
          aria-label="Save"
          type="button"
        >
          <span className={styles.actionIcon}>★</span>
        </button>
        <button 
          className={`${styles.actionButton} ${styles.learnButton}`}
          onClick={() => handleSwipe('right')}
          aria-label="Learn"
          type="button"
        >
          <span className={styles.actionIcon}>✓</span>
        </button>
      </div>
    </div>
  );
};

export default SwipeCardStack;
