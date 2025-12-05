import React from 'react';
import styles from './ForumCard.module.css';
import { PixelIcon } from './PixelIcon';

interface ForumCardProps {
  title: string;
  description: string;
  badge: {
    text: string;
    variant: 'default' | 'secondary' | 'outline' | 'cyan';
  };
  icon?: React.ReactNode;
}

export function ForumCard({ title, description, badge, icon }: ForumCardProps) {
  const displayIcon = icon || <PixelIcon />;

  const getBadgeClasses = () => {
    switch (badge.variant) {
      case 'cyan':
        return styles.badgeCyan;
      case 'default':
        return styles.badgeDefault;
      default:
        return styles.badgeDefault;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        {displayIcon && <div className={styles.icon}>{displayIcon}</div>}
        
        <div className={styles.textSection}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      <div className={styles.badgeContainer}>
        <div className={`${styles.badge} ${getBadgeClasses()}`}>
          {badge.text}
        </div>
      </div>
    </div>
  );
}

