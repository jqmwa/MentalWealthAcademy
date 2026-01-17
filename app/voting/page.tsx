'use client';

import { useState, useEffect } from 'react';
import { providers } from 'ethers';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import StillTutorial, { TutorialStep } from '@/components/still-tutorial/StillTutorial';
import { AzuraPowerIndicator } from '@/components/soul-gems/SoulGemDisplay';
import TreasuryDisplay from '@/components/treasury-display/TreasuryDisplay';
import VoteProgressBar from '@/components/vote-progress/VoteProgressBar';
import VoteButtons from '@/components/vote-buttons/VoteButtons';
import ProposalCard from '@/components/proposal-card/ProposalCard';
import ProposalDetailsModal from '@/components/proposal-card/ProposalDetailsModal';
import SubmitProposalModal from '@/components/voting/SubmitProposalModal';
import PencilLoader from '@/components/landing/PencilLoader';
import { 
  fetchProposal,
  formatTokenAmount,
  ProposalStatus
} from '@/lib/azura-contract';
import styles from './page.module.css';

interface ProposalReview {
  decision: 'approved' | 'rejected';
  reasoning: string;
  tokenAllocation: number | null;
  scores: {
    clarity: number;
    impact: number;
    feasibility: number;
    budget: number;
    ingenuity: number;
    chaos: number;
  } | null;
  reviewedAt: string;
  onChainProposalId: string | null;
}

interface DatabaseProposal {
  id: string;
  title: string;
  proposalMarkdown: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'completed';
  walletAddress: string;
  createdAt: string;
  onChainProposalId: string | null;
  onChainTxHash: string | null;
  user: {
    username: string | null;
    avatarUrl: string | null;
  };
  review: ProposalReview | null;
}

interface MergedProposal extends DatabaseProposal {
  onChainData?: {
    forVotes: string;
    againstVotes: string;
    votingDeadline: number;
    azuraLevel: number;
    executed: boolean;
  };
}

const getTutorialSteps = (): TutorialStep[] => [
  {
    message: 'Welcome to the Decision Room. I\'m Azura. This is where proposals come to be judged. I hold 40% of the voting power, which means I can kill proposals before they reach you. Or I can let them live.',
    emotion: 'happy',
  },
  {
    message: 'When someone submits a proposal, I read it. I look for clarity, impact, feasibility. I score it. If it passes, I create it on-chain and cast my vote. If it fails, I kill it. Simple.',
    emotion: 'happy',
    targetElement: '[data-tutorial-target="voting-stages"]',
  },
  {
    message: 'The community votes after I do. You debate. You decide. But remember: I\'ve already weighed in. My vote carries weight because I hold tokens. That\'s the system. That\'s the order.',
    emotion: 'happy',
    targetElement: '[data-tutorial-target="admin-room"]',
  },
  {
    message: 'Each proposal tells a story. Some deserve to live. Some deserve to die. I read the patterns. I make the call. Then you make yours. That\'s how we build together.',
    emotion: 'confused',
    targetElement: '[data-tutorial-target="submission"]',
  },
  {
    message: 'This room is about power and responsibility. I have power. You have none. So find someone to help you. That\'s the harmony. Welcome to the Decision Room.',
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
  const [proposals, setProposals] = useState<MergedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<MergedProposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch reviewed proposals from database
      const dbResponse = await fetch('/api/voting/proposals');
      if (!dbResponse.ok) {
        throw new Error('Failed to fetch proposals from database');
      }

      const dbData = await dbResponse.json();
      const dbProposals: DatabaseProposal[] = dbData.proposals || [];

      // For proposals with on_chain_proposal_id, fetch on-chain data
      const mergedProposals: MergedProposal[] = await Promise.all(
        dbProposals.map(async (proposal) => {
          // If proposal has on-chain ID and is active, fetch on-chain data
          if (
            proposal.review?.onChainProposalId &&
            (proposal.status === 'active' || proposal.status === 'completed')
          ) {
            try {
              // Try to fetch on-chain data if wallet is available
              if (typeof window.ethereum !== 'undefined') {
                const provider = new providers.Web3Provider(window.ethereum);
                const onChainProposal = await fetchProposal(
                  CONTRACT_ADDRESS,
                  parseInt(proposal.review.onChainProposalId),
                  provider
                );

                return {
                  ...proposal,
                  onChainData: {
                    forVotes: onChainProposal.forVotes,
                    againstVotes: onChainProposal.againstVotes,
                    votingDeadline: onChainProposal.votingDeadline,
                    azuraLevel: onChainProposal.azuraLevel,
                    executed: onChainProposal.executed,
                  },
                };
              }
            } catch (error) {
              console.error(`Error fetching on-chain data for proposal ${proposal.id}:`, error);
              // Continue without on-chain data
            }
          }

          return proposal as MergedProposal;
        })
      );

      setProposals(mergedProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenAdminTutorial', 'true');
    setShowTutorial(false);
  };

  const handleViewDetails = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setIsModalOpen(true);
    }
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
            <header className={`${styles.header} ${isLoaded ? styles.headerLoaded : ''}`}>
              <div className={styles.headerContent}>
                <div>
              <p className={styles.eyebrow}>MWA • Academy Decisions</p>
              <h1 className={styles.title}>Decision Room</h1>
                  <p className={styles.subtitle}>
                    Every decision and submission from our community finds its way here. The Azura agent thoughtfully manages a 40% holding of voting tokens, carefully reviewing and adding votes to proposals. Users can seek grants, stipends, and other supportive resources.
                  </p>
                  <div className={styles.heroActions}>
                    <button
                      className={styles.primaryCta}
                      onClick={() => setIsSubmitModalOpen(true)}
                      type="button"
                    >
                      Submit Form
                    </button>
                    <button
                      className={styles.secondaryCta}
                      onClick={() => setShowTutorial(true)}
                      type="button"
                    >
                      Tutorial
                    </button>
                  </div>
                </div>
                {/* Stats Grid - Bento Grid Style Top Right */}
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
              </div>
            </header>
          </div>

          {/* Proposals Section */}
          <section className={styles.proposalsSection}>
            {loading ? (
              <PencilLoader hidden={false} />
            ) : proposals.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>No proposals yet</h3>
                <p>Be the first to submit a proposal to the community!</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>Error Loading Proposals</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton} type="button">
                  Retry
                </button>
              </div>
            ) : (
              <div className={styles.proposalsGrid} data-tutorial-target="submission">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className={styles.proposalCardContainer}>
                    <ProposalCard
                      id={proposal.id}
                      title={proposal.title}
                      proposalMarkdown={proposal.proposalMarkdown}
                      status={proposal.status}
                      walletAddress={proposal.walletAddress}
                      createdAt={proposal.createdAt}
                      user={proposal.user}
                      review={proposal.review}
                      onViewDetails={handleViewDetails}
                      showAvatar={false}
                    />
                    
                    {/* Show on-chain transaction info */}
                    {proposal.onChainTxHash && (
                      <div className={styles.onChainInfo}>
                        <div className={styles.onChainBadge}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor"/>
                            <path d="M3 17L12 22L21 17" fill="currentColor" fillOpacity="0.6"/>
                            <path d="M3 12L12 17L21 12" fill="currentColor" fillOpacity="0.8"/>
                          </svg>
                          <span>On-Chain Verified</span>
                        </div>
                        <a 
                          href={`https://basescan.org/tx/${proposal.onChainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.txLink}
                        >
                          View Transaction →
                        </a>
                      </div>
                    )}
                    
                    {/* Show voting UI for active proposals with on-chain data */}
                    {proposal.status === 'active' && 
                     proposal.onChainData && 
                     !proposal.onChainData.executed && (
                      <div className={styles.votingSection}>
                        <VoteProgressBar
                          forVotes={formatTokenAmount(proposal.onChainData.forVotes)}
                          againstVotes={formatTokenAmount(proposal.onChainData.againstVotes)}
                          totalSupply={TOTAL_SUPPLY}
                          threshold={50}
                        />
                        {proposal.review?.onChainProposalId && (
                          <VoteButtons
                            proposalId={parseInt(proposal.review.onChainProposalId)}
                            contractAddress={CONTRACT_ADDRESS}
                            onVoted={fetchProposals}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      
      {selectedProposal && (
        <ProposalDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProposal(null);
          }}
          proposal={selectedProposal}
        />
      )}

      <SubmitProposalModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={fetchProposals}
      />
    </>
  );
}
