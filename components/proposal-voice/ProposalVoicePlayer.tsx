'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ProposalVoicePlayer.module.css';

interface ProposalVoicePlayerProps {
  proposalId: string;
  proposalTitle: string;
  proposalContent: string;
  className?: string;
}

const ProposalVoicePlayer: React.FC<ProposalVoicePlayerProps> = ({
  proposalId,
  proposalTitle,
  proposalContent,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerateAndPlay = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Generate voice response from Azura
      const response = await fetch('/api/voting/proposal/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          proposalTitle,
          proposalContent: proposalContent.substring(0, 1000), // Limit content for TTS
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate voice');
      }

      const data = await response.json();
      
      // Create audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // If we got a blob URL, use it directly
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setError('Failed to play audio');
          setIsPlaying(false);
        };

        await audio.play();
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (err) {
      console.error('Error generating voice:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate voice');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) {
      handleGenerateAndPlay();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className={`${styles.voicePlayer} ${className || ''}`}>
      <div className={styles.playerContainer}>
        {/* Skeuomorphic design with depth and shadows */}
        <div className={styles.playerSurface}>
          <div className={styles.playerControls}>
            <button
              className={styles.playButton}
              onClick={handlePlayPause}
              disabled={isLoading}
              aria-label={isPlaying ? 'Pause' : 'Play Azura\'s voice'}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className={styles.playerInfo}>
              <div className={styles.playerLabel}>
                <span className={styles.labelIcon}>🎙️</span>
                <span className={styles.labelText}>Azura's Voice</span>
              </div>
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
            </div>
          </div>

          {/* Waveform visualization (decorative) */}
          <div className={styles.waveform}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`${styles.waveBar} ${isPlaying ? styles.playing : ''}`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalVoicePlayer;
