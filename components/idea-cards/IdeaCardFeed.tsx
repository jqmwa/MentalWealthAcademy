'use client';

import React, { useState, useMemo, useCallback } from 'react';
import SwipeCardStack from './SwipeCardStack';
import type { IdeaCard, IdeaCategory, SwipeAction } from './types';
import styles from './IdeaCardFeed.module.css';

// Import idea cards data
import ideaCardsData from '@/data/idea-cards.json';

type FilterCategory = IdeaCategory | 'all';

interface CategoryFilterProps {
  categories: { id: FilterCategory; name: string; color: string; count: number }[];
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className={styles.filterContainer}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.filterButton} ${activeCategory === cat.id ? styles.filterButtonActive : ''}`}
          onClick={() => onCategoryChange(cat.id)}
          style={{
            '--filter-color': cat.color,
          } as React.CSSProperties}
          type="button"
        >
          <span className={styles.filterName}>{cat.name}</span>
          <span className={styles.filterCount}>{cat.count}</span>
        </button>
      ))}
    </div>
  );
};

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
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [sessionActions, setSessionActions] = useState<SwipeAction[]>([]);

  // Get all cards from data
  const allCards = useMemo(() => {
    return ideaCardsData.cards as IdeaCard[];
  }, []);

  // Filter cards by category
  const filteredCards = useMemo(() => {
    if (activeCategory === 'all') {
      return allCards;
    }
    return allCards.filter(card => card.category === activeCategory);
  }, [allCards, activeCategory]);

  // Shuffle cards for variety
  const shuffledCards = useMemo(() => {
    return [...filteredCards].sort(() => Math.random() - 0.5);
  }, [filteredCards]);

  // Category options with counts
  const categoryOptions = useMemo(() => {
    const mentalHealthCount = allCards.filter(c => c.category === 'mental-health').length;
    const productivityCount = allCards.filter(c => c.category === 'productivity').length;
    const wealthCount = allCards.filter(c => c.category === 'wealth').length;

    return [
      { id: 'all' as FilterCategory, name: 'All', color: 'var(--color-primary)', count: allCards.length },
      { id: 'mental-health' as FilterCategory, name: 'Mental Health', color: '#9B7ED9', count: mentalHealthCount },
      { id: 'productivity' as FilterCategory, name: 'Productivity', color: '#5168FF', count: productivityCount },
      { id: 'wealth' as FilterCategory, name: 'Wealth', color: '#62BE8F', count: wealthCount },
    ];
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

  // Stats for current session
  const sessionStats = useMemo(() => {
    const learned = sessionActions.filter(a => a.direction === 'right').length;
    const saved = sessionActions.filter(a => a.direction === 'up').length;
    return { learned, saved };
  }, [sessionActions]);

  return (
    <div className={styles.feedContainer}>
      {/* Header */}
      <div className={styles.feedHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.feedTitle}>Daily Ideas</h1>
          <p className={styles.feedSubtitle}>
            Swipe through micro-insights to expand your knowledge
          </p>
        </div>
        
        {/* Session Stats */}
        <div className={styles.sessionStats}>
          <div className={styles.statBadge}>
            <span className={styles.statEmoji}>✓</span>
            <span className={styles.statNumber}>{sessionStats.learned}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statEmoji}>★</span>
            <span className={styles.statNumber}>{sessionStats.saved}</span>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <CategoryFilter
        categories={categoryOptions}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Card Stack */}
      <div className={styles.cardStackWrapper}>
        <SwipeCardStack
          key={activeCategory} // Reset stack when category changes
          cards={shuffledCards}
          onSwipe={handleSwipe}
          onComplete={handleComplete}
          hasExpertAccess={hasExpertAccess}
          onExpertClick={onExpertClick}
        />
      </div>

      {/* Quick Tips */}
      <div className={styles.quickTips}>
        <div className={styles.tipItem}>
          <kbd className={styles.keyHint}>←</kbd>
          <span>Skip</span>
        </div>
        <div className={styles.tipItem}>
          <kbd className={styles.keyHint}>↑</kbd>
          <span>Save</span>
        </div>
        <div className={styles.tipItem}>
          <kbd className={styles.keyHint}>→</kbd>
          <span>Learn</span>
        </div>
      </div>
    </div>
  );
};

export default IdeaCardFeed;
