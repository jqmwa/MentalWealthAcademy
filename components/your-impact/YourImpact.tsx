'use client';

import React from 'react';
import styles from './YourImpact.module.css';

export default function YourImpact() {
  return (
    <div className={styles.content}>
        {/* Your Impact Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Impact</h2>
            <p className={styles.sectionDescription}>
              Your participation shapes decisions and guides resources toward meaningful initiatives.
            </p>
          </div>
          
          <div className={styles.metricsContainer}>
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
              <span className={styles.metricValue}>2 initiatives activated</span>
            </div>
          </div>
        </div>

        {/* Your Voice Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Voice</h2>
            <p className={styles.sectionDescription}>
              Your feedback is heard, remembered, and actively informs future proposals and decisions.
            </p>
          </div>
          
          <div className={styles.metricsContainer}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Last Contribution</span>
              <span className={styles.metricValue}>Jan 4 - Incorporated</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Themes You Care About</span>
              <span className={styles.metricValue}>Access, Prevention, Support</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Agent Memory</span>
              <span className={styles.metricValue}>Active - Informing proposals</span>
            </div>
          </div>
        </div>

        {/* System Health Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>System Health</h2>
            <p className={styles.sectionDescription}>
              The governance system is operating smoothly with low-intensity, reflective participation.
            </p>
          </div>
          
          <div className={styles.statusContainer}>
            <div className={styles.statusBadge}>
              <span className={styles.statusLabel}>This week&apos;s discussions: High signal</span>
              <div className={styles.statusTags}>
                <span className={styles.statusIntensity}>Low-intensity</span>
                <span className={styles.statusUrgency}>No urgency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals Moving Toward Funding */}
        <div className={styles.section}>
          <div className={styles.proposalsContainer}>
            <div className={styles.proposalsHeader}>
              <span className={styles.proposalsTitle}>Proposals Moving Toward Funding</span>
            </div>
            <div className={styles.proposalsList}>
              <div className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>Mental Health Access Initiative</span>
                  <span className={styles.proposalStatus}>Moving toward funding</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
              <div className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>Community Support Program</span>
                  <span className={styles.proposalStatus}>In review</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
              <div className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>Prevention Framework</span>
                  <span className={styles.proposalStatus}>Gathering input</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
