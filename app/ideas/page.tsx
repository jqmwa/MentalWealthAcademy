'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { IdeaCardFeed } from '@/components/idea-cards';
import { ExpertPaywall } from '@/components/paywall';
import styles from './page.module.css';

export default function IdeasPage() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasExpertAccess, setHasExpertAccess] = useState(false);

  const handleExpertClick = () => {
    setShowPaywall(true);
  };

  const handleProgress = (learned: number, saved: number, total: number) => {
    // TODO: Update user profile with progress
    console.log('Progress:', { learned, saved, total });
    
    // Dispatch event to update homepage stats
    window.dispatchEvent(new CustomEvent('ideasProgress', { 
      detail: { learned, saved, total } 
    }));
  };

  const handleSubscribe = () => {
    // For now, just grant access (Stripe integration in future phase)
    setHasExpertAccess(true);
    setShowPaywall(false);
  };

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={styles.container}>
        <IdeaCardFeed
          hasExpertAccess={hasExpertAccess}
          onExpertClick={handleExpertClick}
          onProgress={handleProgress}
        />
      </div>

      {/* Expert Paywall Modal */}
      <ExpertPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
      />
    </main>
  );
}
