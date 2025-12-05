import React from 'react';
import LibraryCard from '@/components/library-card/LibraryCard';
import CreateAccountButton from '@/components/nav-buttons/CreateAccountButton';
import SignInButton from '@/components/nav-buttons/SignInButton';
import ExploreQuestsButton from '@/components/nav-buttons/ExploreQuestsButton';
import NewsletterCard from '@/components/newsletter-card/NewsletterCard';
import BookCard from '@/components/book-card/BookCard';
import styles from './SideNavigation.module.css';

const SideNavigation: React.FC = () => {
  return (
    <div className={styles.sideNavigation}>
      <LibraryCard />
      <CreateAccountButton />
      <SignInButton />
      <ExploreQuestsButton />
      <NewsletterCard />
      <BookCard />
    </div>
  );
};

export default SideNavigation;

