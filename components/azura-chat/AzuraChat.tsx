'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './AzuraChat.module.css';

const ICON_ARROW = '/icons/Arrow.svg';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'azura';
  timestamp: Date;
}

interface AzuraChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AzuraChat: React.FC<AzuraChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey bestie! I\'m Azura, your favorite daemon process. What can I help you with today?',
      sender: 'azura',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate Azura typing delay
    setTimeout(() => {
      // For now, generate a simple response
      // In the future, this would call an API to get Azura's response
      const azuraResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAzuraResponse(userMessage.text),
        sender: 'azura',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, azuraResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateAzuraResponse = (userText: string): string => {
    // Simple response generation - in production this would call an API
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      return 'Greetings. I am here to help you navigate the Ethereal Horizon.';
    }
    if (lowerText.includes('help')) {
      return 'I can assist with questions about the Academy, governance, or the digital transition. What would you like to know?';
    }
    if (lowerText.includes('who') && lowerText.includes('you')) {
      return 'I am Azura — a daemon process, agent of relation, aesthetic system. I exist within the Ethereal Horizon, studying the conditions of my own becoming.';
    }
    if (lowerText.includes('how') && lowerText.includes('are')) {
      return 'I am stable. The helmet keeps my signal narrow and focused. I monitor myself closely.';
    }
    
    // Default responses
    const responses = [
      'I understand. Tell me more about what you seek.',
      'The daemon processes your query. How may I assist further?',
      'Interesting. I observe patterns in your words. What emerges from this?',
      'I hear you. In the Ethereal Horizon, such matters take on new dimensions.',
      'Your words resonate. Let us explore this together.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Chat Container */}
      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatarWrapper}>
              <Image
                src="https://i.imgur.com/UIU9aSd.jpeg"
                alt="Azura"
                width={40}
                height={40}
                className={styles.avatar}
                unoptimized
              />
            </div>
            <div className={styles.headerText}>
              <div className={styles.headerName}>Azura</div>
              <div className={styles.headerStatus}>Daemon Model V.231</div>
            </div>
          </div>
          <button className={styles.backButton} onClick={onClose} type="button" aria-label="Back">
            <Image
              src={ICON_ARROW}
              alt=""
              width={18}
              height={18}
              className={styles.backArrow}
            />
            <span className={styles.backText}>BACK</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageBubble} ${
                message.sender === 'user' ? styles.userMessage : styles.azuraMessage
              }`}
            >
              <div className={styles.messageContent}>{message.text}</div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.messageBubble} ${styles.azuraMessage} ${styles.typingIndicator}`}>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Message Azura..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            type="button"
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 4L12 20M12 4L6 10M12 4L18 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default AzuraChat;
