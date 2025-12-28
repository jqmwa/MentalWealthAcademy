'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import styles from './Navbar.module.css';

// Menu Icon Component
const MenuIcon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.menuIcon}>
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { authenticated, ready } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shardCount, setShardCount] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch user data only when authenticated
  useEffect(() => {
    if (!ready || !authenticated) {
      setShardCount(null);
      setUsername(null);
      setAvatarUrl(null);
      return;
    }

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
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setShardCount(0);
        setUsername(null);
        setAvatarUrl(null);
      }
    };

    fetchUserData();

    // Listen for shard updates
    const handleShardsUpdate = () => {
      fetchUserData();
    };
    window.addEventListener('shardsUpdated', handleShardsUpdate);

    return () => {
      window.removeEventListener('shardsUpdated', handleShardsUpdate);
    };
  }, [authenticated, ready]);

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
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
            {authenticated && username && (
              <div className={styles.userInfo}>
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt={username}
                    width={32}
                    height={32}
                    className={styles.userAvatar}
                  />
                )}
                <span className={styles.username}>@{username}</span>
              </div>
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

