import React from 'react';
import styles from './Banner.module.css';

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <p className={styles.bannerText}>
        The Learning Management Software made for the heart of Web3.
      </p>
    </div>
  );
};

export default Banner;

