import React from 'react';
import styles from './BookCard.module.css';

interface BookCardProps {
  title?: string;
  author?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
}

const BookCard: React.FC<BookCardProps> = ({
  title = "Web3 Education",
  author = "By: Jhinn Bay",
  description = "Explore the transformative power of blockchain technology and its revolutionary capabilities in reshaping the digital landscape. This comprehensive guide examines how decentralized systems enable trustless transactions, immutable record-keeping, and programmable value transfer, fundamentally altering how we interact with data, assets, and digital identity in the modern world.",
  category = "Non-Fiction",
  imageUrl = "https://i.imgur.com/ApMF7cV.jpeg"
}) => {
  return (
    <div className={styles.bookCard}>
      <div 
        className={styles.bookImage}
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.author}>{author}</p>
        <p className={styles.description}>{description}</p>
      </div>
      
      <div className={styles.category}>
        <div className={styles.categoryDot}></div>
        <span className={styles.categoryText}>{category}</span>
      </div>
    </div>
  );
};

export default BookCard;

