'use client';

import React from 'react';
import styles from './ForumPage.module.css';
import { Navbar } from './Navbar';
import { AnnouncementBanner } from './AnnouncementBanner';
import { InviteBanner } from './InviteBanner';
import { ForumCard } from './ForumCard';
import { Footer } from './Footer';
import { PixelIcon } from './PixelIcon';

export function ForumPage() {
  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <div className={styles.breadcrumb}>
              <h1 className={styles.breadcrumbText}>
                Community Home &gt; Threads
              </h1>
            </div>

            <button className={styles.viewToggle}>
              Expressive View
              <span className={styles.toggleIcon}>⇅</span>
            </button>
          </div>

          <AnnouncementBanner />
          <InviteBanner />

          <div className={styles.forumHeaders}>
            <div className={styles.headerLabel}>Threads</div>
            <div className={styles.headerLabel}>Posts</div>
          </div>

          <div className={styles.forumContent}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryTitle}>
                Daemon Database
              </div>
            </div>

            <ForumCard
              title="Quest Discussions"
              description="Discuss ongoing proposals and public goods, contribute to the ethos and conversation by sharing your valuable insight with the ecosystem."
              badge={{ text: 'Public', variant: 'default' }}
              icon={<PixelIcon />}
            />

            <ForumCard
              title="Token Talk"
              description="Best practices for organizing your proposals and pitches."
              badge={{ text: '500 $DAEMON', variant: 'cyan' }}
              icon={<PixelIcon />}
            />

            <div className={styles.categoryHeader}>
              <div className={styles.categoryTitle}>
                General Discussion
              </div>
            </div>

            <ForumCard
              title="General Discussion"
              description="Discuss ongoing events and upcoming cleanup projects, share experiences from past events."
              badge={{ text: 'Public', variant: 'default' }}
              icon={<PixelIcon />}
            />

            <ForumCard
              title="General Discussion"
              description="Discuss ongoing events and upcoming cleanup projects, share experiences from past events."
              badge={{ text: 'Members', variant: 'default' }}
              icon={<PixelIcon />}
            />

            <ForumCard
              title="General Discussion"
              description="Discuss ongoing events and upcoming cleanup projects, share experiences from past events."
              badge={{ text: 'Members', variant: 'default' }}
              icon={<PixelIcon />}
            />

            <ForumCard
              title="General Discussion"
              description="Discuss ongoing events and upcoming cleanup projects, share experiences from past events."
              badge={{ text: 'Members', variant: 'default' }}
              icon={<PixelIcon />}
            />
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

