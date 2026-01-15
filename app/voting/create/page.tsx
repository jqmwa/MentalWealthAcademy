'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import { providers } from 'ethers';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
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
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const [title, setTitle] = useState('');
  const [proposal, setProposal] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<'idle' | 'blockchain' | 'database'>('idle');
  const [charCount, setCharCount] = useState(0);

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

  const handleConnectWallet = () => {
    // Use wagmi's connect which supports mobile wallets via WalletConnect/Reown
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

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
      const { proposalId: onChainProposalId, txHash } = await createProposalOnChain(
        CONTRACT_ADDRESS,
        recipientAddress.trim(),
        usdcAmount,
        title.trim(),
        proposal.trim(),
        7, // 7 days voting period
        ethersProvider
      );

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save proposal to database');
      }

      // Success! Show transaction info
      const message = `✅ Proposal submitted successfully!\n\nTransaction: ${txHash}\nOn-chain ID: ${onChainProposalId}\n\nView on BaseScan: https://basescan.org/tx/${txHash}\n\nAzura will review your proposal soon.`;
      alert(message);
      
      router.push('/voting');
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
                    <span className={styles.userLabel}>Submitted by</span>
                    <span className={styles.username}>
                      @{username || 'connecting...'}
                    </span>
                  </div>
                </div>
                {!isConnected && (
                  <button
                    className={styles.connectWalletButton}
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    type="button"
                  >
                    {isConnecting ? (
                      <>
                        <div className={styles.spinner}></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M16 7V5C16 3.89543 15.1046 3 14 3H4C2.89543 3 2 3.89543 2 5V7" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="16" cy="14" r="2" fill="currentColor"/>
                        </svg>
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                )}
                {address && (
                  <div className={styles.addressBadge}>
                    <span className={styles.addressLabel}>Wallet</span>
                    <span className={styles.addressValue}>
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Proposal Title</span>
                  <span className={styles.labelHint}>Make it clear and compelling</span>
                </label>
                <input
                  type="text"
                  className={styles.titleInput}
                  placeholder="e.g., Mental Health Workshop Series for Students"
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
                  <span className={styles.labelText}>Recipient Wallet Address</span>
                  <span className={styles.labelHint}>Address to receive USDC if approved</span>
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
                  <span className={styles.labelText}>Token Amount (USDC)</span>
                  <span className={styles.labelHint}>Amount of USDC to request</span>
                </label>
                <input
                  type="number"
                  className={styles.titleInput}
                  placeholder="e.g., 1000"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Template Buttons */}
              <div className={styles.templateSection}>
                <span className={styles.templateLabel}>Quick Start Templates</span>
                <div className={styles.templateButtons}>
                  <button
                    className={styles.templateButton}
                    onClick={() => handleTemplateClick(ACTIVATION_TEMPLATE)}
                    type="button"
                  >
                    <div className={styles.templateIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
                        <circle cx="8" cy="6" r="1" fill="currentColor"/>
                        <circle cx="16" cy="6" r="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>Activation</span>
                      <span className={styles.templateDesc}>Events & Projects</span>
                    </div>
                  </button>
                  <button
                    className={styles.templateButton}
                    onClick={() => handleTemplateClick(RESEARCH_TEMPLATE)}
                    type="button"
                  >
                    <div className={styles.templateIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="7" height="10" rx="1" fill="currentColor" fillOpacity="0.6"/>
                        <rect x="9" y="6" width="7" height="12" rx="1" fill="currentColor" fillOpacity="0.8"/>
                        <rect x="13" y="7" width="7" height="11" rx="1" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>Research</span>
                      <span className={styles.templateDesc}>Academic Studies</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Markdown Input */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Proposal Details</span>
                  <span className={styles.labelHint}>Markdown supported • Be thorough and honest</span>
                </label>
                <textarea
                  className={styles.markdownInput}
                  placeholder="## Your Proposal

Tell us about your vision...

### Why This Matters
Explain the impact on our community...

### Budget & Timeline
Break down your needs..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                />
                <div className={styles.inputFooter}>
                  <div className={styles.markdownHint}>
                    <span className={styles.markdownIcon}>#</span>
                    <span>Headers</span>
                    <span className={styles.markdownIcon}>**</span>
                    <span>Bold</span>
                    <span className={styles.markdownIcon}>-</span>
                    <span>Lists</span>
                  </div>
                  <span className={styles.charCount}>{charCount.toLocaleString()} characters</span>
                </div>
              </div>
              </div>
            </div>

            {/* Right Side - Action Button */}
            <div className={styles.actionSection}>
              <div className={styles.actionCard}>
                <div className={styles.actionHeader}>
                  <div className={styles.actionBadge}>
                    <div className={styles.actionBadgeDot}></div>
                    <span>Blockchain Action</span>
                  </div>
                  <p className={styles.actionDescription}>
                    Your proposal will be submitted on-chain and reviewed by the Azura agent and community members.
                  </p>
                </div>

                <div className={styles.actionStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Review Time</span>
                    <span className={styles.statValue}>24-48 hours</span>
                  </div>
                  <div className={styles.statDivider}></div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Gas Fee</span>
                    <span className={styles.statValue}>~0.003 ETH</span>
                  </div>
                </div>

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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor"/>
                        <path d="M3 17L12 22L21 17" fill="currentColor" fillOpacity="0.6"/>
                        <path d="M3 12L12 17L21 12" fill="currentColor" fillOpacity="0.8"/>
                      </svg>
                      <span>Submit Proposal (On-Chain)</span>
                    </>
                  )}
                </button>

                <div className={styles.actionFooter}>
                  <div className={styles.footerIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className={styles.footerText}>
                    Once submitted, your proposal enters the community review queue and cannot be edited.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
