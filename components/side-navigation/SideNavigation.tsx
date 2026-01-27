'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import styles from './SideNavigation.module.css';
import AzuraChat from '../azura-chat/AzuraChat';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeType?: 'default' | 'highlight';
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'featured',
    label: 'Featured',
    items: [
      { id: 'home', label: 'Home', href: '/home', icon: '/icons/Home Icon.svg' },
      { id: 'ai-coach', label: 'Azura AI', href: '/coach', icon: '/icons/ai-coach.png', badge: 'New', badgeType: 'highlight' },
    ],
  },
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'library', label: 'Chapters', href: '/library', icon: '/icons/Library Icon.svg' },
      { id: 'quests', label: 'Quests', href: '/quests', icon: '/icons/World Icon.svg' },
      { id: 'voting', label: 'Voting', href: '/voting', icon: '/icons/Vote Icon (1).svg' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'community', label: 'Community', href: 'https://mentalwealthacademy.net', icon: '/icons/World Icon.svg' },
      { id: 'podcasts', label: 'Podcasts', href: '/podcasts', icon: '/icons/Library Icon.svg' },
      { id: 'videos', label: 'Videos', href: '/videos', icon: '/icons/Eye.svg' },
      { id: 'courses', label: 'Courses', href: '/courses', icon: '/icons/Graduate.svg' },
      { id: 'surveys', label: 'Surveys', href: '/surveys', icon: '/icons/Survey.svg' },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    items: [
      { id: 'teams', label: 'Teams', href: '/teams', icon: '/icons/Venetian carnival.svg' },
      { id: 'agents', label: 'Agents', href: '/agents', icon: '/icons/daemon.svg' },
      { id: 'files', label: 'Files', href: '/files', icon: '/icons/bookicon.svg' },
      { id: 'apps', label: 'Apps', href: '/apps', icon: '/icons/Teleport.svg' },
    ],
  },
];

const SideNavigation: React.FC = () => {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const [shardCount, setShardCount] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch user data for shard count
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/me', {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = await response.json();
        if (data?.user?.shardCount !== undefined) {
          setShardCount(data.user.shardCount);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();

    const handleShardsUpdate = () => fetchUserData();
    window.addEventListener('shardsUpdated', handleShardsUpdate);
    return () => window.removeEventListener('shardsUpdated', handleShardsUpdate);
  }, []);

  const isActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className={styles.sideNav}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.logoText}>Mental Wealth Academy</span>
        <button className={styles.menuButton} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className={styles.navSections}>
        {navSections.map((section) => (
          <div key={section.id} className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>{section.label}</span>
            </div>
            <div className={styles.sectionItems}>
              {section.items.map((item) => (
                item.id === 'ai-coach' ? (
                  <button
                    key={item.id}
                    onClick={() => setIsChatOpen(true)}
                    className={`${styles.navItem} ${styles.navItemButton}`}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                      className={styles.navItemIcon}
                    />
                    <span className={styles.navItemLabel}>{item.label}</span>
                    {item.badge && (
                      <span className={`${styles.badge} ${item.badgeType === 'highlight' ? styles.badgeHighlight : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
                    {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                      className={styles.navItemIcon}
                    />
                    <span className={styles.navItemLabel}>{item.label}</span>
                    {item.badge && (
                      <span className={`${styles.badge} ${item.badgeType === 'highlight' ? styles.badgeHighlight : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {/* Daemon Shards Counter */}
        <div className={styles.shardsCounter}>
          <Image
            src="/icons/shard.svg"
            alt="Daemon"
            width={20}
            height={20}
            className={styles.shardIcon}
          />
          <span className={styles.shardsLabel}>Daemon:</span>
          <span className={styles.shardsValue}>
            {shardCount !== null ? String(shardCount).padStart(3, '0') : '000'}
          </span>
        </div>

        {/* Connect Wallet Button */}
        <button className={styles.connectWalletButton}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M17 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="13" y="9" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="15" cy="11" r="1" fill="currentColor"/>
          </svg>
          <span>Connect Wallet</span>
        </button>
      </div>

      {/* Azura Chat Modal */}
      <AzuraChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </nav>
  );
};

export default SideNavigation;
