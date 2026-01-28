'use client';

import React, { useState, useEffect } from 'react';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import { LivestreamPageSkeleton } from '@/components/skeleton/Skeleton';
import styles from './page.module.css';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  avatarColor: string;
}

// Sample chat messages for the community vibe
const SAMPLE_CHAT: ChatMessage[] = [
  { id: '1', username: 'NeuroDiver', message: 'Great insights on the daemon analysis!', timestamp: new Date(), avatarColor: '#9B7ED9' },
  { id: '2', username: 'MindMapper', message: 'How does this relate to cyber-psychology?', timestamp: new Date(), avatarColor: '#5168FF' },
  { id: '3', username: 'WealthSeeker', message: 'The governance model is fascinating', timestamp: new Date(), avatarColor: '#62BE8F' },
  { id: '4', username: 'CodeMystic', message: 'Can we explore the treasury mechanics next?', timestamp: new Date(), avatarColor: '#9B7ED9' },
  { id: '5', username: 'SoulArchitect', message: 'Knowledge for all, together!', timestamp: new Date(), avatarColor: '#5168FF' },
];

export default function LivestreamPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatExpanded, setChatExpanded] = useState(true);

  // Simulate loading and stream check
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      // Check if stream is live (placeholder for real API)
      setIsLive(false);
      setViewerCount(Math.floor(Math.random() * 500) + 100);
      setChatMessages(SAMPLE_CHAT);
    }, 1200);

    return () => clearTimeout(loadTimer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      avatarColor: '#5168FF',
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className={styles.pageLayout}>
      <SideNavigation />
      <main className={styles.content}>
        {isLoading ? (
          <LivestreamPageSkeleton />
        ) : (
          <>
            {/* Hero Section */}
            <header className={styles.hero}>
              <span className={styles.eyebrow}>MWA Live Sessions</span>
              <h1 className={styles.title}>Livestream</h1>
              <p className={styles.subtitle}>
                Tune into live workshops, community discussions, and educational sessions. Knowledge flows freely when communities connect transparently.
              </p>
            </header>

            {/* Stream Container */}
            <div className={styles.streamContainer}>
              {/* Video Section */}
              <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                  {isLive ? (
                    <div className={styles.videoPlayer}>
                      {/* Video embed would go here */}
                      <div className={styles.videoPlaceholder}>
                        <div className={styles.liveIndicator}>
                          <span className={styles.liveDot} />
                          LIVE
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.offlineState}>
                      <div className={styles.offlineIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="currentColor"/>
                          <circle cx="8" cy="12" r="2" fill="currentColor" opacity="0.4"/>
                        </svg>
                      </div>
                      <h3 className={styles.offlineTitle}>Stream Offline</h3>
                      <p className={styles.offlineText}>
                        No live session currently. Check back soon for upcoming workshops and community discussions.
                      </p>
                      <div className={styles.nextStreamInfo}>
                        <span className={styles.nextStreamLabel}>Next Scheduled Stream</span>
                        <span className={styles.nextStreamTime}>Coming Soon</span>
                      </div>
                    </div>
                  )}

                  {/* Video Controls */}
                  <div className={styles.videoControls}>
                    <div className={styles.controlsLeft}>
                      {isLive && (
                        <div className={styles.liveIndicatorSmall}>
                          <span className={styles.liveDotSmall} />
                          LIVE
                        </div>
                      )}
                    </div>
                    <div className={styles.controlsRight}>
                      <button className={styles.controlButton} type="button" aria-label="Toggle fullscreen">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stream Info Card */}
                <div className={styles.streamInfo}>
                  <div className={styles.streamHeader}>
                    <div className={styles.streamTitleSection}>
                      <h2 className={styles.streamTitle}>
                        {isLive ? 'Live: Mental Wealth Workshop' : 'Mental Wealth Academy Sessions'}
                      </h2>
                      <p className={styles.streamHost}>Hosted by Mental Wealth Academy</p>
                    </div>
                    {isLive && (
                      <div className={styles.viewerCount}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                        </svg>
                        <span>{viewerCount.toLocaleString()} watching</span>
                      </div>
                    )}
                  </div>
                  <p className={styles.streamDescription}>
                    Join our community sessions exploring cyber-psychology, pragmatic governance, and the future of decentralized education.
                  </p>
                  <div className={styles.streamTags}>
                    <span className={styles.tag}>Education</span>
                    <span className={styles.tag}>Web3</span>
                    <span className={styles.tag}>Community</span>
                    <span className={styles.tag}>Governance</span>
                  </div>
                </div>
              </div>

              {/* Chat Section */}
              <div className={`${styles.chatSection} ${chatExpanded ? styles.chatExpanded : styles.chatCollapsed}`}>
                <div className={styles.chatHeader}>
                  <h3 className={styles.chatTitle}>Stream Chat</h3>
                  <button
                    className={styles.chatToggle}
                    onClick={() => setChatExpanded(!chatExpanded)}
                    type="button"
                    aria-label={chatExpanded ? 'Collapse chat' : 'Expand chat'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {chatExpanded ? (
                        <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                      ) : (
                        <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                      )}
                    </svg>
                  </button>
                </div>

                {chatExpanded && (
                  <>
                    <div className={styles.chatMessages}>
                      {chatMessages.map(msg => (
                        <div key={msg.id} className={styles.chatMessage}>
                          <div
                            className={styles.chatAvatar}
                            style={{ backgroundColor: msg.avatarColor }}
                          >
                            {msg.username[0].toUpperCase()}
                          </div>
                          <div className={styles.chatContent}>
                            <span className={styles.chatUsername}>{msg.username}</span>
                            <span className={styles.chatText}>{msg.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form className={styles.chatInputWrapper} onSubmit={handleSendMessage}>
                      <input
                        type="text"
                        className={styles.chatInput}
                        placeholder={isLive ? 'Send a message...' : 'Chat available when live'}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={!isLive}
                      />
                      <button
                        type="submit"
                        className={styles.chatSendButton}
                        disabled={!isLive || !newMessage.trim()}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <section className={styles.upcomingSection}>
              <h2 className={styles.sectionTitle}>Upcoming Sessions</h2>
              <div className={styles.upcomingGrid}>
                <div className={styles.upcomingCard}>
                  <div className={styles.upcomingTime}>
                    <span className={styles.upcomingDay}>TBD</span>
                    <span className={styles.upcomingHour}>Coming Soon</span>
                  </div>
                  <div className={styles.upcomingInfo}>
                    <h3 className={styles.upcomingTitle}>Daemon Analysis Workshop</h3>
                    <p className={styles.upcomingDescription}>
                      Explore the intersection of AI guidance systems and self-awareness.
                    </p>
                  </div>
                  <button className={styles.remindButton} type="button">
                    Set Reminder
                  </button>
                </div>

                <div className={styles.upcomingCard}>
                  <div className={styles.upcomingTime}>
                    <span className={styles.upcomingDay}>TBD</span>
                    <span className={styles.upcomingHour}>Coming Soon</span>
                  </div>
                  <div className={styles.upcomingInfo}>
                    <h3 className={styles.upcomingTitle}>Community Governance Q&A</h3>
                    <p className={styles.upcomingDescription}>
                      Open discussion on transparent governance and voting systems.
                    </p>
                  </div>
                  <button className={styles.remindButton} type="button">
                    Set Reminder
                  </button>
                </div>

                <div className={styles.upcomingCard}>
                  <div className={styles.upcomingTime}>
                    <span className={styles.upcomingDay}>TBD</span>
                    <span className={styles.upcomingHour}>Coming Soon</span>
                  </div>
                  <div className={styles.upcomingInfo}>
                    <h3 className={styles.upcomingTitle}>Cyber-Psychology Deep Dive</h3>
                    <p className={styles.upcomingDescription}>
                      Understanding the psychology of digital communities.
                    </p>
                  </div>
                  <button className={styles.remindButton} type="button">
                    Set Reminder
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
