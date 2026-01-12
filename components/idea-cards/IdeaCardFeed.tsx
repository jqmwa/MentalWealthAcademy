'use client';

import React, { useState, useMemo, useCallback } from 'react';
import SwipeCardStack from './SwipeCardStack';
import type { IdeaCard, IdeaCategory, SwipeAction } from './types';
import styles from './IdeaCardFeed.module.css';

// Import idea cards data
import ideaCardsData from '@/data/idea-cards.json';


interface IdeaCardFeedProps {
  hasExpertAccess?: boolean;
  onExpertClick?: () => void;
  onProgress?: (learned: number, saved: number, total: number) => void;
}

export const IdeaCardFeed: React.FC<IdeaCardFeedProps> = ({
  hasExpertAccess = false,
  onExpertClick,
  onProgress,
}) => {
  const [sessionActions, setSessionActions] = useState<SwipeAction[]>([]);

  // Get all cards from data
  const allCards = useMemo(() => {
    return ideaCardsData.cards as IdeaCard[];
  }, []);

  // Shuffle cards for variety
  const shuffledCards = useMemo(() => {
    return [...allCards].sort(() => Math.random() - 0.5);
  }, [allCards]);

  const handleSwipe = useCallback((action: SwipeAction) => {
    setSessionActions(prev => [...prev, action]);
  }, []);

  const handleComplete = useCallback((actions: SwipeAction[]) => {
    const learned = actions.filter(a => a.direction === 'right').length;
    const saved = actions.filter(a => a.direction === 'up').length;
    
    if (onProgress) {
      onProgress(learned, saved, actions.length);
    }

    // TODO: Persist to database
    console.log('Session complete:', { learned, saved, total: actions.length });
  }, [onProgress]);

  return (
    <div className={styles.feedContainer}>
      {/* Card Stack */}
      <div className={styles.cardStackWrapper}>
        <SwipeCardStack
          cards={shuffledCards}
          onSwipe={handleSwipe}
          onComplete={handleComplete}
          hasExpertAccess={hasExpertAccess}
          onExpertClick={onExpertClick}
        />
      </div>

    </div>
  );
};

export default IdeaCardFeed;
