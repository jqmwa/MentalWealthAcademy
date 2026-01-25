'use client';

import React, { useState, useEffect } from 'react';
import ChapterCard, { ChapterData } from './ChapterCard';
import ChapterDetail from './ChapterDetail';
import styles from './SealedLibrary.module.css';

const SealedLibrary: React.FC = () => {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterData | null>(null);
  const [gridLoaded, setGridLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/library/chapters', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }

      const data = await response.json();
      setChapters(data.chapters || []);
      setIsAuthenticated(data.authenticated || false);

      // Trigger grid animation after data loads
      setTimeout(() => setGridLoaded(true), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter: ChapterData) => {
    if (!isAuthenticated) {
      // Redirect to login or show sign-in prompt
      window.location.href = '/';
      return;
    }
    if (chapter.status !== 'locked') {
      setSelectedChapter(chapter);
    }
  };

  const handleCloseDetail = () => {
    setSelectedChapter(null);
    // Refresh chapters to get updated progress
    fetchChapters();
  };

  const handleChapterComplete = () => {
    // Refresh chapters when a chapter is unsealed
    fetchChapters();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading your journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryButton} onClick={fetchChapters} type="button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>The Sealed Library</h2>
        <p className={styles.sectionDescription}>
          {isAuthenticated
            ? 'Complete 7 days of writing to unseal each chapter. Your journey of self-discovery awaits.'
            : 'A 12-week journey of self-discovery through daily writing. Sign in to begin your transformation.'}
        </p>
      </div>

      {!isAuthenticated && (
        <div className={styles.signInBanner}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerIcon}>✦</span>
            <span className={styles.bannerText}>Sign in to track your progress and unlock chapters</span>
          </div>
          <a href="/" className={styles.bannerButton}>
            Get Started
          </a>
        </div>
      )}

      <div className={`${styles.chaptersGrid} ${gridLoaded ? styles.gridLoaded : ''}`}>
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            className={styles.cardWrapper}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <ChapterCard
              chapter={chapter}
              onClick={() => handleChapterClick(chapter)}
            />
          </div>
        ))}
      </div>

      {/* Chapter Detail Modal */}
      {selectedChapter && isAuthenticated && (
        <ChapterDetail
          chapterId={selectedChapter.id}
          onClose={handleCloseDetail}
          onChapterComplete={handleChapterComplete}
        />
      )}
    </div>
  );
};

export default SealedLibrary;
