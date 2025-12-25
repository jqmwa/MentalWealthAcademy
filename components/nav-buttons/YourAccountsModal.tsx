'use client';

import React, { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import styles from './YourAccountsModal.module.css';

interface YourAccountsModalProps {
  onClose: () => void;
}

const YourAccountsModal: React.FC<YourAccountsModalProps> = ({ onClose }) => {
  const { user: privyUser } = usePrivy();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Extract wallet addresses from Privy user
  // Only show wallets that are explicitly linked through our system
  const wallets: string[] = [];
  // TODO: Implement wallet linking system - for now, show no wallets

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 5)}...${address.slice(-4)}`;
  };

  // Handle wallet disconnect (placeholder)
  const handleWalletDisconnect = (address: string) => {
    // TODO: Implement wallet disconnect functionality
    console.log('Disconnect wallet:', address);
  };

  // Handle social connect (placeholder)
  const handleSocialConnect = (platform: string) => {
    // TODO: Implement social connection functionality
    console.log('Connect:', platform);
  };

  // Handle social disconnect (placeholder)
  const handleSocialDisconnect = (platform: string) => {
    // TODO: Implement social disconnect functionality
    console.log('Disconnect:', platform);
  };

  return (
    <div className={styles.modalWrapper} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span>链接</span>Edit Connections
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <div className={styles.animatedButtonTextContainer}>
              <div className={styles.animatedButtonText}>CLOSE</div>
              <div className={`${styles.animatedButtonText} ${styles.animatedButtonTextClone}`}>CLOSE</div>
            </div>
          </button>
        </div>

        <div className={`${styles.modalBody} ${styles.bgPluses} ${styles.connectionsModal}`}>
          <div className={styles.connectionsContainer}>
            {/* Connected Ethereum Accounts Section */}
            <div>
              <p className={`${styles.strokedText} ${styles.large}`}>Connected Ethereum Accounts</p>
              <div className={styles.walletsContainer}>
                {wallets.length > 0 && wallets.map((wallet, index) => (
                  <div key={index} className={`${styles.wallet} ${styles.shadowInnerGlow}`}>
                    <div>
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 320 512"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"></path>
                      </svg>
                      <span>{formatAddress(wallet)}</span>
                    </div>
                    <button
                      className={`${styles.animatedButton} ${styles.animatedButtonDisconnect} ${styles.walletDisconnectButton}`}
                      onClick={() => handleWalletDisconnect(wallet)}
                    >
                      <div className={styles.animatedButtonTextContainer}>
                        <div className={styles.animatedButtonText}>UNLINK</div>
                        <div className={`${styles.animatedButtonText} ${styles.animatedButtonTextClone}`}>UNLINK</div>
                      </div>
                    </button>
                  </div>
                ))}
                <button className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton}`}>
                  <div className={styles.socialConnectTextContainer}>
                    <div className={styles.socialConnectText}>Link Ethereum Wallet</div>
                    <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>Link Ethereum Wallet</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Accounts Section */}
            <div>
              <p className={`${styles.strokedText} ${styles.large}`}>Social Accounts</p>
              <div className={styles.socialsContainer}>
                <button
                  className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton} ${styles.linkedinButton}`}
                  onClick={() => handleSocialConnect('linkedin')}
                >
                  <div className={styles.socialConnectTextContainer}>
                    <div className={styles.socialConnectText}>Connect LinkedIn</div>
                    <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>Connect LinkedIn</div>
                  </div>
                </button>
                <button
                  className={`${styles.btn} ${styles.connect} ${styles.socialConnectButton} ${styles.whatsappButton}`}
                  onClick={() => handleSocialConnect('whatsapp')}
                >
                  <div className={styles.socialConnectTextContainer}>
                    <div className={styles.socialConnectText}>Connect WhatsApp</div>
                    <div className={`${styles.socialConnectText} ${styles.socialConnectTextClone}`}>Connect WhatsApp</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2FA Authenticators Section */}
            <div>
              <p className={`${styles.strokedText} ${styles.large}`}>2FA Authenticators</p>
              <div className={`${styles.emptyContainer} ${styles.tall} ${styles.gap}`}>
                <span>No 2FA setup yet</span>
                <span>Add 2FA to protect your account</span>
              </div>
              <a href="/api/authenticator/add">
                <button className={`${styles.btn} ${styles.wide}`}>add authenticator</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourAccountsModal;

