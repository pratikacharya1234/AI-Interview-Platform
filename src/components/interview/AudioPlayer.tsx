'use client'

/**
 * Audio Player Component
 *
 * Plays AI interviewer responses with controls
 */

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { formatDuration } from '@/lib/utils/audioUtils'

export interface AudioPlayerProps {
  audioUrl: string
  autoPlay?: boolean
  onPlaybackComplete?: () => void
  onPlaybackStart?: () => void
  className?: string
}

export function AudioPlayer({
  audioUrl,
  autoPlay = false,
  onPlaybackComplete,
  onPlaybackStart,
  className = '',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Initialize audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)

      if (autoPlay) {
        audio.play().catch(err => {
          console.error('Auto-play failed:', err)
          setError('Auto-play was blocked. Please click play.')
        })
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onPlaybackComplete?.()
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlaybackStart?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleError = () => {
      setError('Failed to load audio. Please try again.')
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [audioUrl, autoPlay, onPlaybackComplete, onPlaybackStart])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => {
        console.error('Play failed:', err)
        setError('Failed to play audio')
      })
    }
  }

  const replay = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.play().catch(err => {
      console.error('Replay failed:', err)
    })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    audio.currentTime = percentage * duration
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`audio-player bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Error display */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          disabled={isLoading || !!error}
          className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        {/* Replay button */}
        <button
          onClick={replay}
          disabled={isLoading || !!error}
          className="flex-shrink-0 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
          aria-label="Replay"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Time display */}
        <div className="flex-shrink-0 text-sm font-mono text-gray-600 dark:text-gray-400">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </div>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative overflow-hidden"
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Playback speed */}
        <select
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          aria-label="Playback speed"
        >
          <option value="0.75">0.75x</option>
          <option value="1">1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Waveform visualization (optional - simplified) */}
      {isPlaying && (
        <div className="mt-3 flex items-center justify-center gap-1 h-8">
          {Array.from({ length: 30 }).map((_, i) => {
            const height = Math.sin((i + currentTime * 10) / 3) * 50 + 50
            return (
              <div
                key={i}
                className="w-1 bg-blue-500/50 rounded-full transition-all duration-100"
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
