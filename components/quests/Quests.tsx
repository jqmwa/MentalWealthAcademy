'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Quests.module.css';
import QuestDetailSidebar from './QuestDetailSidebar';

// Daemon Icon Component
const DaemonIcon: React.FC<{ size?: number }> = ({ size = 18.83 }) => {
  return (
    <Image
      src="/icons/Coin Poly.svg"
      alt="Daemon"
      width={size}
      height={size}
      className={styles.usdcIcon}
    />
  );
};

// Arrow Right Circle Icon Component
const ArrowRightCircleIcon: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowIcon}>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Quest Card Component
interface QuestCardProps {
  id?: string;
  title: string;
  academy: string;
  date: string;
  time: string;
  questName: string;
  usdcBonded: string;
  usdcReward: string;
  questType?: string;
  description?: string;
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({
  title,
  academy,
  date,
  time,
  questName,
  usdcBonded,
  usdcReward,
  onClick,
}) => {
  return (
    <div className={styles.questCard} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.questCardContent}>
        <div className={styles.questDetailsSection}>
          <div className={styles.questCardTitle}>{title}</div>
          <div className={styles.descriptionWrapper}>
            <span className={styles.academyName}>{academy}</span>
            <span className={styles.separator}>|</span>
            <span className={styles.date}>{date}</span>
            <span className={styles.separator}>|</span>
            <span className={styles.time}>{time}</span>
          </div>
        </div>

        <div className={styles.questInfoGroup}>
          <div className={styles.questInfo}>
            <div className={styles.questName}>{questName}</div>
            <div className={styles.usdcBonded}>
              <DaemonIcon />
              <span>{usdcBonded}</span>
            </div>
            <div className={styles.usdcReward}>
              <DaemonIcon />
              <span>{usdcReward}</span>
            </div>
          </div>
          <div className={styles.arrowIconWrapper}>
            <ArrowRightCircleIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

const Quests: React.FC = () => {
  const router = useRouter();
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sample quest data - replace with actual data later
  const quests = [
    {
      id: 'twitter-follow-quest',
      title: 'Follow Mental Wealth Community',
      academy: 'Mental Wealth Academy',
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      questName: 'Automatic',
      usdcBonded: '100',
      usdcReward: '10',
      questType: 'twitter-follow' as const,
      description: 'Connect your X (Twitter) account and follow @MentalWealthDAO to earn your first shards!',
    },
  ];

  return (
    <>
      <div className={styles.questsContainer} data-intro="quests">
        <div className={styles.questsWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Active Quests</h1>
            <button 
              className={styles.viewAllButton}
              onClick={() => router.push('/quests')}
            >
              View All Quests
            </button>
          </div>

          <div className={styles.questsList}>
            {quests.map((quest, index) => (
              <QuestCard 
                key={quest.id || index} 
                {...quest}
                onClick={() => {
                  setSelectedQuest(quest);
                  setIsSidebarOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <QuestDetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setSelectedQuest(null);
        }}
        quest={selectedQuest}
      />
    </>
  );
};

export default Quests;

