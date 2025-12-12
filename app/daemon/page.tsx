'use client';

import Navbar from '@/components/navbar/Navbar';
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import styles from './page.module.css';

export default function DaemonPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.shell}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Daemon</h1>
              <p className={styles.heroSubtitle}>
                Pick a tool. Paste text. Generate.
              </p>
            </div>
            <div className={styles.heroGlow} />
          </section>

          <DaemonTerminal />
        </section>
      </main>
    </>
  );
}
