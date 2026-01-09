'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import BookCard from '@/components/book-card/BookCard';
import { Footer } from '@/components/footer/Footer';
import styles from './page.module.css';

const curatedBooks = [
  {
    title: 'Decentralized Research Networks',
    author: 'By: Lina Ortiz',
    description:
      'How open, tokenized research networks can accelerate collaboration, reduce paywalls, and preserve provenance for breakthrough science.',
    category: 'Web3 Research',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Governance in Academic DAOs',
    author: 'By: Marcus Li',
    description:
      'A review of quadratic voting, reputation weighting, and stewardship models that keep community-driven academic DAOs healthy and fair.',
    category: 'Governance',
    imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'AI Literature Review Agents',
    author: 'By: Priya Desai',
    description:
      'Evaluating autonomous agents that summarize, rank, and contextualize new papers—what works today and what needs human oversight.',
    category: 'AI Tools',
    imageUrl: 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=900&q=80',
  },
];

const communityBooks = [
  {
    title: 'Open Source Syllabus Design',
    author: 'Uploaded by: Dr. Kim',
    description:
      'Community-crafted templates for building reproducible, peer-audited course syllabi across STEM and humanities.',
    category: 'Community Upload',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Field Notes: Bio Lab DAOs',
    author: 'Uploaded by: Saanvi P.',
    description:
      'A living notebook on standards, safety, and funding models emerging from decentralized bio labs.',
    category: 'Community Upload',
    imageUrl: 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Citizen Science Review Stack',
    author: 'Uploaded by: Alex G.',
    description:
      'Tools, checklists, and protocols for validating community-sourced data and observations in environmental research.',
    category: 'Community Upload',
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
  },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState<'curated' | 'community'>('curated');
  const [isLoaded, setIsLoaded] = useState(false);
  const activeBooks = activeTab === 'curated' ? curatedBooks : communityBooks;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`${styles.heroContent} ${isLoaded ? styles.heroContentLoaded : ''}`}>
            <div className={styles.heroTitleWrapper}>
              <span className={styles.heroLabel}>Research Library</span>
              <h1 className={styles.heroTitle}>Knowledge Archive</h1>
            </div>
            <p className={styles.heroSubtitle}>
              Discover groundbreaking research, track your reading journey, and build a personal archive of academic insights.
            </p>
          </div>
          <div className={styles.heroDecorative} aria-hidden="true">
            <div className={styles.decorativeLine}></div>
            <div className={styles.decorativeLine}></div>
            <div className={styles.decorativeLine}></div>
          </div>
        </section>

        <section className={styles.papersSection}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabCard} ${
                activeTab === 'curated' ? styles.tabCardActive : ''
              }`}
              onClick={() => setActiveTab('curated')}
              type="button"
              aria-pressed={activeTab === 'curated'}
            >
              <div className={styles.tabIndicator}></div>
              <div className={styles.tabContent}>
                <span className={styles.tabTitle}>Curated</span>
                <span className={styles.tabSubtitle}>Expert-selected research</span>
              </div>
            </button>

            <button
              className={`${styles.tabCard} ${
                activeTab === 'community' ? styles.tabCardActive : ''
              }`}
              onClick={() => setActiveTab('community')}
              type="button"
              aria-pressed={activeTab === 'community'}
            >
              <div className={styles.tabIndicator}></div>
              <div className={styles.tabContent}>
                <span className={styles.tabTitle}>Community</span>
                <span className={styles.tabSubtitle}>Peer-shared knowledge</span>
              </div>
            </button>
          </div>

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
        </section>
      </main>
      <Footer />
    </>
  );
}
