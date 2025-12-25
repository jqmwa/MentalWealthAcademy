import React from 'react';
import Image from 'next/image';
import styles from './FarcasterFriends.module.css';

interface ContributorCardProps {
  imageUrl: string;
}

const ContributorCard: React.FC<ContributorCardProps> = ({ imageUrl }) => {
  return (
    <div className={styles.contributorCard}>
      <Image
        src={imageUrl}
        alt="Contributor"
        fill
        className={styles.contributorImage}
      />
    </div>
  );
};

const FarcasterFriends: React.FC = () => {
  const contributors = [
    {
      imageUrl: 'https://i.imgur.com/iAnd0bK.png',
    },
    {
      imageUrl: 'https://i.imgur.com/uKbAEnb.png',
    },
    {
      imageUrl: 'https://i.imgur.com/aEejWYu.png',
    },
    {
      imageUrl: 'https://i.imgur.com/iqnfnJI.png',
    },
  ];

  return (
    <div className={styles.container} data-intro="farcaster-friends">
      <div className={styles.header}>
        <h2 className={styles.title}>Top Friends</h2>
        <p className={styles.description}>Top contributors from Farcaster platform.</p>
      </div>
      
      <div className={styles.cardsGrid}>
        {contributors.map((contributor, index) => (
          <ContributorCard
            key={index}
            imageUrl={contributor.imageUrl}
          />
        ))}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.footer}>
        <button className={styles.seeAllButton}>See All</button>
      </div>
    </div>
  );
};

export default FarcasterFriends;

