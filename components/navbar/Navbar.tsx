'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { SearchModal } from '@/components/search-modal/SearchModal';
import styles from './Navbar.module.css';

// Menu Icon Component
const MenuIcon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.menuIcon}>
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Search Icon Component
const SearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.searchIcon}>
      <circle cx="11" cy="11" r="8" stroke="rgba(156, 163, 175, 1)" strokeWidth="2" fill="none"/>
      <path d="m21 21-4.35-4.35" stroke="rgba(156, 163, 175, 1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { authenticated, ready } = usePrivy();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shardCount, setShardCount] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user data - works for both Privy and session-based auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        const data = await response.json();
        if (data?.user) {
          if (data.user.shardCount !== undefined) {
            setShardCount(data.user.shardCount);
          }
          setUsername(data.user.username || null);
          setAvatarUrl(data.user.avatarUrl || null);
        } else {
          // No user data - clear state
          setShardCount(null);
          setUsername(null);
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setShardCount(null);
        setUsername(null);
        setAvatarUrl(null);
      }
    };

    // Fetch immediately and also when Privy auth state changes (for Privy users)
    fetchUserData();

    // Listen for shard updates and profile updates
    const handleShardsUpdate = () => {
      fetchUserData();
    };
    const handleProfileUpdate = () => {
      fetchUserData();
    };
    
    window.addEventListener('shardsUpdated', handleShardsUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('shardsUpdated', handleShardsUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [authenticated, ready]); // Still include dependencies to refetch when Privy state changes

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSearchModalOpen(false);
  };


  return (
    <nav className={styles.navbar}>
      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={styles.leftContent}>
          <Link href="/home" className={styles.brandLink} aria-label="Mental Wealth Academy">
            <div className={styles.logoWrapper}>
              <Image
                src="https://i.imgur.com/G5kFo1Q.png"
                alt="Mental Wealth Academy"
                fill
                priority
                sizes="(max-width: 250px) 140px, 180px"
                className={styles.logo}
              />
            </div>
          </Link>
        </div>

        {/* Search Bar - Hidden on mobile, icon only on tablet */}
        <div className={styles.searchContainer} ref={searchContainerRef}>
          <div className={styles.searchInputContainer}>
            <div className={styles.searchInputWrapper}>
              <div className={styles.searchIconLeft}>
                <SearchIcon size={20} />
              </div>
              <input
                type="text"
                placeholder="Search with Daemon Model"
                className={styles.searchInput}
                onClick={handleSearchClick}
                readOnly
              />
            </div>
          </div>
          <SearchModal 
            isOpen={isSearchModalOpen} 
            onClose={handleCloseModal}
            searchContainerRef={searchContainerRef}
          />
        </div>

        <div className={styles.rightContent}>
          {/* Desktop Navigation Links */}
          <div className={styles.linksContainer}>
            {/* Home Button */}
            <Link href="/home" className={`${styles.navButton} ${isActive('/home') ? styles.navButtonActive : ''}`}>
              <Image
                src="/icons/home.svg"
                alt="Home"
                width={20}
                height={20}
                className={styles.homeIcon}
              />
              <span className={isActive('/home') ? styles.buttonLabelActive : styles.buttonLabel}>Home</span>
            </Link>

            {/* Quests Button */}
            <Link href="/quests" className={`${styles.navButton} ${isActive('/quests') ? styles.navButtonActive : ''}`}>
              <Image
                src="/icons/Teleport.svg"
                alt="Quests"
                width={20}
                height={20}
                className={styles.questIcon}
              />
              <span className={isActive('/quests') ? styles.buttonLabelActive : styles.buttonLabel}>Quests</span>
            </Link>

            {/* Library Button - Disabled */}
            <div className={`${styles.navButton} ${styles.navButtonDisabled}`} title="Coming soon">
              <Image
                src="/icons/bookicon.svg"
                alt="Library"
                width={20}
                height={20}
                className={styles.questIcon}
              />
              <span className={styles.buttonLabelDisabled}>Library</span>
            </div>
          </div>

          {/* Right Icons */}
          <div className={styles.rightIcons}>
            <div className={styles.shardsCounter}>
              <Image
                src="/icons/shard.svg"
                alt="Shards"
                width={20}
                height={20}
                className={styles.shardIcon}
              />
              <span className={styles.shardsLabel}>Shards:</span>
              <span className={styles.shardsValue}>
                {shardCount !== null ? String(shardCount).padStart(3, '0') : '000'}
              </span>
            </div>
            {/* User Info */}
            {username && !username.startsWith('user_') && (
              <div className={styles.userInfo}>
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt={username}
                    width={32}
                    height={32}
                    className={styles.userAvatar}
                    unoptimized
                  />
                )}
                <span className={styles.username}>@{username}</span>
              </div>
            )}
            {/* Show incomplete profile message if username is temporary */}
            {username && username.startsWith('user_') && (
              <button
                className={styles.incompleteProfile}
                onClick={() => {
                  // Redirect to home page which will show avatar selection if needed
                  window.location.href = '/home';
                }}
                type="button"
              >
                <span>Complete Profile</span>
              </button>
            )}
            {/* Mobile Menu Toggle */}
            <button 
              className={styles.mobileMenuButton}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileLinksContainer}>
          <Link 
            href="/home" 
            className={`${styles.mobileNavButton} ${isActive('/home') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/icons/home.svg"
              alt="Home"
              width={20}
              height={20}
              className={styles.homeIcon}
            />
            <span>Home</span>
          </Link>
          <Link 
            href="/quests" 
            className={`${styles.mobileNavButton} ${isActive('/quests') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/icons/Teleport.svg"
              alt="Quests"
              width={20}
              height={20}
              className={styles.questIcon}
            />
            <span>Quests</span>
          </Link>
          <div 
            className={`${styles.mobileNavButton} ${styles.mobileNavButtonDisabled}`}
            title="Coming soon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/icons/bookicon.svg"
              alt="Library"
              width={20}
              height={20}
              className={styles.questIcon}
            />
            <span>Library</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

