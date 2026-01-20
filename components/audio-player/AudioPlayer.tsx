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
  const [isPlaying, setIsPlaying] = useState(false) // Always start paused (no auto-play)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    // Mark initial mount as complete (no auto-play)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
    }
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        background: '#FBF8FF',
        borderBottom: '2px solid #000000',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          gap: '8px',
        }}
      >
        {/* Previous Button */}
        <button
          onClick={prevTrack}
          style={{
            color: '#1A1D33',
            borderRadius: '4px',
            background: '#ffffff',
            border: '2px solid #1A1D33',
            width: '20px',
            height: '20px',
            minWidth: '20px',
            minHeight: '20px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0 #1A1D33',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)'
            e.currentTarget.style.boxShadow = '3px 3px 0 #1A1D33'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)'
            e.currentTarget.style.boxShadow = '2px 2px 0 #1A1D33'
          }}
          aria-label="Previous track"
        >
          <svg
            width="8"
            height="8"
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
            color: '#ffffff',
            borderRadius: '4px',
            background: '#5168FF',
            border: '2px solid #1A1D33',
            width: '26px',
            height: '26px',
            minWidth: '26px',
            minHeight: '26px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0 #1A1D33',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)'
            e.currentTarget.style.boxShadow = '3px 3px 0 #1A1D33'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)'
            e.currentTarget.style.boxShadow = '2px 2px 0 #1A1D33'
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg
              width="10"
              height="10"
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
            color: '#1A1D33',
            borderRadius: '4px',
            background: '#ffffff',
            border: '2px solid #1A1D33',
            width: '20px',
            height: '20px',
            minWidth: '20px',
            minHeight: '20px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0 #1A1D33',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-1px, -1px)'
            e.currentTarget.style.boxShadow = '3px 3px 0 #1A1D33'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)'
            e.currentTarget.style.boxShadow = '2px 2px 0 #1A1D33'
          }}
          aria-label="Next track"
        >
          <svg
            width="8"
            height="8"
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
            color: '#FF7729',
            borderRadius: '4px',
            background: 'rgba(255, 119, 41, 0.1)',
            border: '2px solid #1A1D33',
            boxShadow: '2px 2px 0 #1A1D33',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.02em',
            padding: '4px 10px',
            minWidth: '80px',
            textAlign: 'center',
            flexShrink: 0,
            textTransform: 'uppercase'
          }}
        >
          {currentTrack.name}
        </div>

        {/* Audio Element (hidden) */}
        <audio ref={audioRef} preload="auto" loop={false} />
      </div>
    </div>
  )
}
