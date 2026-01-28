'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import BookCard from '@/components/book-card/BookCard';
import SealedLibrary from '@/components/sealed-library/SealedLibrary';
import AngelMintSection from '@/components/angel-mint-section/AngelMintSection';
import MintModal from '@/components/mint-modal/MintModal';
import { LibraryPageSkeleton } from '@/components/skeleton/Skeleton';
import styles from './page.module.css';

// Library Info Modal Component
const LibraryInfoModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          Close
        </button>

        <div className={styles.modalContent}>
          <div className={styles.modalEmoji}>🍎</div>

          <h2 className={styles.modalTitle}>Your 12-Week Library</h2>
          <p className={styles.modalDescription}>
            This is your database for all pages in the 12-week journey, everything organized and ready for you here.
          </p>

          <button className={styles.modalCta} onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

const curatedBooks = [
  {
    title: 'How to make something great',
    author: 'By: Dr. Lina Ortiz, Ph.D.',
    description:
      'In the pantheon of creativity, wether product design, art, schiece, architecture, software, or some hybrid creature from the abyss of the mind\'s black hole, true greatness emerges not from one stroke of genius, but careful curation of the entire process.',
    category: 'Digital Research',
    imageUrl: 'https://images.unsplash.com/photo-1639628739763-3d4ada1a656a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y3liZXIlMjBwc3ljaG9sb2d5fGVufDB8fDB8fHww',
  },
  {
    title: 'Micro University?',
    author: 'By: Prof. Marcus Li, D.Phil.',
    description:
      'A rigorous theoretical and empirical analysis of governance mechanisms within academic decentralized autonomous organizations. This monograph synthesizes mechanism design theory, social choice theory, and institutional economics to evaluate the efficacy of quadratic voting protocols, reputation-weighted decision-making, and stewardship models in maintaining both democratic legitimacy and epistemic rigor within scholarly communities.',
    category: 'Decision-making',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1683977922495-3ab3ce7ba4e6?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'From Viral 2 Ethereal',
    author: 'By: Dr. Jhinn Bay, Ph.D.',
    description:
      'A critical examination of autonomous agents designed for systematic literature review, citation network analysis, and knowledge synthesis. This investigation employs both computational experiments and philosophical inquiry to delineate the boundaries between algorithmic summarization and genuine scholarly comprehension, addressing questions of epistemic authority, bias propagation, and the necessary conditions for human oversight in AI-augmented research workflows.',
    category: 'AI Tools',
    imageUrl: 'https://images.unsplash.com/photo-1580077910645-a6fd54032e15?w=900&auto=format&fit=crop&q=60',
  },
];

const communityBooks = [
  {
    title: 'Open Source Syllabus Design',
    author: 'Uploaded by: Dr. Kim',
    description:
      'Community-crafted templates for building reproducible, peer-audited course syllabi across STEM and humanities.',
    category: 'Week 1',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Field Notes: Bio Lab DAOs',
    author: 'Uploaded by: Saanvi P.',
    description:
      'A living notebook on standards, safety, and funding models emerging from decentralized bio labs.',
    category: 'Week 2',
    imageUrl: 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Citizen Science Review Stack',
    author: 'Uploaded by: Alex G.',
    description:
      'Tools, checklists, and protocols for validating community-sourced data and observations in environmental research.',
    category: 'Week 3',
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
  },
];


export default function Library() {
  const [activeTab, setActiveTab] = useState<'journey' | 'curated' | 'community'>('journey');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [showAzuraModal, setShowAzuraModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    // Show skeleton briefly, then reveal content
    const timer = setTimeout(() => {
      setIsContentLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const closeAzuraModal = useCallback(() => {
    setShowAzuraModal(false);
  }, []);

  const renderContent = () => {
    if (activeTab === 'journey') {
      return <SealedLibrary />;
    }

    const activeBooks = activeTab === 'curated' ? curatedBooks : communityBooks;
    return (
      <div className={`${styles.booksGrid} ${isLoaded ? styles.booksGridLoaded : ''}`}>
        {activeBooks.map((book, index) => (
          <div
            key={book.title}
            className={styles.bookCardWrapper}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <BookCard {...book} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={styles.pageLayout}>
        <SideNavigation />
        <main className={styles.page}>
          <section className={styles.papersSection}>
            {isContentLoading ? (
              <LibraryPageSkeleton />
            ) : (
              <>
                <div className={styles.tabs} ref={tabsRef}>
                  <button
                    className={`${styles.tabCard} ${activeTab === 'journey' ? styles.tabCardActive : ''}`}
                    onClick={() => setActiveTab('journey')}
                    type="button"
                    aria-pressed={activeTab === 'journey'}
                  >
                    <span className={styles.tabTitle}>Chapters</span>
                  </button>

                  <button
                    className={`${styles.tabCard} ${activeTab === 'curated' ? styles.tabCardActive : ''}`}
                    onClick={() => setActiveTab('curated')}
                    type="button"
                    aria-pressed={activeTab === 'curated'}
                  >
                    <span className={styles.tabTitle}>Readings</span>
                  </button>
                </div>

                {renderContent()}
              </>
            )}
          </section>
        </main>
      </div>
      <AngelMintSection onOpenMintModal={() => setShowMintModal(true)} />
      <MintModal isOpen={showMintModal} onClose={() => setShowMintModal(false)} />

      {/* Feed Azura Modal */}
      <LibraryInfoModal isVisible={showAzuraModal} onClose={closeAzuraModal} />
    </>
  );
}
