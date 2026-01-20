'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './GuyDialogue.module.css';

export type GuyEmotion = 'happy' | 'excited' | 'thinking';

interface GuyDialogueProps {
  message: string;
  emotion?: GuyEmotion;
  onComplete?: () => void;
  speed?: number;
  autoStart?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
}

const GuyDialogue: React.FC<GuyDialogueProps> = ({
  message,
  emotion = 'happy',
  onComplete,
  speed = 30,
  autoStart = true,
  showSkip = true,
  onSkip,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCompleteRef = useRef(false);
  const lastMessageRef = useRef<string>('');

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const messageChanged = lastMessageRef.current !== message;

    if (messageChanged) {
      lastMessageRef.current = message;
      isCompleteRef.current = false;
    }

    if (!autoStart) {
      if (messageChanged || !isCompleteRef.current) {
        setDisplayedText('');
        setIsTyping(false);
      }
      return;
    }

    if (messageChanged || !isCompleteRef.current) {
      setDisplayedText('');
      setIsTyping(true);
      isCompleteRef.current = false;

      let currentIndex = 0;
      let isCancelled = false;

      const typeNextChar = () => {
        if (isCancelled) return;

        if (currentIndex < message.length) {
          setDisplayedText(message.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutRef.current = setTimeout(typeNextChar, speed);
        } else {
          setIsTyping(false);
          isCompleteRef.current = true;
          if (onComplete) {
            onComplete();
          }
        }
      };

      timeoutRef.current = setTimeout(typeNextChar, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [message, autoStart, speed, onComplete]);

  const handleSkip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(message);
    setIsTyping(false);
    isCompleteRef.current = true;
    if (onComplete) {
      onComplete();
    }
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatarWrapper}>
          <Image
            src="https://i.imgur.com/9Wvq3Rm.png"
            alt="Guy"
            width={80}
            height={80}
            className={styles.avatar}
            unoptimized
          />
        </div>
        <div className={styles.nameTag}>
          <span className={styles.name}>Guy</span>
          <span className={styles.role}>MWA Guide</span>
        </div>
      </div>
      <div className={styles.dialogueBox}>
        <div className={styles.dialogueContent}>
          <p className={styles.message}>
            {displayedText}
            {isTyping && <span className={styles.cursor}>|</span>}
          </p>
        </div>
        {showSkip && isTyping && (
          <button className={styles.skipButton} onClick={handleSkip} type="button">
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default GuyDialogue;
