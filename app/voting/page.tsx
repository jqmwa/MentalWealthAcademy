'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import Link from 'next/link';
import StillTutorial, { TutorialStep } from '@/components/still-tutorial/StillTutorial';
import ProposalCard from '@/components/proposal-card/ProposalCard';
import styles from './page.module.css';

interface Proposal {
  id: string;
  title: string;
  proposalMarkdown: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'completed';
  walletAddress: string;
  createdAt: string;
  user: {
    username: string | null;
    avatarUrl: string | null;
  };
  review: {
    decision: 'approved' | 'rejected';
    reasoning: string;
    tokenAllocation: number | null;
    scores: any;
    reviewedAt: string;
  } | null;
}

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
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/voting/proposals');
      const data = await response.json();
      
      if (data.ok && data.proposals) {
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenAdminTutorial', 'true');
    setShowTutorial(false);
  };

  const handleViewDetails = (proposalId: string) => {
    // TODO: Navigate to proposal details page or open modal
    console.log('View proposal:', proposalId);
    alert('Proposal details view coming soon!');
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
          <div className={styles.hero}>
            <div className={styles.breadcrumbs}>
              <Link href="/home">Home</Link>
              <span className={styles.chevron}>/</span>
              <span className={styles.current}>Voting</span>
            </div>

            <header className={styles.header}>
              <p className={styles.eyebrow}>MWA • Decision Room</p>
              <h1 className={styles.title}>Funding Lab</h1>
              <p className={styles.subtitle}>
                Every decision and submission from our community finds its way here. The Azura agent thoughtfully manages a 40% holding of voting tokens, carefully reviewing and adding votes to proposals. Users can seek grants, stipends, and other supportive resources.
              </p>
              <div className={styles.heroActions}>
                <Link href="/voting/create" className={styles.primaryCta}>
                  Submit Form
                </Link>
                <button
                  className={styles.secondaryCta}
                  onClick={() => setShowTutorial(true)}
                  type="button"
                >
                  Tutorial
                </button>
              </div>
            </header>
          </div>

          {/* Proposals Section */}
          <section className={styles.proposalsSection}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading proposals...</p>
              </div>
            ) : proposals.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>No proposals yet</h3>
                <p>Be the first to submit a proposal to the community!</p>
                <Link href="/voting/create" className={styles.createFirstButton}>
                  Create First Proposal
                </Link>
              </div>
            ) : (
              <div className={styles.proposalsGrid} data-tutorial-target="submission">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    {...proposal}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
