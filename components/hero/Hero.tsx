import React from 'react';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBackground}></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

