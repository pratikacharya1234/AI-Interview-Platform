'use client'

/**
 * Voice Recorder Component
 *
 * Handles audio recording with real-time visualization
 * for voice-based interviews
 */

import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Pause, Play } from 'lucide-react'

export interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  maxDuration?: number // seconds
  disabled?: boolean
}

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 300, // 5 minutes default
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const startTimeRef = useRef<number>(0)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  // Monitor audio levels
  useEffect(() => {
    if (!isRecording || isPaused || !analyserRef.current) return

    const updateAudioLevel = () => {
      if (!analyserRef.current) return

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)

      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255) // Normalize to 0-1

      if (isRecording && !isPaused) {
        requestAnimationFrame(updateAudioLevel)
      }
    }

    updateAudioLevel()
  }, [isRecording, isPaused])

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        onRecordingComplete(audioBlob, finalDuration)

        // Clean up
        stream.getTracks().forEach((track) => track.stop())
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }

      // Start recording
      mediaRecorderRef.current.start(100) // Collect data every 100ms
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const next = prev + 1
          if (next >= maxDuration) {
            stopRecording()
          }
          return next
        })
      }, 1000)

      onRecordingStart?.()
    } catch (err: any) {
      console.error('Error starting recording:', err)

      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.')
      } else {
        setError('Failed to start recording. Please try again.')
      }
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      onRecordingStop?.()
    }
  }

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="voice-recorder">
      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Recording controls */}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Mic className="h-5 w-5" />
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="h-5 w-5" />
              Stop
            </button>

            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              )}
            </button>
          </>
        )}

        {/* Duration display */}
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-lg font-mono font-medium">
              {formatDuration(duration)}
            </span>
            <span className="text-sm text-gray-500">
              / {formatDuration(maxDuration)}
            </span>
          </div>
        )}
      </div>

      {/* Audio level visualization */}
      {isRecording && !isPaused && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-100"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            Speak clearly into your microphone
          </p>
        </div>
      )}

      {/* Waveform visualization (enhanced) */}
      {isRecording && !isPaused && (
        <div className="mt-4 flex items-center justify-center gap-1 h-16">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = Math.sin((i + duration * 10) / 5) * audioLevel * 40 + 20
            return (
              <div
                key={i}
                className="w-1 bg-blue-500 rounded-full transition-all duration-100"
                style={{ height: `${height}px` }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
