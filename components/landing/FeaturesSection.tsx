'use client';

import React from 'react';
import Image from 'next/image';
import styles from './FeaturesSection.module.css';

const features = [
  {
    icon: '/icons/4b31ae03-5c43-4b80-9526-730a6b5a6c09 1.png',
    title: 'Research Library',
    description: 'Access a comprehensive library of mental health research, papers, and resources curated by the community.',
  },
  {
    icon: '/icons/c4c15e74-d725-4715-8000-edd05808a0ed 1.png',
    title: 'Quests & Learning',
    description: 'Complete interactive quests, earn rewards, and build your mental wealth through gamified education experiences.',
  },
  {
    icon: '/icons/f36a4cca-81ba-4103-8cf1-114190d63f4c 1.png',
    title: 'AI-Powered Support',
    description: 'Interact with Azura, our AI companion designed to provide personalized mental health guidance and support.',
  },
  {
    icon: '/icons/f619761a-7a68-4cc2-ab38-bbc05ba27486 1.png',
    title: 'Community Governance',
    description: 'Participate in decentralized decision-making to fund research and shape the future of mental health care.',
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
                  width={80}
                  height={120}
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
