'use client';

import React from 'react';
import Navbar from '@/components/navbar/Navbar';
import VotingGame from '@/components/games/VotingGame';
import { Footer } from '@/components/footer/Footer';

export default function GamesPage() {
  return (
    <>
      <Navbar />
      <VotingGame />
      <Footer />
    </>
  );
}
