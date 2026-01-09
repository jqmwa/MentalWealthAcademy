'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
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

export default function CreateProposalPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [proposal, setProposal] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleTemplateClick = (template: string) => {
    setProposal(template);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !proposal.trim()) {
      alert('Please fill in both title and proposal');
      return;
    }

    if (!address) {
      alert('Please connect your wallet to submit a proposal');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/voting/proposal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          proposalMarkdown: proposal.trim(),
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit proposal');
      }

      alert('Proposal submitted successfully! Azura is reviewing your proposal...');
      router.push('/voting');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      alert(error.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                      <span>Submitting to Chain...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor"/>
                        <path d="M3 17L12 22L21 17" fill="currentColor" fillOpacity="0.6"/>
                        <path d="M3 12L12 17L21 12" fill="currentColor" fillOpacity="0.8"/>
                      </svg>
                      <span>Submit Proposal</span>
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
