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

// Vote Icon Component
const VoteIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="m163.508 372.218h77.492v-113h-89.637c.073 38.712 4.33 77.506 12.145 113z" fill="currentColor"/>
      <path d="m340.798 402.218h-69.798v109.782c19.936-8.42 39.669-33.147 55.821-70.691 5.216-12.122 9.886-25.238 13.977-39.091z" fill="currentColor"/>
      <path d="m185.179 441.31c16.152 37.543 35.886 62.271 55.821 70.69v-109.782h-69.797c4.091 13.853 8.761 26.969 13.976 39.092z" fill="currentColor"/>
      <path d="m271 372.218h77.492c7.816-35.493 12.073-74.288 12.145-113h-89.637z" fill="currentColor"/>
      <path d="m140.041 402.218h-96.407c33.778 50.064 84.798 87.524 144.538 103.899-11.179-14.098-21.463-31.826-30.551-52.951-6.728-15.641-12.612-32.78-17.58-50.948z" fill="currentColor"/>
      <path d="m354.379 453.165c-9.088 21.125-19.372 38.853-30.551 52.951 59.74-16.375 110.76-53.834 144.538-103.899h-96.406c-4.968 18.169-10.852 35.308-17.581 50.948z" fill="currentColor"/>
      <path d="m121.364 259.217h-121.364c0 40.565 9.45 78.917 26.245 113h106.622c-7.414-35.874-11.435-74.53-11.503-113z" fill="currentColor"/>
      <path d="m390.637 259.217c-.068 38.469-4.089 77.126-11.503 113h106.622c16.795-34.083 26.245-72.436 26.245-113z" fill="currentColor"/>
      <path d="m266.829 95.298c21.458-4.913 37.475-24.093 37.51-47.032-.041-26.663-21.666-48.266-48.339-48.266s-48.298 21.603-48.338 48.266c.036 22.939 16.052 42.118 37.51 47.031-5.357.619-10.549 1.773-15.536 3.383l26.364 56.967 26.365-56.966c-4.987-1.61-10.179-2.764-15.536-3.383z" fill="currentColor"/>
      <path d="m462.345 191.36v-4.68c0-31.073-22.899-56.791-52.74-61.216 15.617-4.054 27.152-18.233 27.177-35.112-.031-20.041-16.284-36.278-36.332-36.278s-36.302 16.237-36.332 36.278c.026 16.879 11.56 31.058 27.177 35.112-29.842 4.425-52.74 30.144-52.74 61.216v-10.814c0-25.323-11.617-47.914-29.798-62.785l-36.229 78.28h189.817z" fill="currentColor"/>
      <path d="m203.244 113.081c-18.181 14.872-29.798 37.462-29.798 62.785v10.814c0-31.073-22.899-56.791-52.74-61.216 15.617-4.054 27.152-18.234 27.177-35.114-.031-20.04-16.285-36.276-36.332-36.276-20.048 0-36.302 16.237-36.332 36.278.026 16.879 11.56 31.058 27.177 35.112-29.842 4.425-52.74 30.144-52.74 61.216v4.68h189.817z" fill="currentColor"/>
    </svg>
  );
};

// Quest Icon Component
const QuestIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Token Icon Component
const TokenIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  );
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
              className={styles.statIconNoFilter}
            />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{shardCount}</span>
            <span className={styles.statLabel}>Daemon Shards</span>
          </div>
        </motion.div>

        {/* Votes Casted */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIconWrapper} style={{ background: 'var(--color-primary, #5168FF)' }}>
            <VoteIcon size={24} className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{ideasLearned}</span>
            <span className={styles.statLabel}>Votes Casted</span>
          </div>
        </motion.div>

        {/* Quests Completed */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIconWrapper} style={{ background: 'var(--color-primary, #5168FF)' }}>
            <QuestIcon size={24} className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{streak}</span>
            <span className={styles.statLabel}>Quests Completed</span>
          </div>
        </motion.div>

        {/* AI Tokens */}
        <motion.div 
          className={styles.statCard}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={styles.statIconWrapper} style={{ background: 'var(--color-primary, #5168FF)' }}>
            <TokenIcon size={24} className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{ideasSaved}</span>
            <span className={styles.statLabel}>AI Tokens</span>
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
