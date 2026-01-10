'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { voteOnProposal, getUserVotingPower, formatTokenAmount } from '@/lib/azura-contract';
import { SoulGemDisplay } from '@/components/soul-gems/SoulGemDisplay';
import styles from './VoteButtons.module.css';

interface VoteButtonsProps {
  proposalId: number;
  contractAddress: string;
  onVoted?: () => void;
  hasVoted?: boolean;
  userVote?: boolean | null;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  proposalId,
  contractAddress,
  onVoted,
  hasVoted = false,
  userVote = null,
}) => {
  const { address, isConnected } = useAccount();
  const [voting, setVoting] = useState(false);
  const [votingPower, setVotingPower] = useState<string>('0');
  const [userHasVoted, setUserHasVoted] = useState(hasVoted);

  useEffect(() => {
    if (isConnected && address) {
      loadVotingPower();
    }
  }, [isConnected, address]);

  const loadVotingPower = async () => {
    if (!address) return;
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const power = await getUserVotingPower(contractAddress, address, provider);
        setVotingPower(power);
      }
    } catch (error) {
      console.error('Error loading voting power:', error);
    }
  };

  const handleVote = async (support: boolean) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to vote');
      return;
    }

    if (parseFloat(votingPower) === 0) {
      alert('You need Soul Gems (governance tokens) to vote!');
      return;
    }

    setVoting(true);

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        
        const txHash = await voteOnProposal(
          contractAddress,
          proposalId,
          support,
          provider
        );
        
        alert(`Vote submitted! 🎉\n\nTransaction: ${txHash.slice(0, 10)}...\n\nYour ${formatTokenAmount(votingPower)} Soul Gems have been counted!`);
        
        setUserHasVoted(true);
        
        if (onVoted) {
          onVoted();
        }
      }
    } catch (error: any) {
      console.error('Error voting:', error);
      alert(`Failed to vote: ${error.message || 'Unknown error'}`);
    } finally {
      setVoting(false);
    }
  };

  if (userHasVoted) {
    return (
      <div className={styles.votedIndicator}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>You voted {userVote ? 'Approve' : 'Reject'}</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <button
          className={`${styles.voteButton} ${styles.approveButton}`}
          onClick={() => handleVote(true)}
          disabled={voting || !isConnected}
          type="button"
        >
          {voting ? (
            <>
              <div className={styles.spinner} />
              <span>Voting...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Approve</span>
            </>
          )}
        </button>

        <button
          className={`${styles.voteButton} ${styles.rejectButton}`}
          onClick={() => handleVote(false)}
          disabled={voting || !isConnected}
          type="button"
        >
          {voting ? (
            <>
              <div className={styles.spinner} />
              <span>Voting...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Reject</span>
            </>
          )}
        </button>
      </div>

      {isConnected && parseFloat(votingPower) > 0 && (
        <div className={styles.votingPower}>
          <span className={styles.votingPowerLabel}>Your Voting Power:</span>
          <SoulGemDisplay 
            amount={formatTokenAmount(votingPower)} 
            showLabel={false}
          />
        </div>
      )}

      {isConnected && parseFloat(votingPower) === 0 && (
        <div className={styles.votingPower}>
          <span className={styles.votingPowerLabel}>⚠️ You need Soul Gems to vote</span>
        </div>
      )}
    </>
  );
};

export default VoteButtons;
