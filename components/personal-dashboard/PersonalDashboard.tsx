'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './PersonalDashboard.module.css';

interface PersonalDashboardProps {
  username?: string | null;
  avatarUrl?: string | null;
  shardCount?: number;
  ideasLearned?: number;
  ideasSaved?: number;
  streak?: number;
  lastActiveDate?: string | null;
  dailyQuestTitle?: string;
  dailyQuestReward?: number;
}

// Streak badge configuration
const getStreakBadge = (streak: number) => {
  if (streak >= 30) return { emoji: '🔥', label: 'On Fire!', color: '#FF6B35' };
  if (streak >= 14) return { emoji: '⚡', label: 'Momentum', color: '#5168FF' };
  if (streak >= 7) return { emoji: '✨', label: 'Building', color: '#62BE8F' };
  if (streak >= 3) return { emoji: '🌱', label: 'Growing', color: '#9B7ED9' };
  return { emoji: '🎯', label: 'Start', color: '#CCCCCC' };
};

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  username,
  avatarUrl,
  shardCount = 0,
  ideasLearned = 0,
  ideasSaved = 0,
  streak = 0,
  lastActiveDate,
  dailyQuestTitle = 'Complete Your Daily Ideas',
  dailyQuestReward = 10,
}) => {
  const streakBadge = getStreakBadge(streak);
  const today = new Date().toLocaleDateString();
  const isActiveToday = lastActiveDate === today;

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <div className={styles.greeting}>
            <span className={styles.greetingTime}>
              {new Date().getHours() < 12 ? 'Good morning' : 
               new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </span>
            {username && !username.startsWith('user_') && (
              <h1 className={styles.welcomeName}>{username}</h1>
            )}
          </div>
          {avatarUrl && (
            <div className={styles.avatarWrapper}>
              <Image
                src={avatarUrl}
                alt={username || 'User'}
                width={56}
                height={56}
                className={styles.avatar}
                unoptimized
              />
              {isActiveToday && (
                <div className={styles.activeDot} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Shards */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #5168FF, #8A9FFF)' }}>
            <Image
              src="/icons/shard.svg"
              alt="Shards"
              width={24}
              height={24}
              className={styles.statIcon}
            />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{shardCount}</span>
            <span className={styles.statLabel}>Daemon Shards</span>
          </div>
        </motion.div>

        {/* Ideas Learned */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #62BE8F, #8EDBB1)' }}>
            <span className={styles.statEmoji}>💡</span>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{ideasLearned}</span>
            <span className={styles.statLabel}>Ideas Learned</span>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div 
            className={styles.statIconWrapper} 
            style={{ background: `linear-gradient(135deg, ${streakBadge.color}, ${streakBadge.color}99)` }}
          >
            <span className={styles.statEmoji}>{streakBadge.emoji}</span>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{streak} days</span>
            <span className={styles.statLabel}>{streakBadge.label}</span>
          </div>
        </motion.div>

        {/* Saved Ideas */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIconWrapper} style={{ background: 'linear-gradient(135deg, #9B7ED9, #B99DF0)' }}>
            <span className={styles.statEmoji}>⭐</span>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{ideasSaved}</span>
            <span className={styles.statLabel}>Saved</span>
          </div>
        </motion.div>
      </div>

      {/* Continue Learning Section */}
      <div className={styles.continueSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Continue Learning</h2>
          <Link href="/ideas" className={styles.viewAllLink}>
            View All →
          </Link>
        </div>
        <Link href="/ideas" className={styles.continueCard}>
          <div className={styles.continueCardContent}>
            <div className={styles.continueIcon}>
              <span>📚</span>
            </div>
            <div className={styles.continueInfo}>
              <h3 className={styles.continueTitle}>Daily Ideas</h3>
              <p className={styles.continueDescription}>
                Swipe through micro-insights to expand your knowledge
              </p>
              <div className={styles.continueProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((ideasLearned / 50) * 100, 100)}%` }}
                  />
                </div>
                <span className={styles.progressText}>{ideasLearned}/50 ideas</span>
              </div>
            </div>
            <div className={styles.continueArrow}>→</div>
          </div>
        </Link>
      </div>

      {/* Daily Quest Section */}
      <div className={styles.dailyQuestSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Daily Quest</h2>
          <span className={styles.questBadge}>
            +{dailyQuestReward} <Image src="/icons/shard.svg" alt="" width={14} height={14} />
          </span>
        </div>
        <Link href="/quests" className={styles.dailyQuestCard}>
          <div className={styles.questCardContent}>
            <div className={styles.questIconWrapper}>
              <span className={styles.questIcon}>⚔️</span>
            </div>
            <div className={styles.questInfo}>
              <h3 className={styles.questTitle}>{dailyQuestTitle}</h3>
              <p className={styles.questReward}>
                Complete to earn {dailyQuestReward} Daemon shards
              </p>
            </div>
            <div className={styles.questStatus}>
              {isActiveToday ? (
                <span className={styles.questComplete}>✓</span>
              ) : (
                <span className={styles.questPending}>Go</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PersonalDashboard;
