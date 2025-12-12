'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

// Notification Icon Component
const NotificationIcon: React.FC<{ size?: number }> = ({ size = 36 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.notificationIcon}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(17, 25, 40, 1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(17, 25, 40, 1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="12" x2="9" y2="12" stroke="rgba(17, 25, 40, 1)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="15" x2="9" y2="15" stroke="rgba(17, 25, 40, 1)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
                src="/uploads/NEWLOGO.png"
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

            {/* Daemon Button */}
            <Link href="/daemon" className={`${styles.navButton} ${isActive('/daemon') ? styles.navButtonActive : ''}`}>
              <Image
                src="/icons/daemon.svg"
                alt="Daemon"
                width={20}
                height={20}
                className={styles.questIcon}
              />
              <span className={isActive('/daemon') ? styles.buttonLabelActive : styles.buttonLabel}>Daemon</span>
            </Link>

            {/* Forum Button */}
            <Link href="/forum" className={`${styles.navButton} ${isActive('/forum') ? styles.navButtonActive : ''}`}>
              <Image
                src="/icons/Survey.svg"
                alt="Forum"
                width={20}
                height={20}
                className={styles.questIcon}
              />
              <span className={isActive('/forum') ? styles.buttonLabelActive : styles.buttonLabel}>Forum</span>
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

          {/* Library Button */}
          <Link href="/library" className={`${styles.navButton} ${isActive('/library') ? styles.navButtonActive : ''}`}>
              <Image
                src="/icons/bookicon.svg"
                alt="Library"
                width={20}
                height={20}
                className={styles.questIcon}
              />
            <span className={isActive('/library') ? styles.buttonLabelActive : styles.buttonLabel}>Library</span>
            </Link>
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
              <span className={styles.shardsValue}>000</span>
            </div>
            <button className={styles.messageButton} title="Messages">
              <div className={styles.messageIcon}>
                <span className={styles.notificationDot}></span>
              </div>
            </button>
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
            href="/daemon" 
            className={`${styles.mobileNavButton} ${isActive('/daemon') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/icons/daemon.svg"
              alt="Daemon"
              width={20}
              height={20}
              className={styles.questIcon}
            />
            <span>Daemon</span>
          </Link>
          <Link 
            href="/forum" 
            className={`${styles.mobileNavButton} ${isActive('/forum') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/icons/Survey.svg"
              alt="Forum"
              width={20}
              height={20}
              className={styles.questIcon}
            />
            <span>Forum</span>
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
          <Link 
            href="/library" 
            className={`${styles.mobileNavButton} ${isActive('/library') ? styles.mobileNavButtonActive : ''}`}
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
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

