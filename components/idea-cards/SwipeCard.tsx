'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { IdeaCard, IdeaCategory, SwipeDirection } from './types';
import styles from './SwipeCard.module.css';

// Category configuration - aligned with design system
const categoryConfig: Record<IdeaCategory, { color: string; label: string; highlightColor: string }> = {
  'mental-health': { color: '#E8DFF5', label: 'Mental Health', highlightColor: '#9B7ED9' },
  'productivity': { color: '#E3E7FF', label: 'Productivity', highlightColor: '#5168FF' },
  'wealth': { color: '#E0F4EA', label: 'Wealth', highlightColor: '#62BE8F' },
};

// Helper function to highlight important words in text
const highlightImportantWords = (text: string, highlightColor: string): React.ReactNode => {
  const commonWords = new Set(['the', 'this', 'when', 'what', 'that', 'these', 'there', 'their', 'with', 'from', 'have', 'been', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who']);
  
  // Use regex to find words starting with capital letters
  const words = text.split(/(\s+|[.,!?;:()])/);
  const result: React.ReactNode[] = [];
  
  words.forEach((word, index) => {
    // Check if word starts with capital and is longer than 3 chars
    const trimmed = word.trim();
    if (trimmed && /^[A-Z]/.test(trimmed) && trimmed.length > 3) {
      const lowerWord = trimmed.toLowerCase().replace(/[.,!?;:()]/g, '');
      if (!commonWords.has(lowerWord)) {
        result.push(
          <span key={index} style={{ color: highlightColor, fontWeight: 600 }}>
            {word}
          </span>
        );
        return;
      }
    }
    result.push(<React.Fragment key={index}>{word}</React.Fragment>);
  });
  
  return <>{result}</>;
};

// Difficulty badge colors
const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'var(--color-secondary)' },
  intermediate: { label: 'Intermediate', color: 'var(--color-primary)' },
  advanced: { label: 'Advanced', color: '#9B7FE6' },
};

interface SwipeCardProps {
  card: IdeaCard;
  onSwipe: (direction: SwipeDirection) => void;
  isTop?: boolean;
  hasExpertAccess?: boolean;
  onExpertClick?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  card,
  onSwipe,
  isTop = true,
  hasExpertAccess = false,
  onExpertClick,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for visual feedback
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Overlay indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);
  const saveOpacity = useTransform(y, [-100, 0], [1, 0]);

  const category = categoryConfig[card.category];
  const difficulty = difficultyConfig[card.difficulty];

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = 0.5;
    
    const swipeX = Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity;
    const swipeUp = info.offset.y < -threshold || info.velocity.y < -velocity;
    
    if (swipeUp) {
      onSwipe('up'); // Save
    } else if (swipeX) {
      if (info.offset.x > 0) {
        onSwipe('right'); // Like/Learn
      } else {
        onSwipe('left'); // Skip
      }
    }
  };

  return (
    <motion.div
      className={styles.cardContainer}
      style={{
        x,
        y,
        rotate,
        opacity: isTop ? opacity : 0.5,
        zIndex: isTop ? 10 : 1,
        scale: isTop ? 1 : 0.95,
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Swipe Indicators */}
      {isTop && (
        <>
          <motion.div 
            className={`${styles.swipeIndicator} ${styles.likeIndicator}`}
            style={{ opacity: likeOpacity }}
          >
            <span>LEARN</span>
          </motion.div>
          <motion.div 
            className={`${styles.swipeIndicator} ${styles.skipIndicator}`}
            style={{ opacity: skipOpacity }}
          >
            <span>SKIP</span>
          </motion.div>
          <motion.div 
            className={`${styles.swipeIndicator} ${styles.saveIndicator}`}
            style={{ opacity: saveOpacity }}
          >
            <span>SAVE</span>
          </motion.div>
        </>
      )}

      {/* Card Content */}
      <div 
        className={styles.card}
        style={{ 
          backgroundColor: category.color,
          borderTop: `4px solid ${category.highlightColor}` 
        }}
      >
        {/* Header */}
        <div className={styles.cardHeader}>
          <div 
            className={styles.categoryBadge}
            style={{ 
              backgroundColor: category.highlightColor,
              color: 'white'
            }}
          >
            <span>{category.label}</span>
          </div>
          <div 
            className={styles.difficultyBadge}
            style={{ 
              backgroundColor: category.highlightColor,
              color: 'white'
            }}
          >
            {difficulty.label}
          </div>
        </div>

        {/* Title */}
        <h2 
          className={styles.cardTitle}
          style={{ color: category.highlightColor }}
        >
          {card.title}
        </h2>

        {/* Content */}
        <p className={styles.cardContent}>
          {highlightImportantWords(card.microContent, category.highlightColor)}
        </p>

        {/* Expert Commentary Section */}
        {card.expertCommentary && (
          <div className={styles.expertSection}>
            {hasExpertAccess ? (
              <div className={styles.expertContent}>
                <div className={styles.expertHeader}>
                  <span className={styles.expertLabel}>Expert Insight</span>
                </div>
                <p className={styles.expertText}>
                  {highlightImportantWords(card.expertCommentary, category.highlightColor)}
                </p>
              </div>
            ) : (
              <button 
                className={styles.expertLocked}
                onClick={onExpertClick}
                type="button"
                style={{ 
                  borderColor: category.highlightColor,
                  color: category.highlightColor
                }}
              >
                <span className={styles.unlockText}>Unlock Expert Commentary</span>
                <span className={styles.priceTag} style={{ 
                  backgroundColor: category.highlightColor,
                  color: 'white'
                }}>
                  $4.99/mo
                </span>
              </button>
            )}
          </div>
        )}

        {/* Related Quest */}
        {card.relatedQuestId && (
          <div 
            className={styles.questLink}
            style={{ 
              backgroundColor: category.highlightColor,
              color: 'white'
            }}
          >
            <span>Related Quest Available</span>
          </div>
        )}

        {/* Swipe Hints */}
        <div className={styles.swipeHints}>
          <span className={styles.hint}>← Skip</span>
          <span className={styles.hint}>↑ Save</span>
          <span className={styles.hint}>Learn →</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
