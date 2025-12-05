'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { ForumRulesModal } from './ForumRulesModal';

export function Navbar() {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Forum', href: '/forum' },
    { label: 'Quests', href: '/quests' },
    { label: 'Catalog', href: '/catalog' },
  ];

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.leftSection}>
          <div className={styles.brandSection}>
            <h1 className={styles.brandTitle}>Mental Wealth Academy</h1>

            <nav className={styles.navTabs}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navTab} ${
                    pathname === item.href ? styles.navTabActive : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={styles.icons}>
              <button className={styles.iconButton} title="Coming soon">
                <div className={styles.messageIcon}>
                  <span className={styles.notificationDot}></span>
                </div>
              </button>

              <button
                onClick={() => setIsRulesModalOpen(true)}
                className={styles.iconButton}
                title="Forum Rules"
              >
                <div className={styles.listIcon}></div>
              </button>
            </div>
          </div>
        </div>

        <button className={styles.connectButton}>
          Connect Wallet
        </button>
      </div>

      <ForumRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </>
  );
}

