'use client';

import React from 'react';
import styles from './YourImpact.module.css';

export default function YourImpact() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Impact Dashboard</h2>
      </div>

      <div className={styles.content}>
        {/* Your Impact */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Impact</h3>
          <div className={styles.metricsList}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Decisions Influenced</span>
              <span className={styles.metricValue}>3 this month</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Funds Guided</span>
              <span className={styles.metricValue}>$x,xxx allocated</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Communities Supported</span>
              <span className={styles.metricValue}>2 initiatives</span>
            </div>
          </div>
        </div>

        {/* Your Voice */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Voice</h3>
          <div className={styles.metricsList}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Last Contribution</span>
              <span className={styles.metricValue}>Jan 4 - Incorporated</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Themes You Care About</span>
              <span className={styles.metricValue}>Access, Prevention</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Agent Memory</span>
              <span className={styles.metricValue}>Active</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>System Health</h3>
          <div className={styles.metricsList}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>This Week&apos;s Discussions</span>
              <span className={styles.metricValue}>High signal</span>
            </div>
            <div className={styles.statusTags}>
              <span className={styles.tag}>Low-intensity</span>
              <span className={styles.tag}>No urgency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
