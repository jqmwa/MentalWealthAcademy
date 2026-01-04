'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import SignInButton from '@/components/nav-buttons/SignInButton';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import styles from './LandingPage.module.css';

// Dynamically import Scene with aggressive lazy loading
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => null, // No loading indicator to avoid blocking
});

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Try login first
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Login successful - redirect to home
        // Use replace instead of href to avoid back button issues
        // Small delay to ensure cookie is set in Chrome
        setTimeout(() => {
          window.location.replace('/home');
        }, 100);
        return;
      }

      // If login fails, try signup
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Signup successful - show onboarding
        setShowOnboarding(true);
        setEmail('');
        setPassword('');
      } else {
        setMessage({ type: 'error', text: signupData.error || loginData.error || 'Failed to sign up. Please try again.' });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load Scene after page is fully interactive - don't block initial render
  useEffect(() => {
    // Wait for page to be interactive, then load Scene in background
    const loadScene = () => {
      // Use requestIdleCallback if available, otherwise wait for load event
      const win = window as any;
      if (win.requestIdleCallback) {
        win.requestIdleCallback(() => {
          setShowScene(true);
        }, { timeout: 2000 });
      } else {
        // Fallback: wait for page to be fully loaded
        if (document.readyState === 'complete') {
          setTimeout(() => setShowScene(true), 500);
        } else {
          win.addEventListener('load', () => {
            setTimeout(() => setShowScene(true), 500);
          }, { once: true });
        }
      }
    };
    
    // Start loading after a short delay to ensure page renders first
    const timer = setTimeout(loadScene, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.canvas}>
        {showScene && (
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        )}
      </div>
      
      {/* Logo in top left */}
      <div className={styles.topLeftLogo}>
        <Image
          src="/icons/spacey2klogo.png"
          alt="Logo"
          width={150}
          height={138}
          className={styles.topLeftLogoImage}
          priority
        />
      </div>
      
      {/* Cards Container */}
      <div className={styles.cardsContainer}>
        {/* Promotional Card */}
        <div className={styles.promoCard}>
          <div className={styles.promoContent}>
            <div className={styles.promoText}>
              <h2 className={styles.promoTitle}>Agentic Learning Infrastructure</h2>
              <p className={styles.promoDescription}>
                An agentic research-driven LMS platform exploring cyber-psychology, and testing pragmatic parasocial governance systems.
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className={styles.loginCard}>
          <div className={styles.cardContent}>
            <h1 className={styles.loginTitle}>Log In</h1>
            {/* Form */}
            <form className={styles.loginForm} onSubmit={handleLogin}>
              {message && (
                <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                  {message.text}
                </div>
              )}
              <div className={styles.inputForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
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
                      placeholder="Enter your email"
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
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
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className={styles.checkbox}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                      Keep me logged in
                    </label>
                  </div>
                  <a href="#" className={styles.forgotLink}>
                    Forgot username or password?
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <SignInButton onClick={() => setShowOnboarding(true)} />

                <button 
                  type="button"
                  className={styles.signupLink}
                  onClick={() => setShowOnboarding(true)}
                >
                  Become a MWA Researcher, <span className={styles.highlight}>Join today!</span>
                </button>
                
                <div className={styles.termsText}>
                  By logging in, you agree to our{' '}
                  <a href="#" className={styles.link}>terms and services</a>,{' '}
                  <a href="#" className={styles.link}>privacy policy</a>, and to receive email updates from Mental Wealth Academy.
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  );
};

export default LandingPage;

