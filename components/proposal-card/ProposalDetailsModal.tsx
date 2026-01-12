'use client';

import React, { useEffect } from 'react';
import styles from './ProposalDetailsModal.module.css';

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
}

interface ProposalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: {
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
    review: ProposalReview | null;
    onChainData?: {
      forVotes: string;
      againstVotes: string;
      votingDeadline: number;
      azuraLevel: number;
      executed: boolean;
    };
  };
}

export default function ProposalDetailsModal({
  isOpen,
  onClose,
  proposal,
}: ProposalDetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>{proposal.title}</h2>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {proposal.walletAddress.slice(0, 6)}...{proposal.walletAddress.slice(-4)}
              </span>
              <span className={styles.metaItem}>
                Created {formatDate(proposal.createdAt)}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Proposal</h3>
            <div className={styles.markdownContent}>
              <pre className={styles.markdownPre}>{proposal.proposalMarkdown}</pre>
            </div>
          </div>

          {proposal.review && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Azura's Review</h3>
              <div className={styles.reviewContent}>
                <div className={styles.reasoning}>
                  <p>{proposal.review.reasoning}</p>
                </div>
                {proposal.review.scores && (
                  <div className={styles.scores}>
                    <div className={styles.scoreItem}>
                      <span>Clarity</span>
                      <span>{proposal.review.scores.clarity}/10</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Impact</span>
                      <span>{proposal.review.scores.impact}/10</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Feasibility</span>
                      <span>{proposal.review.scores.feasibility}/10</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Budget</span>
                      <span>{proposal.review.scores.budget}/10</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Ingenuity</span>
                      <span>{proposal.review.scores.ingenuity}/10</span>
                    </div>
                    <div className={styles.scoreItem}>
                      <span>Chaos</span>
                      <span>{proposal.review.scores.chaos}/10</span>
                    </div>
                  </div>
                )}
                {proposal.review.tokenAllocation && (
                  <div className={styles.allocation}>
                    <strong>Token Allocation: {proposal.review.tokenAllocation}%</strong>
                  </div>
                )}
                <div className={styles.reviewDate}>
                  Reviewed {formatDate(proposal.review.reviewedAt)}
                </div>
              </div>
            </div>
          )}

          {proposal.onChainData && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Voting Status</h3>
              <div className={styles.votingData}>
                <div className={styles.votingItem}>
                  <span>For Votes</span>
                  <span>{proposal.onChainData.forVotes}</span>
                </div>
                <div className={styles.votingItem}>
                  <span>Against Votes</span>
                  <span>{proposal.onChainData.againstVotes}</span>
                </div>
                <div className={styles.votingItem}>
                  <span>Azura Level</span>
                  <span>⭐ x {proposal.onChainData.azuraLevel}</span>
                </div>
                {proposal.onChainData.votingDeadline && (
                  <div className={styles.votingItem}>
                    <span>Voting Deadline</span>
                    <span>{formatDate(proposal.onChainData.votingDeadline)}</span>
                  </div>
                )}
                {proposal.onChainData.executed && (
                  <div className={styles.executed}>
                    ✅ Proposal Executed
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
