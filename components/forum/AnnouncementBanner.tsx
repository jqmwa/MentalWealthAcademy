import React from 'react';
import styles from './AnnouncementBanner.module.css';

export function AnnouncementBanner() {
  return (
    <div className={styles.banner}>
      <h3 className={styles.title}>Announcement</h3>
      <p className={styles.text}>
        Welcome to the Mental Wealth Academy Message Board! If this is your first time
        visiting the forums, make sure to read the forum rules before posting.
        Also check out the FAQ. Note that you have to register an account before
        you are able to post.
      </p>
    </div>
  );
}

