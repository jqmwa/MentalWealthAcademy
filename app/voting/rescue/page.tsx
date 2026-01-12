'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import MockRescueCard from '@/components/mock-rescue/MockRescueCard';
import styles from './page.module.css';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AZURA_KILLSTREAK_ADDRESS || '0x2cbb90a761ba64014b811be342b8ef01b471992d';

export default function RescuePage() {
  const [executed, setExecuted] = useState(false);

  const handleProposalExecuted = () => {
    setExecuted(true);
    alert('✅ Proposal executed! $5 USDC has been transferred to your wallet.');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Treasury Rescue Operation</h1>
          <p className={styles.subtitle}>
            Create a test proposal to rescue $5 USDC from the treasury before redeploying contracts
          </p>
        </div>

        <div className={styles.cardWrapper}>
          <MockRescueCard
            contractAddress={CONTRACT_ADDRESS}
            recipientAddress=""
            usdcAmount="5.00"
            onProposalExecuted={handleProposalExecuted}
          />
        </div>

        {executed && (
          <div className={styles.successMessage}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h3>Rescue Complete!</h3>
              <p>$5 USDC has been successfully transferred to your wallet.</p>
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>This is a <strong>test proposal</strong> for rescuing funds before redeployment</li>
            <li>You need the <strong>deployer wallet</strong> (60% tokens) to vote</li>
            <li>Proposal will auto-execute when 50% threshold is reached</li>
            <li>Make sure the recipient address is correct before creating</li>
            <li>This proposal will be on the old contract before redeployment</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
