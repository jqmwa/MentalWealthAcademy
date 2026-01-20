'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import QuestPage from '@/components/quests/QuestPage';
import AngelMintSection from '@/components/angel-mint-section/AngelMintSection';
import MintModal from '@/components/mint-modal/MintModal';

export default function QuestsPage() {
  const [showMintModal, setShowMintModal] = useState(false);

  return (
    <>
      <Navbar />
      <QuestPage />
      <AngelMintSection onOpenMintModal={() => setShowMintModal(true)} />
      <MintModal isOpen={showMintModal} onClose={() => setShowMintModal(false)} />
    </>
  );
}
