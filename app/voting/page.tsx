'use client';

import { useState, useEffect } from 'react';
import { providers } from 'ethers';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import Link from 'next/link';
import StillTutorial, { TutorialStep } from '@/components/still-tutorial/StillTutorial';
import { AzuraPowerIndicator } from '@/components/soul-gems/SoulGemDisplay';
import TreasuryDisplay from '@/components/treasury-display/TreasuryDisplay';
import VoteProgressBar from '@/components/vote-progress/VoteProgressBar';
import VoteButtons from '@/components/vote-buttons/VoteButtons';
import { 
  fetchAllProposals, 
  getVotingProgress,
  OnChainProposal,
  formatTokenAmount,
  ProposalStatus
} from '@/lib/azura-contract';
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

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS || '0x2cbb90a761ba64014b811be342b8ef01b471992d';
const GOV_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS || '0x84939fEc50EfdEDC8522917645AAfABFd5b3EA6F';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base mainnet USDC
const AZURA_ADDRESS = '0x0920553CcA188871b146ee79f562B4Af46aB4f8a';
const TOTAL_SUPPLY = '100000'; // 100k tokens

export default function VotingPage() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [proposals, setProposals] = useState<OnChainProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // Connect to blockchain to read proposals
      if (typeof window.ethereum !== 'undefined') {
        const provider = new providers.Web3Provider(window.ethereum);
        const onChainProposals = await fetchAllProposals(CONTRACT_ADDRESS, provider);
        setProposals(onChainProposals);
      } else {
        setError('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError('Failed to load proposals from blockchain');
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

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {/* Azura Power Indicator */}
            <AzuraPowerIndicator 
              soulGems="40000"
              walletAddress={AZURA_ADDRESS}
              governanceTokenAddress={GOV_TOKEN_ADDRESS}
            />

            {/* Treasury Display */}
            <TreasuryDisplay
              contractAddress={CONTRACT_ADDRESS}
              usdcAddress={USDC_ADDRESS}
            />
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
            ) : error ? (
              <div className={styles.errorState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>Error Loading Proposals</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton}>
                  Retry
                </button>
              </div>
            ) : (
              <div className={styles.proposalsGrid} data-tutorial-target="submission">
                {proposals.map((proposal) => {
                  const onChainProposal = proposal as OnChainProposal;
                  return (
                    <div key={onChainProposal.id} className={styles.proposalCardWrapper}>
                      <div className={styles.proposalHeader}>
                        <h3 className={styles.proposalTitle}>{onChainProposal.title}</h3>
                        <span className={styles.proposalId}>#{onChainProposal.id}</span>
                      </div>
                      
                      <VoteProgressBar
                        forVotes={formatTokenAmount(onChainProposal.forVotes)}
                        againstVotes={formatTokenAmount(onChainProposal.againstVotes)}
                        totalSupply={TOTAL_SUPPLY}
                        threshold={50}
                      />
                      
                      <div className={styles.proposalMeta}>
                        <span>Azura Level: ⭐ x {onChainProposal.azuraLevel}</span>
                        <a 
                          href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewOnChain}
                        >
                          View on BaseScan
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </a>
                      </div>
                      
                      {onChainProposal.status === ProposalStatus.Active && !onChainProposal.executed && (
                        <VoteButtons
                          proposalId={onChainProposal.id}
                          contractAddress={CONTRACT_ADDRESS}
                          onVoted={fetchProposals}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
