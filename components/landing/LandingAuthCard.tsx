'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import styles from './LandingPage.module.css';

export const LandingAuthCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isWalletSignup, setIsWalletSignup] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(true);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    setShowAuthForm(isDesktop);
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (showOnboarding) {
        setShowOnboarding(false);
        setIsWalletSignup(false);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [showOnboarding]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let loginData;
      try {
        const text = await loginResponse.text();
        loginData = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse login response:', parseError);
        setMessage({ type: 'error', text: 'Invalid response from server. Please try again.' });
        setIsLoading(false);
        return;
      }

      if (loginResponse.ok) {
        setTimeout(() => {
          window.location.replace('/home');
        }, 100);
        return;
      }

      if (loginResponse.status === 401) {
        const errorMsg = loginData.error || 'Invalid email or password.';
        setMessage({
          type: 'error',
          text: `${errorMsg} Don't have an account? Switch to the Sign Up tab.`
        });
      } else {
        setMessage({
          type: 'error',
          text: loginData.error || 'Login failed. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let signupData;
      try {
        const text = await signupResponse.text();
        signupData = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse signup response:', parseError);
        setMessage({ type: 'error', text: 'Invalid response from server. Please try again.' });
        setIsLoading(false);
        return;
      }

      if (signupResponse.ok) {
        setShowOnboarding(true);
        setEmail('');
        setPassword('');
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
      } else {
        if (signupResponse.status === 409) {
          setMessage({
            type: 'error',
            text: 'An account with this email already exists. Switch to the Sign In tab to log in.'
          });
        } else {
          setMessage({
            type: 'error',
            text: signupData.error || 'Failed to create account. Please try again.'
          });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterAcademy = () => {
    window.location.replace('/home');
  };

  return (
    <>
      <div className={`${styles.loginCard} ${!showAuthForm ? styles.loginCardMinimal : ''}`}>
        <div className={styles.cardContent}>
          <div className={styles.loginHeader}>
            <div className={styles.logoContainer}>
              <Image
                src="/icons/spacey2klogo.png"
                alt="Logo"
                width={150}
                height={138}
                className={styles.logoImage}
              />
            </div>
            {showAuthForm && (
              <h1 className={styles.loginTitle}>
                {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h1>
            )}
          </div>

          {showAuthForm && (
            <div className={styles.tabSwitcher}>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'signin' ? styles.tabButtonActive : ''}`}
                onClick={() => {
                  setActiveTab('signin');
                  setMessage(null);
                  setEmail('');
                  setPassword('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`${styles.tabButton} ${activeTab === 'signup' ? styles.tabButtonActive : ''}`}
                onClick={() => {
                  setActiveTab('signup');
                  setMessage(null);
                  setEmail('');
                  setPassword('');
                }}
              >
                Sign Up
              </button>
            </div>
          )}

          <form className={styles.loginForm} onSubmit={activeTab === 'signin' ? handleLogin : handleSignup}>
            {message && (
              <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                {message.text}
              </div>
            )}

            {showAuthForm && activeTab === 'signin' && (
              <div className={styles.inputForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="signin-email" className={styles.label}>Email</label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 6.66667L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66667M4.16667 15H15.8333C16.7538 15 17.5 14.2538 17.5 13.3333V6.66667C17.5 5.74619 16.7538 5 15.8333 5H4.16667C3.24619 5 2.5 5.74619 2.5 6.66667V13.3333C2.5 14.2538 3.24619 15 4.16667 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="email"
                      id="signin-email"
                      name="email"
                      className={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="signin-password" className={styles.label}>Password</label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5.83333 9.16667V6.66667C5.83333 4.36548 7.69881 2.5 10 2.5C12.3012 2.5 14.1667 4.36548 14.1667 6.66667V9.16667M10 12.0833V14.1667M6.66667 17.5H13.3333C14.2538 17.5 15 16.7538 15 15.8333V10.8333C15 9.91286 14.2538 9.16667 13.3333 9.16667H6.66667C5.74619 9.16667 5 9.91286 5 10.8333V15.8333C5 16.7538 5.74619 17.5 6.66667 17.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="password"
                      id="signin-password"
                      className={styles.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="signin-rememberMe"
                      className={styles.checkbox}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="signin-rememberMe" className={styles.checkboxLabel}>
                      Remember this device
                    </label>
                  </div>
                  <a href="#" className={styles.forgotLink}>Forgot password?</a>
                </div>
              </div>
            )}

            {showAuthForm && activeTab === 'signup' && (
              <div className={styles.inputForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 6.66667L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66667M4.16667 15H15.8333C16.7538 15 17.5 14.2538 17.5 13.3333V6.66667C17.5 5.74619 16.7538 5 15.8333 5H4.16667C3.24619 5 2.5 5.74619 2.5 6.66667V13.3333C2.5 14.2538 3.24619 15 4.16667 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>Password</label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5.83333 9.16667V6.66667C5.83333 4.36548 7.69881 2.5 10 2.5C12.3012 2.5 14.1667 4.36548 14.1667 6.66667V9.16667M10 12.0833V14.1667M6.66667 17.5H13.3333C14.2538 17.5 15 16.7538 15 15.8333V10.8333C15 9.91286 14.2538 9.16667 13.3333 9.16667H6.66667C5.74619 9.16667 5 9.91286 5 10.8333V15.8333C5 16.7538 5.74619 17.5 6.66667 17.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="password"
                      id="password"
                      className={styles.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              {!showAuthForm && (
                <div className={styles.walletSectionPrimary}>
                  <button
                    type="button"
                    onClick={handleEnterAcademy}
                    className={styles.enterButton}
                  >
                    <span className={styles.enterButtonTextDesktop}>Enter Academy</span>
                    <span className={styles.enterButtonTextMobile}>Enter</span>
                  </button>
                </div>
              )}

              {showAuthForm && activeTab === 'signin' && (
                <button type="submit" className={styles.loginButton} disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              )}

              {showAuthForm && activeTab === 'signup' && (
                <button type="submit" className={styles.createAccountButton} disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              )}

              {!showAuthForm && (
                <div className={styles.authLinks}>
                  <button
                    type="button"
                    className={styles.authLink}
                    onClick={() => {
                      setShowAuthForm(true);
                      setActiveTab('signin');
                    }}
                  >
                    Sign In
                  </button>
                  <span className={styles.authLinkDivider}>|</span>
                  <button
                    type="button"
                    className={styles.authLink}
                    onClick={() => {
                      setShowAuthForm(true);
                      setActiveTab('signup');
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {showAuthForm && (
                <div className={styles.termsText}>
                  By joining Mental Wealth Academy, I confirm that I have read and agree to the{' '}
                  <a href="#" className={styles.link}>terms and services</a>,{' '}
                  <a href="#" className={styles.link}>privacy policy</a>, and to receive email updates.
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          setIsWalletSignup(false);
        }}
        isWalletSignup={isWalletSignup}
      />
    </>
  );
};

export default LandingAuthCard;
