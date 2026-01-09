'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import SignInButton from '@/components/nav-buttons/SignInButton';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { WalletConnectionHandler } from './WalletAdvancedDemo';
import { PatternTextSection } from './PatternTextSection';
import { LandingFooter } from './LandingFooter';
import styles from './LandingPage.module.css';

// Dynamically import Scene with aggressive lazy loading
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => null, // No loading indicator to avoid blocking
});

// Donation Popup Component
const DonationPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup on large screens only and after scrolling past company logos
    const checkVisibility = () => {
      if (window.innerWidth < 1024) {
        setIsVisible(false);
        return;
      }

      // Find the company logos section
      const logosSection = document.querySelector('[class*="companyLogosSection"]');
      if (!logosSection) {
        setIsVisible(false);
        return;
      }

      // Get the bottom position of the logos section
      const logosRect = logosSection.getBoundingClientRect();
      const logosBottom = logosRect.bottom + window.scrollY;
      const currentScroll = window.scrollY + window.innerHeight;

      // Show popup only if user has scrolled past the logos section
      setIsVisible(currentScroll > logosBottom);
    };

    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={styles.donationPopup}>
      <div className={styles.donationPopupContainer}>
        <div className={styles.donationPopupContent}>
          <div className={styles.donationPopupCorner}>
            <svg width="138" height="130" viewBox="0 0 138 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40.3487 0H0V40.3487H40.3487V0Z" fill="#232323"></path>
              <path d="M137.556 0H97.2068V40.3487H137.556V0Z" fill="#232323"></path>
              <path d="M40.3487 89.6514H0V130H40.3487V89.6514Z" fill="#232323"></path>
              <path d="M88.9712 0H48.5847V130H137.707V89.6513H88.9712V0Z" fill="#232323"></path>
            </svg>
          </div>
          <div className={styles.donationPopupText}>
            <h2 className={styles.donationPopupHeading}>Reshape the future of mental health.</h2>
            <p className={styles.donationPopupDescription}>
              Long-term held cryptocurrency investments can unlock additional funds for charity
            </p>
          </div>
          <a 
            className={styles.donationPopupButton} 
            href="https://artizen.fund/index/p/mental-wealth-academy?season=6"
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate now
          </a>
          <button 
            className={styles.donationPopupClose}
            onClick={() => setIsVisible(false)}
            aria-label="Close donation popup"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.41431" width="20" height="2" transform="rotate(45 1.41431 0)" fill="white"></rect>
              <rect x="0.000244141" y="14.3643" width="20" height="2" transform="rotate(-45 0.000244141 14.3643)" fill="white"></rect>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Rotating Text Component
export const RotatingTextSection: React.FC = () => {
  const texts = React.useMemo(() => [
    'gain agency in their lives',
    'fund holistic decisions',
    'control their own destiny'
  ], []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWidth, setCurrentWidth] = useState(0);
  const [textWidths, setTextWidths] = useState<number[]>([]);
  const textItemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [texts.length]);

  // Measure the width of all texts to size each item properly
  // Using a more accurate method that accounts for font rendering
  useEffect(() => {
    const measureAllWidths = () => {
      const fontSize = window.innerWidth >= 768 ? '2.65rem' : '1.2rem';
      const widths = texts.map((text, idx) => {
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'nowrap';
        span.style.fontSize = fontSize;
        span.style.fontFamily = 'var(--font-primary)';
        span.style.fontWeight = 'inherit';
        span.style.letterSpacing = 'normal';
        span.style.textRendering = 'optimizeLegibility';
        (span.style as any).webkitFontSmoothing = 'antialiased';
        (span.style as any).mozOsxFontSmoothing = 'grayscale';
        span.textContent = text;
        document.body.appendChild(span);
        
        // Use getBoundingClientRect for more accurate measurement
        const rect = span.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        
        document.body.removeChild(span);
        
        // Add generous buffer: 5% of width + fixed buffer based on font size
        const percentageBuffer = Math.ceil(width * 0.05);
        const fixedBuffer = window.innerWidth >= 768 ? 20 : 10;
        const finalWidth = width + percentageBuffer + fixedBuffer;
        
        return finalWidth;
      });
      setTextWidths(widths);
    };

    measureAllWidths();
    window.addEventListener('resize', measureAllWidths);
    return () => window.removeEventListener('resize', measureAllWidths);
  }, [texts]);

  // Measure actual rendered element after mount for verification
  useEffect(() => {
    if (textItemRefs.current[currentIndex]) {
      const element = textItemRefs.current[currentIndex];
      if (element) {
        const rect = element.getBoundingClientRect();
        const actualWidth = Math.ceil(rect.width);
        const computedStyle = window.getComputedStyle(element);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        // If actual width is larger than measured, use the larger value
        if (actualWidth > currentWidth) {
          setCurrentWidth(actualWidth + 10); // Add small buffer
        }
      }
    }
  }, [currentIndex, currentWidth]);

  // Update current width when index changes
  useEffect(() => {
    if (textWidths.length > 0 && textWidths[currentIndex]) {
      setCurrentWidth(textWidths[currentIndex]);
    }
  }, [currentIndex, textWidths]);

  // Calculate rotation for 3D effect
  const rotation = currentIndex * 120; // 120 degrees per item (360 / 3)

  return (
    <div className={styles.rotatingTextContainer}>
      <div className={styles.rotatingTextLines}>
        <h3 className={styles.rotatingTextHeading}>
          <span className={styles.rotatingTextStatic}>Helping people</span>
          <div 
            className={styles.rotatingTextWrapper}
            style={{ 
              width: currentWidth > 0 ? `${currentWidth}px` : 'auto',
              height: '50px',
              perspective: '1000px',
              overflow: 'visible',
              display: 'inline-block',
              verticalAlign: 'middle',
              transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div 
              className={styles.rotatingTextInner}
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${-rotation}deg)`,
                transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                height: '100%'
              }}
            >
              {texts.map((text, index) => {
                const itemRotation = index * 120;
                return (
                  <div
                    key={index}
                    ref={(el) => { 
                      textItemRefs.current[index] = el;
                    }}
                    className={styles.rotatingTextItem}
                    style={{
                      transform: `translateX(-50%) rotateX(${itemRotation}deg) translateZ(60px)`,
                      backfaceVisibility: 'hidden',
                      width: 'auto',
                      left: '50%',
                      transformOrigin: 'center center'
                    }}
                  >
                    {text}
                  </div>
                );
              })}
            </div>
          </div>
        </h3>
        <p className={styles.rotatingTextStaticLine}>with other humans for a better world</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const [isWalletSignup, setIsWalletSignup] = useState(false);

  // Listen for profile updates to re-check wallet connection status
  useEffect(() => {
    const handleProfileUpdate = () => {
      // When profile is updated, check if we should redirect
      // This will be handled by WalletConnectionHandler's useEffect
      if (showOnboarding) {
        setShowOnboarding(false);
        setIsWalletSignup(false);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [showOnboarding]);
  
  const handleGoogleSignup = async () => {
    try {
      const response = await fetch('/api/auth/google/initiate', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          setMessage({ type: 'error', text: 'Google sign-up is not yet available. Please use email and password to create an account.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Google sign-up is not yet available. Please use email and password to create an account.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Google sign-up is not yet available. Please use email and password to create an account.' });
    }
  };
  
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
        // Dispatch event to notify wallet component that user now has an account
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
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
      
      {/* Cards Container */}
      <div className={styles.cardsContainer}>
        {/* Promotional Card */}
        <div className={styles.promoCard}>
          <div className={styles.promoLogoContainer}>
            <Image
              src="/icons/spacey2klogo.png"
              alt="Logo"
              width={150}
              height={138}
              className={styles.promoLogoImage}
              priority
            />
          </div>
          <div className={styles.promoContent}>
            <div className={styles.promoText}>
              <h2 className={styles.promoTitle}>THE NEXT GEN MICRO-UNIVERSITY</h2>
              <p className={styles.promoDescription}>
              A nascent mental wealth education community using DAO tools to learn, organize, and grow together.
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className={styles.loginCard}>
          <div className={styles.cardContent}>
            <div className={styles.loginHeader}>
              <div className={styles.logoContainer}>
                <Image
                  src="/icons/spacey2klogo.png"
                  alt="Logo"
                  width={150}
                  height={138}
                  className={styles.logoImage}
                  priority
                />
              </div>
              <h1 className={styles.loginTitle}>Create account</h1>
            </div>
            
            {/* Google Sign Up Button - Hidden for now */}
            {false && (
              <div className={styles.googleSignupSection}>
                <button
                  type="button"
                  className={styles.googleButton}
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H15.9564C17.4382 14.5227 18.3409 12.5545 18.3409 9.20454H17.64Z" fill="#4285F4"/>
                    <path d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L11.0477 13.5613C10.2418 14.1013 9.21091 14.4204 9 14.4204C6.65455 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65455 3.57955 9 3.57955Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                
                <div className={styles.divider}>
                  <span className={styles.dividerText}>or</span>
                </div>
              </div>
            )}

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
                      Remember this device
                    </label>
                  </div>
                  <a href="#" className={styles.forgotLink}>
                    Forgot username or password?
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <SignInButton onClick={() => setShowOnboarding(true)} />

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Join Decentralized Members'}
                </button>
                
                {/* Wallet Connection */}
                <div className={styles.walletSection}>
                  <WalletConnectionHandler 
                    onWalletConnected={(address) => {
                      setIsWalletSignup(true);
                      setShowOnboarding(true);
                    }}
                    buttonText="Connect With Ethereum"
                  />
                </div>
                
                <div className={styles.termsText}>
                  By joining Mental Wealth Academy, I confirm that I have read and agree to the{' '}
                  <a href="#" className={styles.link}>terms and services</a>,{' '}
                  <a href="#" className={styles.link}>privacy policy</a>, and to receive email updates.
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Company Logos Section */}
      <div className={styles.companyLogosSection}>
        <p className={styles.trustedByText}>Ecosystem & Research Foundations</p>
        <div className={styles.logosGrid}>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/full-ethereum-logo.png"
              alt="Ethereum logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/OP_vertical_1200px.png"
              alt="Optimism logo"
              width={120}
              height={80}
              className={`${styles.logoImage} ${styles.optimismLogo}`}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/Base-Logo-New-1.png"
              alt="Base logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/foundation-dark.621f9c538e70-1.png"
              alt="Foundation logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/full-aragon-logo.png"
              alt="Aragon logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/gitcoin.png"
              alt="Gitcoin logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/Logo_ElizaOS_Blue_RGB.png"
              alt="ElizaOS logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/ieee_logo_icon_169993.webp"
              alt="IEEE logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/American_Psychological_Association_logo.svg.png"
              alt="American Psychological Association logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/World_Health_Organization_Logo.svg.png"
              alt="World Health Organization logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/1_o5Q3503plQP12FtVSn0nXQ.png"
              alt="Partner logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
          <div className={styles.logoItem}>
            <Image
              src="/companylogos/ndW713QDOQJJBgB-aJvrIJ8U2HfKTYL4-h3RRtYNgX9DMzlziKfCVRdTnq4mHGltuCtutlq37GKdfB90YKodWg.webp"
              alt="Partner logo"
              width={120}
              height={80}
              className={styles.logoImage}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* The Opportunity Section */}
      <section id="opportunity" className={styles.opportunitySection}>
        <div className={styles.opportunityContainer}>
          <div className={styles.opportunityGrid}>
            <div className={styles.opportunityLeft}>
              <h1 className={styles.opportunityTitle}>The Opportunity</h1>
              <div className={styles.opportunityTextTop}>
                <p>Over 1 in 5 U.S. adults experience mental illness. Access to care is the growing concern as wealth gap rises, making this one of the largest crises of our generation.</p>
              </div>
              <div className={styles.opportunityImageWrapper}>
                <div className={styles.opportunityImageContainer}>
                  <Image
                    src="/uploads/opportunity.png"
                    alt="Mental health opportunity"
                    fill
                    className={styles.opportunityImage}
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 384px, 384px"
                  />
                </div>
              </div>
              <div className={styles.opportunityTextBottom}>
                <p>We need providers that aren&apos;t overworked through exploitative contracts, and capable of helping low-income families who desire change. This isn&apos;t a labor problem, it&apos;s a systemic one. Mental Health solutions can&apos;t flourish under hyper-financialized systems. reshaping how we govern these funds, essentially gives humans more control.</p>
              </div>
            </div>
            <div className={styles.opportunityRight}>
              <ul className={styles.opportunityList}>
                <li className={styles.opportunityListItem}>
                  <div className={styles.opportunityListItemIcon}>
                    <div className={styles.opportunityListItemIconContainer}>
                      <Image
                        src="/icons/Clinical Icon.svg"
                        alt="Clinical Care"
                        fill
                        className={styles.opportunityListItemIconImage}
                      />
                    </div>
                  </div>
                  <div className={styles.opportunityListItemContent}>
                    <h5 className={styles.opportunityListItemTitle}>Clinical Care</h5>
                    <div className={styles.opportunityListItemText}>
                      <p>Traditional mental health services often rely on outdated models that prioritize profit over patient outcomes. We&apos;re working to transform clinical care through community-governed funding that ensures providers can focus on healing rather than billing cycles.</p>
                    </div>
                  </div>
                </li>
                <li className={styles.opportunityListItem}>
                  <div className={styles.opportunityListItemIcon}>
                    <div className={styles.opportunityListItemIconContainer}>
                      <Image
                        src="/icons/Mental Health Icon.svg"
                        alt="Community Support"
                        fill
                        className={styles.opportunityListItemIconImage}
                      />
                    </div>
                  </div>
                  <div className={styles.opportunityListItemContent}>
                    <h5 className={styles.opportunityListItemTitle}>Community Support</h5>
                    <div className={styles.opportunityListItemText}>
                      <p>Peer support networks and community-based care have shown remarkable effectiveness, yet they remain underfunded. We&apos;re building sustainable models that empower local communities to create and maintain their own mental wellness infrastructure.</p>
                    </div>
                  </div>
                </li>
                <li className={styles.opportunityListItem}>
                  <div className={styles.opportunityListItemIcon}>
                    <div className={styles.opportunityListItemIconContainer}>
                      <Image
                        src="/icons/Mental Health Icon (1).svg"
                        alt="Prevention & Early Intervention"
                        fill
                        className={styles.opportunityListItemIconImage}
                      />
                    </div>
                  </div>
                  <div className={styles.opportunityListItemContent}>
                    <h5 className={styles.opportunityListItemTitle}>Prevention & Early Intervention</h5>
                    <div className={styles.opportunityListItemText}>
                      <p>Early intervention can prevent mental health crises before they escalate, but current systems prioritize reactive care. We&apos;re funding programs that identify and address mental health challenges early, reducing long-term suffering and costs.</p>
                    </div>
                  </div>
                </li>
                <li className={styles.opportunityListItem}>
                  <div className={styles.opportunityListItemIcon}>
                    <div className={styles.opportunityListItemIconContainer}>
                      <Image
                        src="/icons/Mental Health Icon (2).svg"
                        alt="Crisis Response"
                        fill
                        className={styles.opportunityListItemIconImage}
                      />
                    </div>
                  </div>
                  <div className={styles.opportunityListItemContent}>
                    <h5 className={styles.opportunityListItemTitle}>Crisis Response</h5>
                    <div className={styles.opportunityListItemText}>
                      <p>Mental health crises require immediate, compassionate response, yet many communities lack adequate crisis intervention services. We&apos;re supporting alternatives to traditional emergency responses that prioritize de-escalation and connection over institutionalization.</p>
                    </div>
                  </div>
                </li>
                <li className={styles.opportunityListItem}>
                  <div className={styles.opportunityListItemIcon}>
                    <div className={styles.opportunityListItemIconContainer}>
                      <Image
                        src="/icons/Mental Health Icon (3).svg"
                        alt="AI-Governance"
                        fill
                        className={styles.opportunityListItemIconImage}
                      />
                    </div>
                  </div>
                  <div className={styles.opportunityListItemContent}>
                    <h5 className={styles.opportunityListItemTitle}>AI-Governance</h5>
                    <div className={styles.opportunityListItemText}>
                      <p>Community-governed funds represent a new paradigm where collective decision-making meets intelligent automation. By partnering with adaptive AI systems, we&apos;re creating a future where human wisdom guides resource allocation while machine intelligence optimizes outcomes, ensuring every dollar serves those who need it most.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern Background Section */}
      <PatternTextSection />

      {/* Footer */}
      <LandingFooter />

      {/* Donation Popup */}
      <DonationPopup />

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => {
          setShowOnboarding(false);
          setIsWalletSignup(false);
        }}
        isWalletSignup={isWalletSignup}
      />
    </div>
  );
};

export default LandingPage;

