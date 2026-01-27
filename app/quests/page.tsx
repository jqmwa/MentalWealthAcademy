'use client';

import React, { useState } from 'react';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import QuestPage from '@/components/quests/QuestPage';
import AngelMintSection from '@/components/angel-mint-section/AngelMintSection';
import MintModal from '@/components/mint-modal/MintModal';
import styles from './page.module.css';

export default function QuestsPage() {
  const [showMintModal, setShowMintModal] = useState(false);

  return (
    <>
      <div className={styles.pageLayout}>
        <SideNavigation />
        <div className={styles.content}>
          <QuestPage />
        </div>
      </div>
      <AngelMintSection onOpenMintModal={() => setShowMintModal(true)} />
      <MintModal isOpen={showMintModal} onClose={() => setShowMintModal(false)} />
    </>
  );
}
