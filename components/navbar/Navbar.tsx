'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
import YourAccountsModal from '@/components/nav-buttons/YourAccountsModal';
import styles from './Navbar.module.css';

// Menu Icon Component - Chunky Y2K style
const MenuIcon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.menuIcon}>
      <rect x="3" y="5" width="18" height="3" rx="1" fill="currentColor"/>
      <rect x="3" y="10.5" width="18" height="3" rx="1" fill="currentColor"/>
      <rect x="3" y="16" width="18" height="3" rx="1" fill="currentColor"/>
    </svg>
  );
};

// Home Icon - Simple planet with rings Y2K style
const HomeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Central planet */}
      <circle cx="12" cy="12" r="7" fill="currentColor"/>
      {/* Ring behind */}
      <ellipse cx="12" cy="12" rx="11" ry="3.5" fill="currentColor" fillOpacity="0.4"/>
      {/* Inner detail */}
      <circle cx="9" cy="10" r="2" fill="currentColor" fillOpacity="0.3"/>
      <circle cx="15" cy="14" r="1.5" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  );
};

// Quests Icon - Glowing star/beacon Y2K style
const QuestsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* 4-pointed star - main structure */}
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
      {/* 4-pointed star - smaller angled */}
      <path d="M12 6L13 10L17 11L13 12L12 16L11 12L7 11L11 10L12 6Z" fill="currentColor" fillOpacity="0.5"/>
      {/* Center dot */}
      <circle cx="12" cy="11" r="2" fill="currentColor"/>
      {/* Sparkle details */}
      <circle cx="8" cy="6" r="1" fill="currentColor"/>
      <circle cx="16" cy="6" r="1" fill="currentColor"/>
      <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
  );
};

// Voting Icon - Checkmark document Y2K style
const VotingIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Document base */}
      <rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor"/>
      {/* Checkmark - solid triangular shape */}
      <path d="M8 11L10 13L11 14L16 9L15 8L10.5 12L9 10.5L8 11Z" fill="currentColor" fillOpacity="0.4"/>
      {/* Lines for document detail */}
      <rect x="8" y="6" width="8" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.3"/>
      <rect x="8" y="16" width="6" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  );
};

// Library Icon - Stacked books Y2K style
const LibraryIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Book 1 - back left */}
      <rect x="3" y="10" width="6" height="10" rx="1" fill="currentColor" fillOpacity="0.5"/>
      {/* Book 2 - middle */}
      <rect x="8" y="8" width="6" height="12" rx="1" fill="currentColor" fillOpacity="0.7"/>
      {/* Book 3 - front right */}
      <rect x="13" y="6" width="6" height="14" rx="1" fill="currentColor"/>
      {/* Page lines on front book */}
      <rect x="15" y="9" width="2" height="1" rx="0.5" fill="currentColor" fillOpacity="0.3"/>
      <rect x="15" y="12" width="2" height="1" rx="0.5" fill="currentColor" fillOpacity="0.3"/>
      <rect x="15" y="15" width="2" height="1" rx="0.5" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  );
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isYourAccountsModalOpen, setIsYourAccountsModalOpen] = useState(false);
  const [shardCount, setShardCount] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user data - works for both Privy and session-based auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Include wallet auth headers if wallet is connected
        const headers: HeadersInit = {};
        if (isConnected && address) {
          Object.assign(headers, getWalletAuthHeaders(address));
        }
        
        const response = await fetch('/api/me', { 
          cache: 'no-store',
          headers
        });
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

    // Fetch immediately and also when wallet connection state changes
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
  }, [isConnected, address]); // Refetch when wallet connection state changes

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileDropdownOpen]);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleYourAccountsClick = () => {
    setIsProfileDropdownOpen(false);
    setIsYourAccountsModalOpen(true);
  };

  const handleSignOut = async () => {
    setIsProfileDropdownOpen(false);
    
    // Disconnect wallet if connected
    if (isConnected) {
      disconnect();
    }
    
    // Clear session
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to logout:', err);
    }
    
    // Clear local state
    setShardCount(null);
    setUsername(null);
    setAvatarUrl(null);
    
    // Redirect to landing page
    router.push('/');
  };


  return (
    <nav className={styles.navbar}>
      {/* Top Section */}
      <div className={styles.topSection}>
        <div className={styles.leftContent}>
          <Link href="/home" className={styles.brandLink} aria-label="Mental Wealth Academy">
            <div className={styles.logoWrapper}>
              <Image
                src="/icons/spacey2klogo.png"
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
              <HomeIcon size={20} className={styles.homeIcon} />
              <span className={isActive('/home') ? styles.buttonLabelActive : styles.buttonLabel}>Home</span>
            </Link>

            {/* Quests Button */}
            <Link href="/quests" className={`${styles.navButton} ${isActive('/quests') ? styles.navButtonActive : ''}`}>
              <QuestsIcon size={20} className={styles.questIcon} />
              <span className={isActive('/quests') ? styles.buttonLabelActive : styles.buttonLabel}>Quests</span>
            </Link>

            {/* Voting Button */}
            <Link href="/voting" className={`${styles.navButton} ${isActive('/voting') ? styles.navButtonActive : ''}`}>
              <VotingIcon size={20} className={styles.questIcon} />
              <span className={isActive('/voting') ? styles.buttonLabelActive : styles.buttonLabel}>Voting</span>
            </Link>

            {/* Library Button */}
            <Link href="/library" className={`${styles.navButton} ${isActive('/library') ? styles.navButtonActive : ''}`}>
              <LibraryIcon size={20} className={styles.questIcon} />
              <span className={isActive('/library') ? styles.buttonLabelActive : styles.buttonLabel}>Library</span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className={styles.rightIcons}>
            {/* Message Button */}
            <Link href="/forum" className={styles.messageButton} aria-label="Messages">
              <div className={styles.messageIcon}>
                <span className={styles.notificationDot}></span>
              </div>
            </Link>
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
            {/* User Info Dropdown */}
            {username && !username.startsWith('user_') && (
              <div className={styles.profileDropdownWrapper} ref={profileDropdownRef}>
                <div 
                  className={`${styles.profileDropdownDimmer} ${isProfileDropdownOpen ? styles.active : ''}`}
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <button 
                  className={`${styles.userInfo} ${isProfileDropdownOpen ? styles.userInfoOpen : ''}`}
                  onClick={handleProfileClick}
                  type="button"
                >
                  {avatarUrl && (
                    <div className={styles.userAvatarContainer}>
                      <Image
                        src={avatarUrl}
                        alt={username}
                        width={32}
                        height={32}
                        className={styles.userAvatar}
                        unoptimized
                      />
                      <Image
                        src={avatarUrl}
                        alt={username}
                        width={32}
                        height={32}
                        className={styles.userAvatarClone}
                        unoptimized
                      />
                    </div>
                  )}
                  <span className={styles.username}>@{username}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileDropdownContent}>
                      <Link 
                        href="/home" 
                        className={styles.profileLink}
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div className={styles.miniProfileCard}>
                          {avatarUrl && (
                            <div className={styles.miniProfilePicture}>
                              <Image
                                src={avatarUrl}
                                alt={username}
                                width={48}
                                height={48}
                                className={styles.miniProfileImage}
                                unoptimized
                              />
                            </div>
                          )}
                          <div className={styles.miniProfileInfo}>
                            <span className={styles.miniProfileName}>{username}</span>
                            <span className={styles.miniProfileLabel}>view profile</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className={styles.profileDropdownMenu}>
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleYourAccountsClick}
                        type="button"
                      >
                        <div className={styles.dropdownItemInfo}>
                          <span className={styles.dropdownItemTitle}>accounts</span>
                          <span className={styles.dropdownItemLabel}>manage connections</span>
                        </div>
                      </button>
                      <div className={styles.dropdownDivider} />
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleSignOut}
                        type="button"
                      >
                        <div className={styles.dropdownItemInfo}>
                          <span className={styles.dropdownItemTitle}>sign out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
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
            <HomeIcon size={20} className={styles.homeIcon} />
            <span>Home</span>
          </Link>
          <Link 
            href="/quests" 
            className={`${styles.mobileNavButton} ${isActive('/quests') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <QuestsIcon size={20} className={styles.questIcon} />
            <span>Quests</span>
          </Link>
          <Link 
            href="/voting" 
            className={`${styles.mobileNavButton} ${isActive('/voting') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <VotingIcon size={20} className={styles.questIcon} />
            <span>Voting</span>
          </Link>
          <Link 
            href="/library" 
            className={`${styles.mobileNavButton} ${isActive('/library') ? styles.mobileNavButtonActive : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LibraryIcon size={20} className={styles.questIcon} />
            <span>Library</span>
          </Link>
        </div>
      </div>
      {isYourAccountsModalOpen && (
        <YourAccountsModal onClose={() => setIsYourAccountsModalOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;

