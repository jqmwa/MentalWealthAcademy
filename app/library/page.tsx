'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import BookCard from '@/components/book-card/BookCard';
import { Footer } from '@/components/footer/Footer';
import { AccountBanner } from '@/components/forum/AccountBanner';
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
  const activeBooks = activeTab === 'curated' ? curatedBooks : communityBooks;

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Your Academic Research Library</h1>
            <p className={styles.heroSubtitle}>
              Discover papers, track what you&apos;re reading, rate and review.
              <br />
              Build a library that grows with your curiosity.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primaryCta}>Get Started</button>
              <button className={styles.secondaryCta}>Explore Papers</button>
            </div>
          </div>
          <div className={styles.heroGlow} />
        </section>

        <div className={styles.accountBannerWrap}>
          <AccountBanner />
        </div>

        <section className={styles.papersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Papers</h2>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tabCard} ${
                activeTab === 'curated' ? styles.tabCardActive : ''
              }`}
              onClick={() => setActiveTab('curated')}
              type="button"
            >
              <div className={styles.tabBadge}>Staff Curated</div>
              <div className={styles.tabTextGroup}>
                <span className={styles.tabTitle}>Library Picks</span>
                <span className={styles.tabSubtitle}>Expert-reviewed, high-signal reads</span>
              </div>
            </button>

            <button
              className={`${styles.tabCard} ${
                activeTab === 'community' ? styles.tabCardActive : ''
              }`}
              onClick={() => setActiveTab('community')}
              type="button"
            >
              <div className={styles.tabBadge}>Community</div>
              <div className={styles.tabTextGroup}>
                <span className={styles.tabTitle}>Community Uploads</span>
                <span className={styles.tabSubtitle}>Peer-shared papers and field notes</span>
              </div>
            </button>
          </div>

          <div className={styles.booksGrid}>
            {activeBooks.map((book) => (
              <BookCard key={book.title} {...book} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
