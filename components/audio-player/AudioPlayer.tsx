'use client'

import { useEffect, useRef, useState } from 'react'

const TRACKS = [
  { name: 'Plastic Love', url: '/Plastic Love.mp3' },
  { name: 'Heavenly Drift', url: '/Heavenly Drift.mp3' },
  { name: 'Crumbling World', url: '/Crumbling World.wav' },
  { name: 'Digital World', url: '/Digital World.wav' },
  { name: 'Mental Wealth Academy', url: '/Mental Wealth Academy 精神財富学院.wav' },
]

const STORAGE_KEY_TRACK_INDEX = 'audioPlayer_trackIndex'
const STORAGE_KEY_IS_PLAYING = 'audioPlayer_isPlaying'
const STORAGE_KEY_CURRENT_TIME = 'audioPlayer_currentTime'
const STORAGE_KEY_SAVED_TRACK_INDEX = 'audioPlayer_savedTrackIndex' // Track which track the saved time belongs to

export default function AudioPlayer() {
  // Load persisted state from localStorage on mount
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_TRACK_INDEX)
      return saved !== null ? parseInt(saved, 10) : 0
    }
    return 0
  })
  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_IS_PLAYING)
      return saved === 'true'
    }
    return false
  })
  const audioRef = useRef<HTMLAudioElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMountRef = useRef(true)
  const hasRestoredTimeRef = useRef(false)

  const currentTrack = TRACKS[currentTrackIndex]

  // Set up event listeners once
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Handle track end - move to next track
    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length)
    }

    // Handle play/pause state
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Save state before unmounting
    return () => {
      if (audio) {
        // Save current playback time before component unmounts
        if (typeof window !== 'undefined' && audio.currentTime > 0 && !audio.paused) {
          localStorage.setItem(STORAGE_KEY_CURRENT_TIME, audio.currentTime.toString())
          localStorage.setItem(STORAGE_KEY_SAVED_TRACK_INDEX, currentTrackIndex.toString())
        }
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TRACK_INDEX, currentTrackIndex.toString())
    }
  }, [currentTrackIndex])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_IS_PLAYING, isPlaying.toString())
    }
  }, [isPlaying])

  // Save current time periodically to localStorage
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const saveTime = () => {
      if (typeof window !== 'undefined' && audio.currentTime > 0 && !audio.paused) {
        localStorage.setItem(STORAGE_KEY_CURRENT_TIME, audio.currentTime.toString())
        localStorage.setItem(STORAGE_KEY_SAVED_TRACK_INDEX, currentTrackIndex.toString())
      }
    }

    const interval = setInterval(saveTime, 1000) // Save every second
    
    return () => clearInterval(interval)
  }, [currentTrackIndex])

  // Initialize audio source and restore state on mount
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Use the persisted track index
    const trackToLoad = TRACKS[currentTrackIndex]
    audio.src = trackToLoad.url
    
    // Restore playback position when metadata is loaded (only if same track)
    const handleCanPlay = () => {
      if (isInitialMountRef.current && typeof window !== 'undefined' && !hasRestoredTimeRef.current) {
        const savedTime = localStorage.getItem(STORAGE_KEY_CURRENT_TIME)
        const savedTrackIndex = localStorage.getItem(STORAGE_KEY_SAVED_TRACK_INDEX)
        
        // Only restore if we have saved time AND it's for the same track
        if (savedTime && savedTrackIndex && parseInt(savedTrackIndex, 10) === currentTrackIndex) {
          const time = parseFloat(savedTime)
          // Only restore if the time is valid and less than duration
          if (!isNaN(time) && time > 0 && time < audio.duration) {
            audio.currentTime = time
          }
        }
        hasRestoredTimeRef.current = true
      }
    }
    
    audio.addEventListener('canplay', handleCanPlay)
    audio.load()
    
    // Restore playing state on initial mount
    if (isInitialMountRef.current) {
      // Wait for metadata to be ready before playing
      const handleLoadedMetadata = () => {
        if (isPlaying) {
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                isInitialMountRef.current = false
              })
              .catch((error) => {
                // Autoplay was prevented - this is normal in many browsers
                console.log('Autoplay prevented:', error)
                setIsPlaying(false)
                isInitialMountRef.current = false
              })
          }
        } else {
          isInitialMountRef.current = false
        }
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    }
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, []) // Only run once on mount

  // Update audio source when track changes (but not on initial mount)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isInitialMountRef.current) return // Skip if initial mount hasn't completed

    const wasPlaying = isPlaying
    audio.src = currentTrack.url
    
    // Clear saved time when track changes (user manually changed track)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CURRENT_TIME)
      localStorage.removeItem(STORAGE_KEY_SAVED_TRACK_INDEX)
    }
    hasRestoredTimeRef.current = false
    
    // Load the new track
    audio.load()
    
    // Wait for metadata before playing
    const handleCanPlay = () => {
      // Continue playing if it was playing before
      if (wasPlaying) {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Play error:', error)
            setIsPlaying(false)
          })
        }
      }
      audio.removeEventListener('canplay', handleCanPlay)
    }
    
    audio.addEventListener('canplay', handleCanPlay)
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, currentTrack.url])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length)
  }

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length)
  }

  return (
    <div 
      ref={playerContainerRef}
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #F4F5FE 0%, #EAEBF4 100%)',
        borderTop: '1px solid #EAEBF4',
        borderBottom: '1px solid #EAEBF4',
        boxShadow: '0 4px 20px rgba(120, 138, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          gap: '12px',
        }}
      >
        {/* Previous Button */}
        <button
          onClick={prevTrack}
          style={{
            color: '#788AFF',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F4F5FE 0%, #EAEBF4 100%)',
            border: '1.5px solid #788AFF',
            width: '36px',
            height: '36px',
            minWidth: '36px',
            minHeight: '36px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(120, 138, 255, 0.2)',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 138, 255, 0.4)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #EAEBF4 0%, #F4F5FE 100%)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(120, 138, 255, 0.2)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #F4F5FE 0%, #EAEBF4 100%)'
          }}
          aria-label="Previous track"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L6 18M17 6L10 12L17 18L17 6Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          style={{
            color: '#F4F5FE',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #788AFF 0%, #6a7aee 100%)',
            border: '2px solid #788AFF',
            width: '48px',
            height: '48px',
            minWidth: '48px',
            minHeight: '48px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(120, 138, 255, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(120, 138, 255, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(120, 138, 255, 0.4)'
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5L8 19L19 12L8 5Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={nextTrack}
          style={{
            color: '#788AFF',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F4F5FE 0%, #EAEBF4 100%)',
            border: '1.5px solid #788AFF',
            width: '36px',
            height: '36px',
            minWidth: '36px',
            minHeight: '36px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(120, 138, 255, 0.2)',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 138, 255, 0.4)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #EAEBF4 0%, #F4F5FE 100%)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(120, 138, 255, 0.2)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #F4F5FE 0%, #EAEBF4 100%)'
          }}
          aria-label="Next track"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L18 18M7 6L14 12L7 18L7 6Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Track Name */}
        <div 
          style={{
            color: '#788AFF',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #EAEBF4 0%, #F4F5FE 100%)',
            border: '1px solid #788AFF',
            boxShadow: 'inset 0 1px 3px rgba(120, 138, 255, 0.1)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.3px',
            padding: '6px 16px',
            minWidth: '140px',
            textAlign: 'center',
            flexShrink: 0
          }}
        >
          {currentTrack.name}
        </div>

        {/* Audio Element (hidden) */}
        <audio ref={audioRef} preload="auto" loop={false} autoPlay />
      </div>
    </div>
  )
}
