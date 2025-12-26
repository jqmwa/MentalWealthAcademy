'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import styles from './SignInButton.module.css';

const SignInButton: React.FC = () => {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const wasAuthenticatedRef = useRef(authenticated);
  const loginInitiatedRef = useRef(false);

  // Redirect to home only after a successful login action (not on initial load)
  useEffect(() => {
    if (ready && authenticated && !wasAuthenticatedRef.current && loginInitiatedRef.current) {
      router.push('/home');
    }
    // Update the ref after the effect runs
    wasAuthenticatedRef.current = authenticated;
  }, [authenticated, ready, router]);

  // Don't show button if already authenticated
  if (authenticated) {
    return null;
  }

  const handleClick = () => {
    loginInitiatedRef.current = true;
    login();
  };

  return (
    <button 
      className={styles.signInButton} 
      data-intro="sign-in"
      onClick={handleClick}
      type="button"
    >
      <Image 
        src="/icons/ethlogo.svg" 
        alt="Ethereum logo" 
        width={20}
        height={20}
        className={styles.ethLogo}
      />
      <span className={styles.buttonText}>Sync with Ethereum</span>
    </button>
  );
};

export default SignInButton;

