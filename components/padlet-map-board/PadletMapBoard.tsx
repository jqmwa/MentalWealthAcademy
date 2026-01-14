'use client';

import React from 'react';
import styles from './PadletMapBoard.module.css';

interface PadletMapBoardProps {
  embedId?: string;
}

export function PadletMapBoard({ embedId = 'x4138bt4k49fu20s' }: PadletMapBoardProps) {
  return (
    <div className={styles.padletWrapper}>
      <div className={styles.padletEmbed}>
        <iframe
          src={`https://padlet.com/embed/${embedId}`}
          frameBorder="0"
          allow="camera;microphone;geolocation;display-capture;clipboard-write"
          className={styles.padletIframe}
          title="Padlet Map Board"
          loading="lazy"
        />
        <div className={styles.padletAttribution}>
          <a
            href="https://padlet.com?ref=embed"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.padletLink}
          >
            <span className={styles.padletText} aria-hidden="true">
              Made with
            </span>
            <img
              src="https://padlet.net/emails/padlet_email_logo_2026_text-dark-200.png"
              height="12"
              className={styles.padletLogo}
              alt="Made with Padlet"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default PadletMapBoard;
