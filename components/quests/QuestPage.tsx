'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './QuestPage.module.css';
import { AccountBanner } from '@/components/forum/AccountBanner';

// Shard Icon Component
const ShardIcon: React.FC<{ size?: number }> = ({ size = 18.83 }) => {
  return (
    <Image
      src="/icons/shard.svg"
      alt="Shard"
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
}

const QuestCard: React.FC<QuestCardProps> = ({
  title,
  academy,
  date,
  time,
  questName,
  usdcBonded,
  usdcReward,
}) => {
  return (
    <div className={styles.questCard}>
      <div className={styles.questCardContent}>
        <div className={styles.questImageWrapper}>
          <Image
            src="/icons/questbadge.png"
            alt="Quest Badge"
            width={44}
            height={44}
            className={styles.questImage}
          />
        </div>
        
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
              <ShardIcon />
              <span>{usdcBonded}</span>
            </div>
            <div className={styles.usdcReward}>
              <ShardIcon />
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
}

type TabType = 'active' | 'available' | 'ending';

const QuestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter quests based on active tab and search query
  const filteredQuests = useMemo(() => {
    // Mock quest data - moved inside useMemo to prevent dependency issues
    const allQuests: QuestData[] = [
      // Active Quests
      {
        id: '1',
        title: 'Your First Quest',
        academy: 'Mental Wealth Academy',
        date: '03/16/2025',
        time: '12:33 PM',
        questName: 'Academy V3 Oracle',
        usdcBonded: '700',
        usdcReward: '5',
        status: 'active',
      },
      {
        id: '2',
        title: 'Community Builder',
        academy: 'Digital Skills Academy',
        date: '03/17/2025',
        time: '10:15 AM',
        questName: 'Build Community Hub',
        usdcBonded: '1,200',
        usdcReward: '15',
        status: 'active',
      },
      {
        id: '3',
        title: 'Content Creator',
        academy: 'Creative Arts Academy',
        date: '03/18/2025',
        time: '2:45 PM',
        questName: 'Create Tutorial Series',
        usdcBonded: '850',
        usdcReward: '8',
        status: 'active',
      },
      // Available Quests
      {
        id: '4',
        title: 'Blockchain Explorer',
        academy: 'Tech Innovation Academy',
        date: '03/20/2025',
        time: '9:00 AM',
        questName: 'Learn Blockchain Basics',
        usdcBonded: '500',
        usdcReward: '10',
        status: 'available',
      },
      {
        id: '5',
        title: 'Design Master',
        academy: 'Visual Design Academy',
        date: '03/21/2025',
        time: '11:30 AM',
        questName: 'UI/UX Design Challenge',
        usdcBonded: '600',
        usdcReward: '12',
        status: 'available',
      },
      {
        id: '6',
        title: 'Code Warrior',
        academy: 'Programming Academy',
        date: '03/22/2025',
        time: '1:00 PM',
        questName: 'Build Full Stack App',
        usdcBonded: '1,500',
        usdcReward: '20',
        status: 'available',
      },
      {
        id: '7',
        title: 'Marketing Guru',
        academy: 'Business Academy',
        date: '03/23/2025',
        time: '3:15 PM',
        questName: 'Social Media Campaign',
        usdcBonded: '900',
        usdcReward: '18',
        status: 'available',
      },
      // Ending Quests
      {
        id: '8',
        title: 'Early Adopter',
        academy: 'Innovation Academy',
        date: '03/19/2025',
        time: '4:00 PM',
        questName: 'Beta Testing Program',
        usdcBonded: '400',
        usdcReward: '6',
        status: 'ending',
      },
      {
        id: '9',
        title: 'Research Pioneer',
        academy: 'Science Academy',
        date: '03/19/2025',
        time: '5:30 PM',
        questName: 'Research Paper Review',
        usdcBonded: '750',
        usdcReward: '9',
        status: 'ending',
      },
      {
        id: '10',
        title: 'Mentor Program',
        academy: 'Leadership Academy',
        date: '03/19/2025',
        time: '6:00 PM',
        questName: 'Mentor New Students',
        usdcBonded: '1,000',
        usdcReward: '25',
        status: 'ending',
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
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Earn shards by completing quests</h1>
          <p className={styles.heroSubtitle}>
            Quests are singular or collaborative tasks for users to complete, and shards are the rewarded currency that unlocks what comes next.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryCta} type="button">
              <ShardIcon size={12} />
              <span>Get Started</span>
            </button>
            <button className={styles.secondaryCta} type="button">More Info</button>
          </div>
        </div>
        <div className={styles.heroGlow} />
      </div>

      <div className={styles.accountBannerWrap}>
        <AccountBanner />
      </div>

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

                <div className={styles.votingCardsContainer}>
                  <div className={styles.votingCard}>
                    <div className={styles.votingCardContent}>
                      <div className={styles.featuredBadge}>
                        <span className={styles.featuredText}>Featured</span>
                      </div>
                      <div className={styles.votingCardHeader}>
                        <h3 className={styles.votingCardTitle}>Otaku Library Expansion</h3>
                        <p className={styles.votingCardDescription}>
                          Description: Expand our digital library to include manga, anime theory essays, and curated playlists for members exploring the intersection of animation, mental health, and cultural storytelling.
                        </p>
                        <p className={styles.votingCardPublisher}>Published by 0x252...eg0d</p>
                      </div>
                      <div className={styles.votesSection}>
                        <h4 className={styles.votesTitle}>Votes</h4>
                        <div className={styles.voteOption}>
                          <div className={styles.voteOptionHeader}>
                            <span className={styles.voteNumber}>10</span>
                            <span className={styles.votePercentage}>74%</span>
                          </div>
                          <div className={styles.voteProgressBar}>
                            <div className={styles.voteProgressBarBg}></div>
                            <div className={styles.voteProgressBarFill} style={{ width: '74%' }}></div>
                          </div>
                          <span className={styles.voteCount}>1633 votes</span>
                        </div>
                        <div className={styles.voteOption}>
                          <div className={styles.voteOptionHeader}>
                            <span className={styles.voteNumber}>10</span>
                            <span className={styles.votePercentage}>14%</span>
                          </div>
                          <div className={styles.voteProgressBar}>
                            <div className={styles.voteProgressBarBg}></div>
                            <div className={styles.voteProgressBarFill} style={{ width: '14%' }}></div>
                          </div>
                          <span className={styles.voteCount}>154 votes</span>
                        </div>
                        <div className={styles.voteButtons}>
                          <button className={styles.voteButtonYes}>Yes</button>
                          <button className={styles.voteButtonNo}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.votingCard}>
                    <div className={styles.votingCardContent}>
                      <div className={styles.featuredBadge}>
                        <span className={styles.featuredText}>Featured</span>
                      </div>
                      <div className={styles.votingCardHeader}>
                <h3 className={styles.votingCardTitle}>Research Grant Allocation</h3>
                        <p className={styles.votingCardDescription}>
                  Description: Propose a new research grant program to fund innovative blockchain and decentralized technology projects. Grants will support early-stage research with potential for real-world impact.
                        </p>
                <p className={styles.votingCardPublisher}>Published by 0x8a3...f2c</p>
                      </div>
                      <div className={styles.votesSection}>
                        <h4 className={styles.votesTitle}>Votes</h4>
                        <div className={styles.voteOption}>
                          <div className={styles.voteOptionHeader}>
                    <span className={styles.voteNumber}>8</span>
                    <span className={styles.votePercentage}>62%</span>
                          </div>
                          <div className={styles.voteProgressBar}>
                            <div className={styles.voteProgressBarBg}></div>
                    <div className={styles.voteProgressBarFill} style={{ width: '62%' }}></div>
                          </div>
                  <span className={styles.voteCount}>1247 votes</span>
                        </div>
                        <div className={styles.voteOption}>
                          <div className={styles.voteOptionHeader}>
                    <span className={styles.voteNumber}>8</span>
                    <span className={styles.votePercentage}>38%</span>
                          </div>
                          <div className={styles.voteProgressBar}>
                            <div className={styles.voteProgressBarBg}></div>
                    <div className={styles.voteProgressBarFill} style={{ width: '38%' }}></div>
                          </div>
                  <span className={styles.voteCount}>765 votes</span>
                        </div>
                        <div className={styles.voteButtons}>
                          <button className={styles.voteButtonYes}>Yes</button>
                          <button className={styles.voteButtonNo}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                        />
                      ))
                    ) : (
                      <div className={styles.noQuests}>
                        <p>No quests found matching your search criteria.</p>
                      </div>
                    )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestPage;

