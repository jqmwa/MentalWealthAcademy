'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './QuestLeaderboard.module.css';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl?: string;
  totalEarned: number;
  questsCompleted: number;
  streak: number;
}

type TimeRange = 'weekly' | 'monthly' | 'allTime';

// Sample leaderboard data
const sampleLeaderboard: Record<TimeRange, LeaderboardEntry[]> = {
  weekly: [
    { rank: 1, username: 'crypto_sage', totalEarned: 450, questsCompleted: 12, streak: 7 },
    { rank: 2, username: 'mindful_maya', avatarUrl: '/uploads/HappyEmote.png', totalEarned: 380, questsCompleted: 10, streak: 5 },
    { rank: 3, username: 'productivity_pro', avatarUrl: '/uploads/ConfusedEmote.png', totalEarned: 320, questsCompleted: 8, streak: 4 },
    { rank: 4, username: 'wellness_warrior', totalEarned: 275, questsCompleted: 7, streak: 3 },
    { rank: 5, username: 'defi_dreamer', totalEarned: 210, questsCompleted: 6, streak: 2 },
  ],
  monthly: [
    { rank: 1, username: 'mindful_maya', avatarUrl: '/uploads/HappyEmote.png', totalEarned: 1820, questsCompleted: 45, streak: 28 },
    { rank: 2, username: 'crypto_sage', totalEarned: 1650, questsCompleted: 42, streak: 21 },
    { rank: 3, username: 'productivity_pro', avatarUrl: '/uploads/ConfusedEmote.png', totalEarned: 1420, questsCompleted: 38, streak: 14 },
    { rank: 4, username: 'wellness_warrior', totalEarned: 980, questsCompleted: 28, streak: 10 },
    { rank: 5, username: 'dao_delegate', totalEarned: 875, questsCompleted: 25, streak: 8 },
  ],
  allTime: [
    { rank: 1, username: 'crypto_sage', totalEarned: 12500, questsCompleted: 320, streak: 45 },
    { rank: 2, username: 'mindful_maya', avatarUrl: '/uploads/HappyEmote.png', totalEarned: 11200, questsCompleted: 285, streak: 38 },
    { rank: 3, username: 'dao_delegate', totalEarned: 9800, questsCompleted: 248, streak: 30 },
    { rank: 4, username: 'productivity_pro', avatarUrl: '/uploads/ConfusedEmote.png', totalEarned: 8500, questsCompleted: 215, streak: 25 },
    { rank: 5, username: 'wellness_warrior', totalEarned: 7200, questsCompleted: 180, streak: 20 },
  ],
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' };
    case 2: return { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#000' };
    case 3: return { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', color: '#fff' };
    default: return { bg: 'var(--color-background)', color: 'var(--color-text-dark)' };
  }
};

export const QuestLeaderboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const entries = sampleLeaderboard[timeRange];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.trophy}>🏆</span>
          <h2 className={styles.title}>Top Earners</h2>
        </div>
        
        {/* Time Range Toggle */}
        <div className={styles.toggleGroup}>
          {(['weekly', 'monthly', 'allTime'] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`${styles.toggleButton} ${timeRange === range ? styles.toggleActive : ''}`}
              onClick={() => setTimeRange(range)}
              type="button"
            >
              {range === 'weekly' && 'Week'}
              {range === 'monthly' && 'Month'}
              {range === 'allTime' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className={styles.list}>
        {entries.map((entry, index) => {
          const rankStyle = getRankStyle(entry.rank);
          return (
            <motion.div
              key={entry.username}
              className={styles.entry}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Rank */}
              <div 
                className={styles.rank}
                style={{ background: rankStyle.bg, color: rankStyle.color }}
              >
                {entry.rank <= 3 ? (
                  <span className={styles.rankMedal}>
                    {entry.rank === 1 && '🥇'}
                    {entry.rank === 2 && '🥈'}
                    {entry.rank === 3 && '🥉'}
                  </span>
                ) : (
                  <span className={styles.rankNumber}>{entry.rank}</span>
                )}
              </div>

              {/* User */}
              <div className={styles.user}>
                <div className={styles.avatar}>
                  {entry.avatarUrl ? (
                    <Image
                      src={entry.avatarUrl}
                      alt={entry.username}
                      width={36}
                      height={36}
                      className={styles.avatarImage}
                      unoptimized
                    />
                  ) : (
                    <span className={styles.avatarPlaceholder}>
                      {entry.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.username}>@{entry.username}</span>
                  <span className={styles.stats}>
                    {entry.questsCompleted} quests • {entry.streak}🔥
                  </span>
                </div>
              </div>

              {/* Earned */}
              <div className={styles.earned}>
                <Image src="/icons/shard.svg" alt="" width={18} height={18} />
                <span className={styles.earnedValue}>{entry.totalEarned.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Link */}
      <button className={styles.viewAll} type="button">
        View Full Leaderboard →
      </button>
    </div>
  );
};

export default QuestLeaderboard;
