'use client';

import React from 'react';
import styles from './ForumRulesModal.module.css';

interface ForumRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const rules = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.',
  'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime.',
];

export function ForumRulesModal({ isOpen, onClose }: ForumRulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      
      <div className={styles.modal}>
        <div className={styles.header}>
          <h1 className={styles.title}>Rules</h1>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.rulesList}>
            {rules.map((rule, index) => (
              <div key={index} className={styles.ruleItem}>
                <span className={styles.ruleNumber}>{index + 1}</span>
                <p className={styles.ruleText}>{rule}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.understandButton}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

