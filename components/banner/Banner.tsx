import React from 'react';
import styles from './Banner.module.css';

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <p className={styles.bannerText}>
        Learn by doing
      </p>
    </div>
  );
};

export default Banner;

