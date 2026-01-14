'use client';

import React from 'react';
import Image from 'next/image';
import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: '/icons/questbadge.png',
    title: 'Quests & Learning',
    description: 'Complete interactive quests, earn rewards, and build your mental wealth through gamified education experiences.',
  },
  {
    icon: '/icons/Library.png',
    title: 'Research Library',
    description: 'Access a comprehensive library of mental health research, papers, and resources curated by the community.',
  },
  {
    icon: '/icons/Voting.png',
    title: 'Community Governance',
    description: 'Participate in decentralized decision-making to fund research and shape the future of mental health care.',
  },
  {
    icon: '/icons/daemon.svg',
    title: 'AI-Powered Support',
    description: 'Interact with Azura, our AI companion designed to provide personalized mental health guidance and support.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.supTitle}>Features</p>
          <h2 className={styles.title}>
            Mental Wealth Academy is <span className={styles.highlight}>more</span> than just education
          </h2>
          <p className={styles.description}>
            The crux of next gen education is a network not a platform. An ecosystem of cutting-edge AI technology, community governance, 
            and transparent research funding to transform mental wealth worldwide.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={60}
                  height={60}
                  className={styles.icon}
                />
              </div>
              <div className={styles.content}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
