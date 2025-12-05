import React from 'react';
import styles from './SignInButton.module.css';

const SignInButton: React.FC = () => {
  return (
    <button className={styles.signInButton}>
      <img 
        src="/icons/ethlogo.svg" 
        alt="Ethereum logo" 
        className={styles.ethLogo}
      />
      <span className={styles.buttonText}>Sign In With Ethereum</span>
    </button>
  );
};

export default SignInButton;

