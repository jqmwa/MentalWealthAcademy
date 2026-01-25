import styles from './LandingFooter.module.css';

export const LandingFooter = () => {
  // Use a fixed year for server rendering to avoid hydration mismatch
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>
          © {year} Mental Wealth Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
