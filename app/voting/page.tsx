'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import Link from 'next/link';
import StillTutorial, { TutorialStep } from '@/components/still-tutorial/StillTutorial';
import VotingStages from '@/components/voting-stages/VotingStages';
import styles from './page.module.css';

const communityAvatars = [
  { name: 'Nova', color: '#5B8DEF' },
  { name: 'Vale', color: '#7C8CFF' },
  { name: 'Rune', color: '#9F8CFF' },
  { name: 'Cyra', color: '#A5C8FF' },
  { name: 'Iris', color: '#6AD9FF' },
];

const getTutorialSteps = (): TutorialStep[] => [
  {
    message: 'Welcome to the Decision Room. I\'m Azura, your AI co-pilot. Here, every quest submission gets analyzed—not just for completion, but for the patterns it reveals about behavior and governance.',
    emotion: 'happy',
  },
  {
    message: 'This is where I work. I read each submission, identify the underlying patterns, and draft recommendations. Think of me as a co-pilot—I highlight what matters, but you make the final call.',
    emotion: 'happy',
    targetElement: '[data-tutorial-target="voting-stages"]',
  },
  {
    message: 'The Voting Room is where human judgment meets algorithmic analysis. You debate, question, and decide. I\'m here to clarify evidence and surface biases you might miss.',
    emotion: 'happy',
    targetElement: '[data-tutorial-target="admin-room"]',
  },
  {
    message: 'Each submission tells a story. Look beyond the proof—what patterns does it reveal? How does it shape belief? These are the questions that matter in building better systems.',
    emotion: 'confused',
    targetElement: '[data-tutorial-target="submission"]',
  },
  {
    message: 'Remember: we\'re not just approving quests. We\'re exposing how enframent shapes behavior and building agentic systems that question assumptions. Every decision here shapes the future.',
    emotion: 'happy',
  },
];

export default function VotingPage() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen the admin tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenAdminTutorial');
    if (!hasSeenTutorial) {
      // Small delay to ensure page is rendered
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenAdminTutorial', 'true');
    setShowTutorial(false);
  };

  return (
    <>
      <Navbar />
      <StillTutorial
        steps={getTutorialSteps()}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
        title="Voting Guide"
        showProgress={true}
      />
      <main className={styles.page}>
        <div className={styles.content}>
          <div className={styles.breadcrumbs}>
            <Link href="/home">Home</Link>
            <span className={styles.chevron}>/</span>
            <span className={styles.current}>Voting</span>
          </div>

          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>MWA • Decision Room</p>
              <h1 className={styles.title}>Funding Lab</h1>
              <p className={styles.subtitle}>
                Every decision and submission from our community finds its way here. The Azura agent thoughtfully manages a significant number of voting tokens, carefully reviewing each proposal to ensure only the most beneficial ones are chosen. This is a welcoming space where users can seek grants, stipends, and other supportive resources.
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.howItWorksButton}
                onClick={() => setShowTutorial(true)}
                type="button"
              >
                Tutorial
              </button>
              <div className={styles.badge}>Live</div>
            </div>
          </header>

          <section className={styles.votingStagesSection} data-tutorial-target="voting-stages">
            <VotingStages 
              stage={1} 
              variants={['waiting', 'authenticated', 'kill']} 
            />
          </section>

          <section className={styles.submissionCard} data-tutorial-target="submission">
            <div className={styles.submissionHeader}>
              <div className={styles.submissionHeaderContent}>
                <div className={styles.submissionHeaderLeft}>
                  <span className={styles.submissionEyebrow}>Submission</span>
                  <h3 className={styles.submissionTitle}>Funding For Mental Health Resources</h3>
                </div>
                <div className={styles.statusPill}>
                  <span className={styles.statusDot}></span>
                  Awaiting member review
                </div>
              </div>
            </div>

            <div className={styles.submissionMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Submitted by</span>
                <span className={styles.metaValue}>@riverstone_wellness</span>
                <span className={styles.metaSeparator}> • </span>
                <span className={styles.metaTime}>12 hours ago</span>
              </div>
              <div className={styles.metaDivider}></div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Azura&apos;s review</span>
                <span className={styles.metaValue}>Mental Health Stipend</span>
              </div>
              <div className={styles.metaDivider}></div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Proof</span>
                <Link href="#" className={styles.metaLink}>
                  View attachment
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.83333 2.33333H11.6667V8.16667M2.33333 11.6667L11.6667 2.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>

            <div className={styles.submissionBody}>
              <div className={styles.submissionQuote}>
                <svg className={styles.quoteIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21C3 17.4 5.4 15 9 15V12C9 11.4 9.4 11 10 11H13C13.6 11 14 11.4 14 12V21C14 21.6 13.6 22 13 22H4C3.4 22 3 21.6 3 21Z" fill="currentColor" opacity="0.15"/>
                  <path d="M10 21C10 17.4 12.4 15 16 15V12C16 11.4 16.4 11 17 11H20C20.6 11 21 11.4 21 12V21C21 21.6 20.6 22 20 22H11C10.4 22 10 21.6 10 21Z" fill="currentColor" opacity="0.15"/>
                </svg>
                <p className={styles.submissionText}>
                  I&apos;ve been working in community mental health for over eight years, and I&apos;ve seen firsthand how cyber-psychology and digital wellness programs can transform lives—when they&apos;re built on a foundation of genuine human connection. This proposal seeks funding to develop peer support networks that prioritize authentic relationships over transactional interactions. We&apos;re not looking to scale quickly; we want to build something that truly serves our community&apos;s needs before expanding. Every dollar would go directly toward training facilitators and creating safe spaces where people can be heard and supported. I&apos;d be honored to have your consideration.
                </p>
              </div>
            </div>

            <div className={styles.submissionFooter}>
              <div className={styles.submissionFooterLeft}>
                <div className={styles.reviewersSection}>
                  <span className={styles.reviewersLabel}>Under review by</span>
                  <div className={styles.avatarRow}>
                    {communityAvatars.slice(0, 3).map((avatar, index) => (
                      <span
                        key={avatar.name}
                        className={styles.avatarSmall}
                        style={{ 
                          background: avatar.color, 
                          zIndex: communityAvatars.length - index,
                          marginLeft: index > 0 ? '-8px' : '0'
                        }}
                        aria-label={avatar.name}
                        title={avatar.name}
                      >
                        {avatar.name[0]}
                      </span>
                    ))}
                    <span className={styles.moreReviewers}>+2</span>
                  </div>
                </div>
              </div>
              <div className={styles.submissionActions}>
                <button className={styles.secondaryButton} type="button">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.33333V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Request edit
                </button>
                <button className={styles.primaryButton} type="button">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Approve & publish
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
