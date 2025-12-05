import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          Get involved and shape Mental Wealth Academy&apos;s future.
        </h2>

        <p className={styles.description}>
          The DAO is a key component of the ecosystem and it is the consensus
          mechanism for defining the resolutions of AA&apos;s Organization.
          Participate in the DAO and make your voice heard.
        </p>

        <div className={styles.actions}>
          <button className={styles.primaryButton}>
            JOIN OUR FORUM
          </button>

          <button className={styles.secondaryButton}>
            READ OUR DOCS
          </button>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <Image
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/9098986382eab1247c92729d5c657c81e9b81fb1?placeholderIfAbsent=true"
          alt="Apple Set"
          width={434}
          height={326}
          className={styles.image}
        />
      </div>
    </div>
  );
}

