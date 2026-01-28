'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PencilLoader from '@/components/landing/PencilLoader';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import styles from './page.module.css';

export default function AgentsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const hasCheckedAuthRef = useRef(false);

  // Check authentication via /api/me
  useEffect(() => {
    if (hasCheckedAuthRef.current) {
      return;
    }

    let isMounted = true;
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const response = await fetch('/api/me', {
          cache: 'no-store',
          credentials: 'include',
        });
        const data = await response.json();

        if (!isMounted) return;

        if (data.user) {
          setHasValidSession(true);
          hasCheckedAuthRef.current = true;
        } else {
          setHasValidSession(false);
        }
      } catch (err) {
        console.error('Failed to check authentication:', err);
        if (isMounted) {
          setHasValidSession(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasCheckedAuthRef.current && !isCheckingAuth && !hasValidSession) {
      router.push('/');
    }
  }, [isCheckingAuth, hasValidSession, router]);

  if (isCheckingAuth) {
    return (
      <>
        <PencilLoader hidden={false} />
        <main className={styles.main} style={{ visibility: 'hidden' }}></main>
      </>
    );
  }

  if (!hasValidSession && hasCheckedAuthRef.current) {
    return (
      <>
        <PencilLoader hidden={false} />
        <main className={styles.main} style={{ visibility: 'hidden' }}></main>
      </>
    );
  }

  return (
    <main className={styles.main}>
      <SideNavigation />
      <div className={styles.pageLayout}>
        <div className={styles.content}>
          <DaemonTerminal />
        </div>
      </div>
    </main>
  );
}
