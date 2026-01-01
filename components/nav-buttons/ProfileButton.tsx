'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import YourAccountsModal from './YourAccountsModal';
import styles from './ProfileButton.module.css';

const ProfileButton: React.FC = () => {
  const { isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show button if not connected
  if (!isConnected) {
    return null;
  }

  return (
    <>
      <button 
        className={styles.profileButton} 
        data-intro="profile"
        onClick={() => setIsModalOpen(true)}
        type="button"
      >
        <Image 
          src="/icons/ethlogo.svg" 
          alt="Your Accounts" 
          width={24}
          height={24}
          className={styles.profileIcon}
        />
        <span className={styles.buttonText}>Your Accounts</span>
      </button>

      {isModalOpen && (
        <YourAccountsModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ProfileButton;

