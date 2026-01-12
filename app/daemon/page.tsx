'use client';

import Navbar from '@/components/navbar/Navbar';
import { DaemonTerminal } from '@/components/daemon/DaemonTerminal';
import { Footer } from '@/components/footer/Footer';
import styles from './page.module.css';

export default function DaemonPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Daemon AI v.2</h1>
              <p className={styles.subtitle}>
                Integrate the agentic daemon model in your research and workflow
              </p>
            </div>
          </div>

          <DaemonTerminal />
        </section>
      </main>
      <Footer />
    </>
  );
}
