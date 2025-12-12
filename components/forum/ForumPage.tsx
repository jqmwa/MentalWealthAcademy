'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ForumPage.module.css';
import { AccountBanner } from './AccountBanner';
import { ForumCard } from './ForumCard';
import { Footer } from '@/components/footer/Footer';
import { PixelIcon } from './PixelIcon';

export function ForumPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<
    Array<{
      id: string;
      slug: string;
      name: string;
      description: string | null;
      threads: number;
      posts: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/forum/categories', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setCategories(Array.isArray(data?.categories) ? data.categories : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const community = new Set(['general-discussion', 'design', 'education', 'art']);
    return {
      community: categories.filter((c) => community.has(c.slug)),
      daemon: categories.filter((c) => !community.has(c.slug)),
    };
  }, [categories]);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Community Forum</h1>
          <p className={styles.heroSubtitle}>
            Join discussions, share insights, and connect with the community.
            <br />
            Explore threads on quests, proposals, and general topics.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.primaryCta}
              type="button"
              onClick={() => router.push('/forum/general-discussion')}
            >
              Start Discussion
            </button>
            <button
              className={styles.secondaryCta}
              type="button"
              onClick={() => router.push('/forum/general-discussion')}
            >
              Browse Threads
            </button>
          </div>
        </div>
        <div className={styles.heroGlow} />
      </section>

      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <AccountBanner />

          <div className={styles.forumHeaders}>
            <div className={styles.headerLabel}>Threads</div>
            <div className={styles.headerLabel}>Posts</div>
          </div>

          <div className={styles.forumContent}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryTitle}>Community</div>
            </div>

            {loading && <div style={{ opacity: 0.7, padding: '12px 0' }}>Loading…</div>}

            {!loading &&
              groups.community.map((c) => (
                <ForumCard
                  key={c.id}
                  title={c.name}
                  description={c.description || ''}
                  threads={c.threads}
                  posts={c.posts}
                  href={`/forum/${c.slug}`}
                  icon={<PixelIcon />}
                />
              ))}

            <div className={styles.categoryHeader}>
              <div className={styles.categoryTitle}>Daemon Database</div>
            </div>

            {!loading &&
              groups.daemon.map((c) => (
                <ForumCard
                  key={c.id}
                  title={c.name}
                  description={c.description || ''}
                  threads={c.threads}
                  posts={c.posts}
                  href={`/forum/${c.slug}`}
                  icon={<PixelIcon />}
                />
              ))}
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

