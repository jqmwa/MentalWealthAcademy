'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import VoteButtons from '@/components/vote-buttons/VoteButtons';
import VoteProgressBar from '@/components/vote-progress/VoteProgressBar';
import styles from './MockRescueCard.module.css';

interface MockRescueCardProps {
  proposalId?: number;
  contractAddress: string;
  recipientAddress: string;
  usdcAmount: string;
  onProposalExecuted?: () => void;
}

const MockRescueCard: React.FC<MockRescueCardProps> = ({
  proposalId: initialProposalId,
  contractAddress,
  recipientAddress,
  usdcAmount,
  onProposalExecuted,
}) => {
  const { address, isConnected } = useAccount();
  const [creating, setCreating] = useState(false);
  const [proposalCreated, setProposalCreated] = useState(!!initialProposalId);
  const [error, setError] = useState<string | null>(null);
  const [createdProposalId, setCreatedProposalId] = useState<number | null>(initialProposalId || null);

  const handleCreateProposal = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/voting/mock-rescue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: address, // Send to connected wallet
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create proposal');
      }

      setProposalCreated(true);
      setCreatedProposalId(data.proposalId);
      alert(`✅ Rescue proposal created!\n\nProposal ID: ${data.proposalId}\n\nYou can now vote with the deployer wallet.`);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.message || 'Failed to create proposal');
      alert(`Error: ${err.message || 'Failed to create proposal'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <p className={styles.eyebrow}>Mock Research Proposal</p>
          <h3 className={styles.title}>Treasury Rescue Operation</h3>
        </div>
        <div className={styles.statusBadge}>
          <span className={styles.statusDot} />
          {proposalCreated ? 'Active' : 'Ready to Create'}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.description}>
          <p className={styles.descriptionTitle}>Purpose</p>
          <p className={styles.descriptionText}>
            This is a test proposal to rescue $5 USDC from the treasury before redeploying contracts. 
            This proposal will be used to test the voting and execution flow.
          </p>
        </div>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Amount:</span>
            <span className={styles.detailValue}>$5.00 USDC</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Recipient:</span>
            <span className={styles.detailValue}>
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Proposal ID:</span>
            <span className={styles.detailValue}>
              {createdProposalId ? `#${createdProposalId}` : 'Not created yet'}
            </span>
          </div>
        </div>

        {!proposalCreated && (
          <div className={styles.createSection}>
            <button
              className={styles.createButton}
              onClick={handleCreateProposal}
              disabled={creating || !isConnected}
            >
              {creating ? (
                <>
                  <div className={styles.spinner} />
                  <span>Creating Proposal...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Create Rescue Proposal</span>
                </>
              )}
            </button>
            {!isConnected && (
              <p className={styles.hint}>Connect your wallet to create the proposal</p>
            )}
            {error && (
              <p className={styles.error}>{error}</p>
            )}
          </div>
        )}

        {proposalCreated && createdProposalId && (
          <>
            <div className={styles.votingSection}>
              <VoteProgressBar
                forVotes="0"
                againstVotes="0"
                totalSupply="100000"
                threshold={50}
              />
            </div>

            <div className={styles.voteSection}>
              <VoteButtons
                proposalId={createdProposalId}
                contractAddress={contractAddress}
                onVoted={() => {
                  // Refresh or show success
                  if (onProposalExecuted) {
                    setTimeout(() => {
                      onProposalExecuted();
                    }, 3000);
                  }
                }}
              />
            </div>

            <div className={styles.instructions}>
              <p className={styles.instructionsTitle}>📋 Instructions:</p>
              <ol className={styles.instructionsList}>
                <li>Connect the <strong>deployer wallet</strong> (has 60% tokens)</li>
                <li>Click <strong>"Approve"</strong> to vote</li>
                <li>Proposal will auto-execute when 50% threshold is reached</li>
                <li>$5 USDC will be transferred to your wallet</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MockRescueCard;
