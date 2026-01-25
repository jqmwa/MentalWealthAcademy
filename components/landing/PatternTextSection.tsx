import { RotatingTextSection } from './RotatingTextSection';
import styles from './PatternTextSection.module.css';
import landingStyles from './LandingPage.module.css';

export const PatternTextSection = () => {
  return (
    <section className={styles.patternSection}>
      <div className={styles.patternOverlay}></div>
      <div className={landingStyles.rotatingTextContainer}>
        <RotatingTextSection />
      </div>
    </section>
  );
};
