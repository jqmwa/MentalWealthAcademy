'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import styles from './QuestPage.module.css';
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

// Search Icon Component
const SearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.searchIcon}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};


// Quest Card Component
interface QuestCardProps {
  title: string;
  academy: string;
  date: string;
  time: string;
  questName: string;
  usdcBonded: string;
  usdcReward: string;
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
  description,
  onClick,
}) => {
  return (
    <div className={styles.questCard} onClick={onClick}>
      <div className={styles.questCardContent}>
        <div className={styles.questDetailsSection}>
          <div className={styles.questCardTitle}>{title}</div>
          {description && (
            <div className={styles.questDescription}>{description}</div>
          )}
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

// Quest Data Interface
interface QuestData {
  id: string;
  title: string;
  academy: string;
  date: string;
  time: string;
  questName: string;
  usdcBonded: string;
  usdcReward: string;
  status: 'active' | 'available' | 'ending';
  questType?: 'proof-required' | 'no-proof' | 'follow-and-own' | 'twitter-follow';
  description?: string;
}

type TabType = 'active' | 'available' | 'ending';

const QuestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuest, setSelectedQuest] = useState<QuestData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Filter quests based on active tab and search query
  const filteredQuests = useMemo(() => {
    // Quest data aligned with goals
    const allQuests: QuestData[] = [
      // Active Quests
      {
        id: '1',
        title: 'Azura Viral Video Quest',
        academy: 'Marketing Academy',
        date: '03/16/2025',
        time: '12:33 PM',
        questName: 'Oracle Vote',
        usdcBonded: '850',
        usdcReward: '142',
        status: 'active',
        questType: 'proof-required',
        description: 'Unleash your creativity! Use CapCut and AI to craft stunning, viral-ready marketing videos featuring Azura. Show the world your storytelling skills and compete for the most engaging content. The best videos will be featured across our platforms!',
      },
      {
        id: '2',
        title: 'Community Builder',
        academy: 'Community Academy',
        date: '03/17/2025',
        time: '10:15 AM',
        questName: 'Automatic',
        usdcBonded: '1,200',
        usdcReward: '200',
        status: 'active',
        questType: 'no-proof',
        description: 'Register for the event on the homepage. No proof required for this quest.',
      },
      {
        id: '3',
        title: 'Academic Angel',
        academy: 'Social Academy',
        date: '03/18/2025',
        time: '2:45 PM',
        questName: 'Automatic',
        usdcBonded: '850',
        usdcReward: '142',
        status: 'active',
        questType: 'follow-and-own',
        description: 'Follow the Farcaster account @daemonagent and own an Academic Angel.',
      },
      {
        id: 'twitter-follow-quest',
        title: 'Follow Mental Wealth DAO',
        academy: 'Mental Wealth Academy',
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        questName: 'Automatic',
        usdcBonded: '100',
        usdcReward: '10',
        status: 'active',
        questType: 'twitter-follow',
        description: 'Connect your X (Twitter) account and follow @MentalWealthDAO to earn your first Daemon!',
      },
    ];

    let filtered = allQuests.filter(quest => quest.status === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quest =>
        quest.title.toLowerCase().includes(query) ||
        quest.academy.toLowerCase().includes(query) ||
        quest.questName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  return (
    <div className={styles.questPageContainer}>
      <div className={styles.hero}>
        <header className={`${styles.header} ${isLoaded ? styles.headerLoaded : ''}`}>
          <p className={styles.eyebrow}>MWA • Quest Room</p>
          <h1 className={styles.title}>Complete Quests & Earn Rewards</h1>
          <p className={styles.subtitle}>
            Quests are singular or collaborative tasks for users to complete, and Daemon are the rewarded currency that unlocks what comes next.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryCta} type="button">
              <DaemonIcon size={12} />
              <span>CURRENCIES</span>
            </button>
            <button className={styles.secondaryCta} type="button">More Info</button>
          </div>
        </header>
      </div>

      {/* Quests directly under guest banner */}
      <div className={styles.questsSection}>
        <div className={styles.questsList}>
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                title={quest.title}
                academy={quest.academy}
                date={quest.date}
                time={quest.time}
                questName={quest.questName}
                usdcBonded={quest.usdcBonded}
                usdcReward={quest.usdcReward}
                description={quest.description}
                onClick={() => {
                  setSelectedQuest(quest);
                  setIsSidebarOpen(true);
                }}
              />
            ))
          ) : (
            <div className={styles.noQuests}>
              <p>No quests found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quest Detail Sidebar */}
      <QuestDetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
          setSelectedQuest(null);
        }}
        quest={selectedQuest}
      />

      <div className={styles.leftSection}>
        <div className={styles.mainCard}>
          <div className={styles.mainCardContent}>
            <div className={styles.mainCardLeft}>
              <div className={styles.amountValue}>$50,000</div>
              <div className={styles.vaultedReservesTitle}>Unified Quest Pool</div>
              <div className={styles.cryptoList}>ETH, BTC, DOT, INU, & SOL</div>
              <div className={styles.cryptoIconsGroup}>
                <div className={styles.cryptoIcon}>
                  <div className={styles.cryptoIconBg}>
                    <Image src="/icons/ethcolored.svg" alt="ETH" width={40} height={40} className={styles.cryptoIconImage} />
                  </div>
                </div>
                <div className={styles.cryptoIcon}>
                  <div className={styles.cryptoIconBg}>
                    <Image src="/icons/bitcoin-btc-logo.svg" alt="BTC" width={40} height={40} className={styles.cryptoIconImage} />
                  </div>
                </div>
                <div className={styles.cryptoIcon}>
                  <div className={styles.cryptoIconBg}>
                    <Image src="/icons/polkadot.svg" alt="DOT" width={40} height={40} className={styles.cryptoIconImage} />
                  </div>
                </div>
                <div className={styles.cryptoIcon}>
                  <div className={styles.cryptoIconBg}>
                    <Image src="/icons/shibainu.svg" alt="INU" width={40} height={40} className={styles.cryptoIconImage} />
                  </div>
                </div>
                <div className={styles.cryptoIcon}>
                  <div className={styles.cryptoIconBg}>
                    <Image src="/icons/sol-logo.svg" alt="SOL" width={40} height={40} className={styles.cryptoIconImage} />
                  </div>
                </div>
              </div>
              <div className={styles.percentageChange}>
                <svg className={styles.arrowUp} width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M10 0L10 20M10 0L0 10M10 0L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.percentageText}>9.23% LAST 24h</span>
              </div>
            </div>
            <div className={styles.mainCardRight}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestPage;

