'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useModal } from 'connectkit';
import { getWalletAuthHeaders } from '@/lib/wallet-api';
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
  const { setOpen } = useModal();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAddress, setProcessedAddress] = useState<string | null>(null);
  const [hasTriggeredOnboarding, setHasTriggeredOnboarding] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null); // null = checking, true/false = known
  const processingRef = useRef<string | null>(null); // Track which address is currently being processed

  // If we have a valid address from wagmi's useAccount hook, that's sufficient.
  // Some wallets may report isConnected before address is available, but we handle
  // that by waiting for the address to appear.

  // Handle wallet connection and user check/creation
  // IMPORTANT: Wait for user to complete the ConnectKit flow (select wallet, approve connection)
  // before attempting to process the connection. Don't rush - wait for both isConnected AND address.
  useEffect(() => {
    // Don't process if:
    // - Not connected yet (user hasn't completed ConnectKit flow)
    // - Already processing
    // - No address available yet (wallet connection not fully established)
    // - Address already processed
    if (!isConnected) {
      // User hasn't connected yet - they need to click "Connect Wallet" and complete the modal flow
      return;
    }
    
    if (isProcessing) {
      // Already processing a connection
      return;
    }
    
    if (!address) {
      // Wallet is "connected" but address not available yet - wait for it
      // This happens when user is in the middle of the ConnectKit flow
      console.log('Wallet connected but address not available yet - waiting for connection to complete...');
      return;
    }
    
    if (processedAddress === address) {
      // This address was already processed
      return;
    }
    
    // Validate address format before proceeding
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      console.log('Invalid address format, waiting for valid address...');
      return;
    }
    
    // Don't process if we're already processing this address
    if (processingRef.current === address) {
      return;
    }
    
    // Wait for connection to be fully established before processing
    // This ensures the user has completed the ConnectKit modal flow:
    // 1. Clicked "Connect Wallet" button
    // 2. Selected their wallet (Family, MetaMask, etc.) in the modal
    // 3. Approved the connection in their wallet
    // 4. Wallet is now fully connected with address available
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
    
    // We rely on wagmi's useAccount hook which handles wallet connections properly.
    // If address is not available from useAccount, we simply wait - wagmi will provide
    // it when the wallet is fully connected and ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isProcessing, processedAddress]);

  // Check if user has an account (email/password account) on mount and when login status changes
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

    // Listen for login events to re-check account status
    const handleLogin = () => {
      setTimeout(checkAccount, 500); // Small delay to ensure session is set
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
      // Wait a bit for the profile to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-check if wallet is connected and profile is complete
      if (isConnected && address && !isProcessing) {
        // Reset processed address to allow re-check
        setProcessedAddress(null);
        // Small delay to ensure state is reset, then trigger re-check
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
      // Reset processing state
      processingRef.current = null;
      setIsProcessing(false);
      // For Family wallets, this might be a temporary issue - don't show alert immediately
      // Instead, wait a bit and retry if wallet is still connected
      if (isConnected) {
        console.log('Address not available yet, will retry in 1 second...');
        // Use a closure to capture the current address from useAccount
        const currentAddress = address;
        setTimeout(() => {
          // Re-check if address is now available
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
      // Check if user exists with this wallet address
      console.log('Checking if user exists...');
      const meResponse = await fetch('/api/me', {
        headers: getWalletAuthHeaders(walletAddress),
      });
      
      if (!meResponse.ok) {
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
        // User exists - check if they have complete profile details
        // Check if username is not the temporary one (starts with "user_")
        const hasUsername = meData.user.username && 
          !meData.user.username.startsWith('user_');
        
        // Check profile completeness by fetching full profile
        console.log('User exists, checking profile completeness...');
        const profileResponse = await fetch('/api/profile', {
          headers: getWalletAuthHeaders(walletAddress),
        });
        
        let hasCompleteProfile = hasUsername;
        if (profileResponse.ok) {
          const profileData = await profileResponse.json().catch(() => ({ user: null }));
          // Profile is complete if it has username, gender, and birthday
          // Check user object in the response
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
        // Home page will check if profile is complete and show onboarding/avatar modals as needed
        console.log('User exists, redirecting to home');
        window.location.replace('/home');
      } else {
        // User doesn't exist - create account with wallet address
        console.log('User does not exist, attempting to create account for:', walletAddress);
        const authHeaders = getWalletAuthHeaders(walletAddress);
        console.log('Wallet signup - Sending wallet address:', walletAddress);
        console.log('Wallet signup - Auth headers:', Object.keys(authHeaders));
        
        // If we've gotten this far, we have a valid address from wagmi
        // Send wallet address in both Authorization header and request body for clarity
        const signupResponse = await fetch('/api/auth/wallet-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            walletAddress: walletAddress,
          }),
        });
        
        console.log('Wallet signup - Response status:', signupResponse.status, signupResponse.statusText);
        console.log('Wallet signup - Response headers:', Object.fromEntries(signupResponse.headers.entries()));

        if (signupResponse.ok) {
          // Account created - trigger onboarding for profile details
          console.log('Account created successfully, triggering onboarding');
          const responseData = await signupResponse.json().catch(() => ({}));
          console.log('Signup response data:', responseData);
          
          // Verify account was actually created by checking /api/me
          const verifyResponse = await fetch('/api/me', {
            headers: getWalletAuthHeaders(walletAddress),
          });
          const verifyData = await verifyResponse.json().catch(() => ({ user: null }));
          
          if (verifyData.user) {
            console.log('Account verified in database, redirecting to home');
            // Redirect to home page - it will check if profile is complete and show onboarding/avatar modals
            window.location.replace('/home');
          } else {
            console.error('Account creation reported success but user not found in database');
            // Reset state to allow retry
            setProcessedAddress(null);
            processingRef.current = null;
            alert('Account creation may have failed. Please try disconnecting and reconnecting your wallet.');
          }
        } else {
          // Reset processedAddress to allow retry (user can disconnect/reconnect to retry)
          setProcessedAddress(null);
          processingRef.current = null;
          let errorMessage = 'Failed to create account. Please try again.';
          let errorDetails: any = null;
          try {
            const errorData = await signupResponse.json();
            errorMessage = errorData.error || errorMessage;
            errorDetails = errorData;
            console.error('Wallet signup failed:', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            console.error('Response status:', signupResponse.status, signupResponse.statusText);
            // Try to get response text for debugging
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
      // Reset processedAddress to allow retry
      setProcessedAddress(null);
      processingRef.current = null;
      console.error('Error handling wallet connection:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      const errorMessage = `An error occurred. Please try again.\n\nError: ${error instanceof Error ? error.message : String(error)}`;
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      processingRef.current = null;
    }
  };

  const handleConnectClick = () => {
    // If we're still checking account status, wait
    if (hasAccount === null) {
      return;
    }

    // Open wallet connection modal
    setOpen(true);
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
