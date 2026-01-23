'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import Image from 'next/image';
import Link from 'next/link';
import { providers } from 'ethers';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import ProposalSuccessModal from '@/components/voting/ProposalSuccessModal';
import { createProposalOnChain } from '@/lib/azura-contract';
import styles from './page.module.css';

const ACTIVATION_TEMPLATE = `## Activation Proposal

**Event/Project Name:** [Your event name]

**Duration:** [Start date - End date]

**Location:** [Physical/Virtual/Hybrid]

### Overview
[Describe your activation in 2-3 sentences]

### Objectives
- Objective 1
- Objective 2
- Objective 3

### Target Audience
[Who will benefit from this activation?]

### Budget Breakdown
- Item 1: $XXX
- Item 2: $XXX
- Total: $XXX

### Expected Impact
[How will this benefit the Mental Wealth Academy community?]

### Timeline
- Milestone 1: [Date]
- Milestone 2: [Date]
- Completion: [Date]

### Success Metrics
[How will you measure success?]`;

const RESEARCH_TEMPLATE = `## Research Funding Proposal

**Research Title:** [Your research title]

**Principal Investigator:** [Your name]

**Duration:** [X months/years]

### Abstract
[200-300 word summary of your research]

### Research Question
[What specific question are you investigating?]

### Background & Significance
[Why is this research important to mental wealth?]

### Methodology
[How will you conduct this research?]

### Budget Request
**Total Amount:** $XXX

**Budget Breakdown:**
- Personnel: $XXX
- Equipment/Materials: $XXX
- Data Collection: $XXX
- Publication/Dissemination: $XXX

### Expected Outcomes
[What will this research produce?]

### Community Benefit
[How will this research help the Mental Wealth Academy community?]

### Timeline & Milestones
- Phase 1: [Description] - [Date]
- Phase 2: [Description] - [Date]
- Final Report: [Date]`;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS || '0x2cbb90a761ba64014b811be342b8ef01b471992d';

export default function CreateProposalPage() {
  const router = useRouter();
  const { address, isConnected, connector } = useAccount();
  const [title, setTitle] = useState('');
  const [proposal, setProposal] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<'idle' | 'blockchain' | 'database'>('idle');
  const [charCount, setCharCount] = useState(0);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; txHash: string; proposalId: number }>({
    isOpen: false,
    txHash: '',
    proposalId: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        const data = await response.json();
        if (data?.user) {
          setUsername(data.user.username || null);
          setAvatarUrl(data.user.avatarUrl || null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    setCharCount(proposal.length);
  }, [proposal]);

  const handleTemplateClick = (template: string) => {
    setProposal(template);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim() || !proposal.trim()) {
      alert('Please fill in both title and proposal');
      return;
    }

    if (!recipientAddress.trim()) {
      alert('Please provide the recipient wallet address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress.trim())) {
      alert('Please enter a valid Ethereum address (0x followed by 40 hexadecimal characters)');
      return;
    }

    if (!tokenAmount.trim()) {
      alert('Please provide the token amount');
      return;
    }

    const tokenAmountNum = parseFloat(tokenAmount.trim());
    if (isNaN(tokenAmountNum) || tokenAmountNum <= 0) {
      alert('Please enter a valid token amount (must be greater than 0)');
      return;
    }

    if (!isConnected || !address) {
      alert('Please connect your wallet using the "Connect Wallet" button below to submit your proposal.');
      return;
    }

    if (!connector) {
      alert('Wallet connector not available. Please reconnect your wallet.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // STEP 1: Create proposal on-chain (user pays gas)
      setSubmissionStep('blockchain');
      console.log('Creating proposal on-chain...');
      
      // Convert token amount to USDC format (6 decimals)
      const usdcAmount = Math.floor(tokenAmountNum * 1e6).toString();
      
      // Get the provider from the connector
      // The connector exposes an EIP1193 provider that we can use with ethers
      const provider = await connector.getProvider();
      if (!provider) {
        throw new Error('Provider not available from connector');
      }
      
      // Convert EIP1193 provider to ethers Web3Provider
      const ethersProvider = new providers.Web3Provider(provider);
      let onChainProposalId: number;
      let txHash: string;
      
      try {
        const result = await createProposalOnChain(
          CONTRACT_ADDRESS,
          recipientAddress.trim(),
          usdcAmount,
          title.trim(),
          proposal.trim(),
          7, // 7 days voting period
          ethersProvider
        );
        
        onChainProposalId = result.proposalId;
        txHash = result.txHash;
        
        // Validate the proposal ID is valid before proceeding
        if (!onChainProposalId || onChainProposalId <= 0 || isNaN(onChainProposalId)) {
          throw new Error(`Invalid proposal ID received from blockchain: ${onChainProposalId}. Please contact support with transaction hash: ${txHash}`);
        }
        
        if (!txHash || !txHash.startsWith('0x')) {
          throw new Error(`Invalid transaction hash received: ${txHash}`);
        }
      } catch (blockchainError: any) {
        console.error('Blockchain transaction error:', blockchainError);
        throw new Error(`Failed to create proposal on blockchain: ${blockchainError.message || blockchainError.toString()}`);
      }

      console.log('✅ On-chain proposal created!', { onChainProposalId, txHash });
      console.log(`View on BaseScan: https://basescan.org/tx/${txHash}`);

      // STEP 2: Save to database with on-chain ID
      setSubmissionStep('database');
      console.log('Saving to database...');
      
      const response = await fetch('/api/voting/proposal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          proposalMarkdown: proposal.trim(),
          walletAddress: address,
          recipientAddress: recipientAddress.trim(),
          tokenAmount: tokenAmount.trim(),
          onChainProposalId: onChainProposalId.toString(),
          onChainTxHash: txHash,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(`Server returned invalid response (status ${response.status}). This may indicate a server error.`);
      }

      if (!response.ok) {
        // Log the error details for debugging
        console.error('API error response:', {
          status: response.status,
          error: data.error,
          details: data.details,
        });
        throw new Error(data.error || `Failed to save proposal to database (HTTP ${response.status})`);
      }

      // Success! Show styled modal
      setSuccessModal({
        isOpen: true,
        txHash,
        proposalId: onChainProposalId,
      });
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Failed to submit proposal. ';
      
      if (error.code === 4001) {
        errorMessage += 'You rejected the transaction.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage += 'Insufficient funds for gas. Please add more ETH to your wallet.';
      } else if (error.message?.includes('user rejected')) {
        errorMessage += 'Transaction was rejected.';
      } else if (error.message?.includes('gas')) {
        errorMessage += 'Gas estimation failed. Please check your wallet balance.';
      } else if (submissionStep === 'blockchain') {
        errorMessage += 'Blockchain transaction failed: ' + (error.message || 'Unknown error');
      } else if (submissionStep === 'database') {
        errorMessage += 'Proposal created on-chain but failed to save to database. Please contact support with transaction hash: ' + error.txHash;
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('idle');
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.content}>
          {/* Main Creation Area */}
          <div className={styles.creationContainer}>
            <div className={styles.leftColumn}>
              {/* Breadcrumbs */}
              <div className={styles.breadcrumbs}>
                <Link href="/home">Home</Link>
                <span className={styles.chevron}>/</span>
                <Link href="/voting">Voting</Link>
                <span className={styles.chevron}>/</span>
                <span className={styles.current}>Create Proposal</span>
              </div>

              {/* Hero Header */}
              <div className={styles.hero}>
                <div className={styles.heroContent}>
                  <p className={styles.eyebrow}>MWA • Proposal Submission</p>
                  <h1 className={styles.title}>Submit Your Vision</h1>
                  <p className={styles.subtitle}>
                    Share your ideas with the community. Whether you&apos;re proposing an activation, research project, or community initiative, this is where great ideas begin their journey.
                  </p>
                  <div className={styles.heroActions}>
                    <ConnectKitButton.Custom>
                      {({ isConnected, isConnecting, show, address }) => (
                        isConnected ? (
                          <div className={styles.connectedBadge}>
                            <span className={styles.connectedDot} />
                            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                          </div>
                        ) : (
                          <button
                            className={styles.primaryCta}
                            onClick={show}
                            disabled={isConnecting}
                            type="button"
                          >
                            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                          </button>
                        )
                      )}
                    </ConnectKitButton.Custom>
                    <Link href="/voting" className={styles.secondaryCta}>
                      View Proposals
                    </Link>
                  </div>
                </div>
              </div>
              {/* Form Section */}
              <div className={styles.formSection}>
                {/* User Info */}
                <div className={styles.userCard}>
                  <div className={styles.userInfo}>
                    {avatarUrl ? (
                      <div className={styles.avatar}>
                        <Image
                          src={avatarUrl}
                          alt={username || 'User'}
                          width={48}
                          height={48}
                          className={styles.avatarImage}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <span>?</span>
                      </div>
                    )}
                    <div className={styles.userDetails}>
                      <span className={styles.userLabel}>Submitting as</span>
                      <span className={styles.username}>
                        @{username || 'anonymous'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Proposal Title</span>
                  </label>
                  <input
                    type="text"
                    className={styles.titleInput}
                    placeholder="Mental Health Workshop Series for Students"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                  />
                  <div className={styles.inputFooter}>
                    <span className={styles.charCount}>{title.length}/120</span>
                  </div>
                </div>

                {/* Recipient Address Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Recipient Address</span>
                  </label>
                  <input
                    type="text"
                    className={styles.titleInput}
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>

                {/* Token Amount Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Amount (USDC)</span>
                  </label>
                  <input
                    type="number"
                    className={styles.titleInput}
                    placeholder="1000"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Template Buttons */}
                <div className={styles.templateSection}>
                  <span className={styles.templateLabel}>Templates</span>
                  <div className={styles.templateButtons}>
                    <button
                      className={styles.templateButton}
                      onClick={() => handleTemplateClick(ACTIVATION_TEMPLATE)}
                      type="button"
                    >
                      <span className={styles.templateName}>Activation</span>
                    </button>
                    <button
                      className={styles.templateButton}
                      onClick={() => handleTemplateClick(RESEARCH_TEMPLATE)}
                      type="button"
                    >
                      <span className={styles.templateName}>Research</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Proposal Details</span>
                  </label>
                  <textarea
                    className={styles.markdownInput}
                    placeholder="Describe your proposal, objectives, budget, and timeline..."
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                  />
                  <div className={styles.inputFooter}>
                    <span className={styles.charCount}>{charCount.toLocaleString()} chars</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className={styles.submitRow}>
                  <button
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !proposal.trim()}
                    type="button"
                  >
                    {isSubmitting ? (
                      <>
                        <div className={styles.spinner}></div>
                        <span>
                          {submissionStep === 'blockchain' && 'Creating on-chain (sign transaction)...'}
                          {submissionStep === 'database' && 'Saving to database...'}
                          {submissionStep === 'idle' && 'Submitting...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Submit Proposal (On-Chain)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <ProposalSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, txHash: '', proposalId: 0 })}
        txHash={successModal.txHash}
        proposalId={successModal.proposalId}
      />
    </>
  );
}
