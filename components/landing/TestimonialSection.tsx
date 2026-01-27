import Image from 'next/image';
import styles from './TestimonialSection.module.css';

export const TestimonialSection: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageMask}>
                <Image
                  src="/uploads/hero-avatar.webp"
                  alt="Student testimonial"
                  width={500}
                  height={600}
                  className={styles.image}
                />
              </div>
            </div>
            <div className={styles.mobileAttribution}>
              <div className={styles.authorName}>Maya T.</div>
              <div className={styles.authorTitle}>Graduate Student, Temple University</div>
            </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.eyebrow}>Hear what our students have to say</div>
            <blockquote className={styles.quote}>
              I came in feeling completely lost after dropping out. The weekly sessions gave me structure, and for the first time I didn&apos;t feel judged for not having it all figured out. This community actually gets it.
            </blockquote>
            <div className={styles.footer}>
              <Image
                src="/companylogos/temple-university.png"
                alt="Temple University"
                width={140}
                height={50}
                className={styles.universityLogo}
              />
              <div className={styles.attribution}>
                <div className={styles.authorName}>Maya T.</div>
                <div className={styles.authorTitle}>Graduate Student, Temple University</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
