'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import styles from './LandingPage.module.css';

// Dynamically import Scene with aggressive lazy loading
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => null,
});

export const LandingScene: React.FC = () => {
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    // Defer scene loading until after LCP (3 seconds delay)
    // This ensures the main content renders first
    const loadScene = () => {
      const win = window as any;
      if (win.requestIdleCallback) {
        win.requestIdleCallback(() => {
          setShowScene(true);
        }, { timeout: 5000 }); // 5 second timeout for idle callback
      } else {
        // Fallback: wait for page to be fully loaded
        if (document.readyState === 'complete') {
          setTimeout(() => setShowScene(true), 3000);
        } else {
          win.addEventListener('load', () => {
            setTimeout(() => setShowScene(true), 3000);
          }, { once: true });
        }
      }
    };

    // Start loading after 3 seconds to ensure LCP completes first
    const timer = setTimeout(loadScene, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.canvas}>
      {showScene && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
    </div>
  );
};

export default LandingScene;
