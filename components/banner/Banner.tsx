import React from 'react';
import styles from './Banner.module.css';

const Banner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <p className={styles.bannerText}>
        The Next Gen Micro-University
      </p>
    </div>
  );
};

export default Banner;

