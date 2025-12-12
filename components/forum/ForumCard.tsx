import React from 'react';
import Link from 'next/link';
import styles from './ForumCard.module.css';
import { PixelIcon } from './PixelIcon';

interface ForumCardProps {
  title: string;
  description: string;
  threads: number;
  posts: number;
  href: string;
  icon?: React.ReactNode;
}

export function ForumCard({ title, description, threads, posts, href, icon }: ForumCardProps) {
  const displayIcon = icon || <PixelIcon />;

  return (
    <Link href={href} className={styles.card} aria-label={`Open ${title}`}>
      <div className={styles.content}>
        {displayIcon && <div className={styles.icon}>{displayIcon}</div>}

        <div className={styles.textSection}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statValue}>{threads}</div>
        <div className={styles.statValue}>{posts}</div>
      </div>
    </Link>
  );
}

