import React from 'react';
import styles from './ExploreQuestsButton.module.css';

const ExploreQuestsButton: React.FC = () => {
  return (
    <button className={styles.exploreQuestsButton}>
      <span className={styles.buttonText}>Explore Quests</span>
    </button>
  );
};

export default ExploreQuestsButton;

