'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import styles from './WalletAdvancedDemo.module.css';

interface WalletConnectionHandlerProps {
  onWalletConnected?: (address: string) => void;
  buttonText?: string;
}

/**
 * Handles wallet connection, user authentication, and account creation.
 * This component manages the full flow from wallet connection to onboarding.
 */
export function WalletConnectionHandler({ onWalletConnected, buttonText = 'Connect Wallet' }: WalletConnectionHandlerProps) {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAddress, setProcessedAddress] = useState<string | null>(null);
  const [hasTriggeredOnboarding, setHasTriggeredOnboarding] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null); // null = checking, true/false = known
  const processingRef = useRef<string | null>(null); // Track which address is currently being processed

  // Handle wallet connection and user check/creation
  useEffect(() => {
    // Don't process if not connected, already processing, no address, or already processed
    if (!isConnected) {
      return;
    }
    
    if (isProcessing) {
      return;
    }
    
    if (!address) {
      console.log('Wallet connected but address not available yet - waiting for connection to complete...');
      return;
    }
    
    if (processedAddress === address) {
      return;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.log('Invalid address format, waiting for valid address...');
      return;
    }
    
    if (processingRef.current === address) {
      return;
    }
    
    // Wait for connection to be fully established before processing
    (async () => {
      // Double-check we're not already processing (race condition protection)
      if (isProcessing || processedAddress === address || processingRef.current === address) {
        console.log('Already processing or processed, skipping');
        return;
      }
      
      // Wait for wallet to fully initialize after connection
      const delay = 500;
      console.log(`Wallet connected! Waiting ${delay}ms for wallet to fully initialize before processing connection...`);
      console.log('Wallet address:', address);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Verify wallet is still connected and address is still available after wait
      if (!isConnected || !address || processedAddress === address) {
        console.log('Wallet disconnected or address already processed during wait');
        return;
      }
      
      // Final validation before processing
      if (address && /^0x[a-fA-F0-9]{40}$/.test(address) && processedAddress !== address && !isProcessing) {
        console.log('Wallet connection fully established, processing connection and checking/creating account for:', address);
        handleWalletConnection(address);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isProcessing, processedAddress]);

  // Check if user has an account on mount
  useEffect(() => {
    const checkAccount = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
        });
        const data = await response.json().catch(() => ({ user: null }));
        setHasAccount(!!data.user);
      } catch (error) {
        console.error('Failed to check account:', error);
        setHasAccount(false);
      }
    };
    checkAccount();

    const handleLogin = () => {
      setTimeout(checkAccount, 500);
    };
    window.addEventListener('userLoggedIn', handleLogin);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
    };
  }, []);

  // Reset processed address when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setProcessedAddress(null);
      setHasTriggeredOnboarding(false);
      setIsProcessing(false);
      processingRef.current = null;
    }
  }, [isConnected]);

  // Listen for profile updates to re-check if profile is now complete
  useEffect(() => {
    const handleProfileUpdate = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (isConnected && address && !isProcessing) {
        setProcessedAddress(null);
        setTimeout(() => {
          if (address) {
            handleWalletConnection(address);
          }
        }, 100);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isProcessing]);

  const handleWalletConnection = async (walletAddress: string) => {
    // Prevent duplicate processing
    if (processingRef.current === walletAddress || isProcessing) {
      console.log('Already processing this address, skipping duplicate call');
      return;
    }
    
    // Mark as processing immediately to prevent duplicate calls
    processingRef.current = walletAddress;
    setIsProcessing(true);
    
    // Validate wallet address format before proceeding
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error('Invalid wallet address format:', walletAddress);
      processingRef.current = null;
      setIsProcessing(false);
      if (isConnected) {
        console.log('Address not available yet, will retry in 1 second...');
        const currentAddress = address;
        setTimeout(() => {
          if (currentAddress && /^0x[a-fA-F0-9]{40}$/.test(currentAddress) && currentAddress !== processedAddress) {
            handleWalletConnection(currentAddress);
          } else {
            console.warn('Address still not available after retry');
            alert('Wallet address not available. Please disconnect and reconnect your wallet.');
          }
        }, 1000);
      } else {
        alert('Invalid wallet address. Please reconnect your wallet.');
      }
      return;
    }
    
    console.log('handleWalletConnection - Processing wallet connection for:', walletAddress);
    setProcessedAddress(walletAddress);
    
    try {
      // Check if user exists with this wallet address (no signature required)
      console.log('Checking if user exists...');
      const meResponse = await fetch('/api/me', {
        credentials: 'include',
      });
      
      // Handle server errors (5xx) - don't proceed with signup, show error
      if (meResponse.status >= 500) {
        console.error('Server error checking user existence:', meResponse.status, meResponse.statusText);
        const errorText = await meResponse.text().catch(() => '');
        console.error('Error response:', errorText);
        alert('Server error. Please try again later. If this persists, the database may not be configured.');
        // DON'T reset processedAddress - keep it set to prevent useEffect loop
        processingRef.current = null;
        setIsProcessing(false);
        return;
      }
      
      if (!meResponse.ok && meResponse.status !== 404) {
        console.error('Failed to check user existence:', meResponse.status, meResponse.statusText);
        const errorText = await meResponse.text().catch(() => '');
        console.error('Error response:', errorText);
      }
      
      const meData = await meResponse.json().catch(async (parseError) => {
        console.error('Failed to parse /api/me response:', parseError);
        const text = await meResponse.text().catch(() => '');
        console.error('Response text:', text);
        return { user: null };
      });
      
      console.log('User check result:', { hasUser: !!meData.user, userId: meData.user?.id });
      
      if (meData.user) {
        // User exists - check profile completeness
        const hasUsername = meData.user.username && !meData.user.username.startsWith('user_');
        
        console.log('User exists, checking profile completeness...');
        const profileResponse = await fetch('/api/profile', {
          credentials: 'include',
        });
        
        let hasCompleteProfile = hasUsername;
        if (profileResponse.ok) {
          const profileData = await profileResponse.json().catch(() => ({ user: null }));
          const hasGender = profileData.user?.gender && profileData.user.gender !== null && profileData.user.gender !== '';
          const hasBirthday = profileData.user?.birthday && profileData.user.birthday !== null && profileData.user.birthday !== '';
          hasCompleteProfile = hasUsername && hasGender && hasBirthday;
          
          console.log('Profile completeness check:', {
            hasUsername,
            hasGender,
            hasBirthday,
            hasCompleteProfile,
            profileData: profileData.user
          });
        } else {
          console.warn('Failed to fetch profile:', profileResponse.status, profileResponse.statusText);
        }
        
        // User exists - redirect to home page
        console.log('User exists, redirecting to home');
        window.location.replace('/home');
      } else {
        // User doesn't exist - create account with wallet address
        console.log('User does not exist, attempting to create account for:', walletAddress);
        
        const signupResponse = await fetch('/api/auth/wallet-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            walletAddress: walletAddress,
          }),
        });
        
        console.log('Wallet signup - Response status:', signupResponse.status, signupResponse.statusText);

        if (signupResponse.ok) {
          console.log('Account created successfully, triggering onboarding');
          const responseData = await signupResponse.json().catch(() => ({}));
          console.log('Signup response data:', responseData);
          
          // Verify account was actually created
          const verifyResponse = await fetch('/api/me', {
            credentials: 'include',
          });
          const verifyData = await verifyResponse.json().catch(() => ({ user: null }));
          
          if (verifyData.user) {
            console.log('Account verified in database, redirecting to home');
            window.location.replace('/home');
          } else {
            console.error('Account creation reported success but user not found in database');
            processingRef.current = null;
            alert('Account creation may have failed. Please disconnect and reconnect your wallet to try again.');
          }
        } else {
          processingRef.current = null;
          let errorMessage = 'Failed to create account. Please disconnect and reconnect your wallet to try again.';
          try {
            const errorData = await signupResponse.json();
            errorMessage = errorData.error || errorMessage;
            console.error('Wallet signup failed:', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            try {
              const text = await signupResponse.text();
              console.error('Response text:', text);
              errorMessage = `Failed to create account (${signupResponse.status}): ${text.substring(0, 200)}`;
            } catch (e) {
              errorMessage = `Failed to create account (${signupResponse.status} ${signupResponse.statusText})`;
            }
          }
          
          console.error('Showing error alert to user:', errorMessage);
          alert(errorMessage);
        }
      }
    } catch (error) {
      // DON'T reset processedAddress - keep it set to prevent useEffect loop
      processingRef.current = null;
      console.error('Error handling wallet connection:', error);
      const errorMessage = `An error occurred. Please disconnect your wallet and try again.\n\nError: ${error instanceof Error ? error.message : String(error)}`;
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      processingRef.current = null;
    }
  };

  const handleConnectClick = () => {
    if (hasAccount === null) {
      return;
    }

    // Connect with Coinbase Wallet (first connector)
    const coinbaseConnector = connectors[0];
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    }
  };

  return (
    <div className={styles.walletButtonWrapper}>
      <button
        type="button"
        className={styles.connectWallet}
        onClick={handleConnectClick}
        disabled={isProcessing || hasAccount === null}
      >
        {isProcessing ? 'Processing...' : hasAccount === null ? 'Checking...' : buttonText}
      </button>
    </div>
  );
}
