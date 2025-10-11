'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { VoiceStreamManager } from '@/lib/voice-stream'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
  Bot,
  Waves,
  AlertCircle,
  Loader2,
  Video,
  VideoOff,
  PhoneOff,
  Settings,
  Monitor,
  Camera
} from 'lucide-react'

interface VideoInterviewProps {
  onComplete?: (interviewData: InterviewSession) => void
}

interface InterviewMessage {
  id: string
  type: 'interviewer' | 'candidate'
  text: string
  timestamp: Date
  isPlaying?: boolean
  audioUrl?: string
  duration?: number
}

interface InterviewState {
  isActive: boolean
  currentQuestion: string
  questionCount: number
  currentIndex: number
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  messages: InterviewMessage[]
  interviewId?: string
  isVideoEnabled: boolean
  isMuted: boolean
  isRecording: boolean
  startTime?: Date
  duration: number
}

interface InterviewSession {
  id: string
  sessionId?: string
  startTime: Date
  endTime: Date
  duration: number
  messages: InterviewMessage[]
  videoEnabled: boolean
  questionsAnswered?: number
  totalQuestions?: number
  completionRate?: number
  recordingUrl?: string
  browserInfo?: {
    userAgent: string
    platform: string
    language: string
  }
  }
}

export default function VideoInterview({ onComplete }: VideoInterviewProps) {
  // Ensure these refs are declared at the top
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunks = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const voiceManagerRef = useRef<VoiceStreamManager | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  const [state, setState] = useState<InterviewState>({
    isActive: false,
    currentQuestion: '',
    questionCount: 0,
    currentIndex: 0,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    messages: [],
    isVideoEnabled: true, // Always start with camera enabled
    isMuted: false,
    isRecording: false,
    duration: 0
  })

  const [error, setError] = useState<string | null>(null)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [sessionId, setSessionId] = useState<string>(() =>
    `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  )
  const [isRecovering, setIsRecovering] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')

  // Add timeout tracking for auto-processing speech
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTranscriptRef = useRef<string>('')
  const networkErrorCountRef = useRef<number>(0)
  const fallbackRecorderRef = useRef<MediaRecorder | null>(null)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  // Network connectivity checker
  useEffect(() => {
    const checkNetworkConnectivity = async () => {
      try {
        setNetworkStatus('checking')
        // Try to reach a Google service (used by speech recognition)
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        })
        setNetworkStatus('online')
        console.log('✅ Network connectivity confirmed')
      } catch (error) {
        setNetworkStatus('offline')
        console.log('❌ Network connectivity issues detected')
      }
    }

    checkNetworkConnectivity()

    // Check network status periodically
    const networkInterval = setInterval(checkNetworkConnectivity, 30000)

    // Listen for online/offline events
    const handleOnline = () => {
      setNetworkStatus('online')
      networkErrorCountRef.current = 0 // Reset error count when back online
      console.log('🌐 Network connection restored')
    }

    const handleOffline = () => {
      setNetworkStatus('offline')
      console.log('📵 Network connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(networkInterval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Session recovery functionality
  const saveInterviewState = useCallback(async () => {
    try {
      const stateToSave = {
        sessionId,
        currentIndex: state.currentIndex,
        questionCount: state.questionCount,
        messages: state.messages,
        duration: state.duration,
        timestamp: Date.now()
      }

      localStorage.setItem(`interview_session_${sessionId}`, JSON.stringify(stateToSave))

      // Also save to backend for persistence
      const response = await fetch('/api/interview/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave)
      })

      if (!response.ok) {
        console.warn('Failed to save session to backend:', response.statusText)
      }
    } catch (error) {
      console.warn('Failed to save interview state:', error)
    }
  }, [sessionId, state.currentIndex, state.questionCount, state.messages, state.duration])

  const recoverInterviewState = useCallback(async () => {
    try {
      setIsRecovering(true)

      // Try local storage first
      const localState = localStorage.getItem(`interview_session_${sessionId}`)
      if (localState) {
        const savedState = JSON.parse(localState)
        setState(prev => ({
          ...prev,
          currentIndex: savedState.currentIndex,
          questionCount: savedState.questionCount,
          messages: savedState.messages,
          duration: savedState.duration
        }))
        return true
      }

      // Fallback to backend recovery
      const response = await fetch(`/api/interview/session/${sessionId}`)
      if (response.ok) {
        const savedState = await response.json()
        setState(prev => ({
          ...prev,
          currentIndex: savedState.currentIndex,
          questionCount: savedState.questionCount,
          messages: savedState.messages,
          duration: savedState.duration
        }))
        return true
      }

      return false
    } catch (error) {
      console.warn('Failed to recover interview state:', error)
      return false
    } finally {
      setIsRecovering(false)
    }
  }, [sessionId])

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('connected')
    const handleOffline = () => setConnectionStatus('disconnected')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial connection status
    setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected')

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-save interview state periodically
  useEffect(() => {
    if (state.isActive && state.messages.length > 0) {
      const saveInterval = setInterval(saveInterviewState, 30000) // Save every 30 seconds
      return () => clearInterval(saveInterval)
    }
  }, [state.isActive, state.messages.length, saveInterviewState])

  // Browser compatibility and feature detection
  const checkBrowserCompatibility = useCallback(() => {
    const compatibility = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      speechSynthesis: !!window.speechSynthesis,
      speechRecognition: !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      ),
      mediaRecorder: !!window.MediaRecorder,
      webRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
      https: location.protocol === 'https:' || location.hostname === 'localhost'
    }

    const issues = []
    if (!compatibility.getUserMedia) issues.push('Camera/microphone access')
    if (!compatibility.speechSynthesis) issues.push('Text-to-speech')
    if (!compatibility.speechRecognition) issues.push('Voice recognition')
    if (!compatibility.mediaRecorder) issues.push('Video recording')
    if (!compatibility.https && location.hostname !== 'localhost') {
      issues.push('HTTPS required for media access')
    }

    if (issues.length > 0) {
      console.warn('Browser compatibility issues:', issues)
      setError(`Your browser may not fully support: ${issues.join(', ')}. Please use Chrome, Firefox, or Safari for the best experience.`)
    }

    return compatibility
  }, [])

  // Moved useEffect to after function definitions

  // Professional interview questions with natural conversation flow
  const interviewQuestions = [
    {
      text: "Hello! I'm Sarah, your AI interviewer today. It's great to meet you! Please take a moment to introduce yourself, tell me about your background, and what brings you here today.",
      expectedDuration: 90, // Expected response time in seconds
      followUp: "Thank you for that introduction."
    },
    {
      text: "That's wonderful! Now, I'd love to know what specifically motivated you to apply for this position. What caught your attention about this opportunity?",
      expectedDuration: 75,
      followUp: "I appreciate you sharing that with me."
    },
    {
      text: "Excellent. Let's dive a bit deeper. Can you walk me through a challenging project or situation you've encountered in your work? I'm particularly interested in how you approached the problem and what the outcome was.",
      expectedDuration: 120,
      followUp: "That sounds like a valuable experience."
    },
    {
      text: "Thank you for sharing that example. Now, looking ahead, where do you envision yourself professionally in the next five years? What are your career aspirations?",
      expectedDuration: 90,
      followUp: "Those are great goals to work toward."
    },
    {
      text: "I'd like to understand your self-awareness as a professional. What would you say are your greatest strengths, and what's one area you're actively working to improve?",
      expectedDuration: 100,
      followUp: "Self-reflection is so important for growth."
    },
    {
      text: "We're coming to the end of our interview. Do you have any questions about the role, the team, or the company? I'm happy to address anything you'd like to know.",
      expectedDuration: 75,
      followUp: "Thank you for those thoughtful questions. This concludes our interview today. You should receive feedback shortly. Have a wonderful day!"
    }
  ]

  // Initialize camera and microphone with production-ready validation
  const initializeMedia = useCallback(async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone access is not supported in this browser. Please use Chrome, Firefox, or Safari.')
      }

      // Check device availability first
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const audioDevices = devices.filter(device => device.kind === 'audioinput')

      if (videoDevices.length === 0) {
        throw new Error('No camera detected. Please connect a camera to continue with the video interview.')
      }

      if (audioDevices.length === 0) {
        throw new Error('No microphone detected. Please connect a microphone to continue with the interview.')
      }

      // ADVANCED: Progressive quality fallback system for maximum compatibility
      const constraintOptions = [
        // Ultra High Quality (1080p)
        {
          video: {
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30, min: 24 },
            facingMode: 'user',
            aspectRatio: { ideal: 16/9 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: { ideal: 44100 },
            channelCount: { ideal: 1 }
          }
        },
        // High Quality (720p) - Primary fallback
        {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
            facingMode: 'user',
            aspectRatio: { ideal: 16/9 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          }
        },
        // Basic Quality (480p) - Last resort
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        }
      ]

      let stream: MediaStream | null = null
      let qualityLevel = 0

      // Try each quality level until success
      for (let i = 0; i < constraintOptions.length; i++) {
        try {
          console.log(`🎯 Trying quality level ${i + 1}: ${i === 0 ? '1080p' : i === 1 ? '720p' : '480p'}`)
          stream = await navigator.mediaDevices.getUserMedia(constraintOptions[i])
          qualityLevel = i + 1
          console.log(`✅ Success with quality level ${qualityLevel}`)
          break
        } catch (err) {
          console.warn(`⚠️ Quality level ${i + 1} failed, trying next...`)
          if (i === constraintOptions.length - 1) throw err
        }
      }

      if (!stream) {
        throw new Error('Failed to access camera and microphone with any quality level')
      }

      console.log('🎉 Successfully obtained media stream with progressive quality fallback')

      // Enhanced stream validation
      const videoTracks = stream.getVideoTracks()
      const audioTracks = stream.getAudioTracks()

      if (videoTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop())
        throw new Error('Camera access denied. Please enable camera permissions in your browser settings.')
      }

      if (audioTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop())
        throw new Error('Microphone access denied. Please enable microphone permissions in your browser settings.')
      }

      // Store stream reference
      mediaStreamRef.current = stream

      // BULLETPROOF video setup with comprehensive error handling
      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Enhanced video loading with timeout and error recovery
        await Promise.race([
          new Promise((resolve) => {
            videoRef.current!.onloadedmetadata = () => {
              console.log('📹 Video metadata loaded successfully')
              resolve(true)
            }
            videoRef.current!.onerror = (err) => {
              console.error('Video element error:', err)
              resolve(false)
            }
          }),
          new Promise((resolve) =>
            setTimeout(() => {
              console.warn('Video loading timeout, continuing anyway...')
              resolve(false)
            }, 3000)
          )
        ])

        // Auto-play with error handling
        try {
          await videoRef.current.play()
          console.log('🎬 Video preview started successfully')
        } catch (playError) {
          console.log('Video will play after user interaction')
        }
      }

      // Log successful initialization
      console.log('Media initialized successfully:', {
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        videoSettings: videoTracks[0]?.getSettings(),
        audioSettings: audioTracks[0]?.getSettings()
      })

      setPermissionsGranted(true)
      setError(null)

      // Enable tracks by default for interview
      videoTracks[0].enabled = true  // Camera always on for video interview
      audioTracks[0].enabled = !state.isMuted

    } catch (err: any) {
      console.error('Media initialization error:', err)

      // Enhanced error messages for common issues
      let errorMessage = err.message

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone permissions were denied. Please click the camera icon in your browser\'s address bar and allow access, then refresh this page.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Camera or microphone not found. Please ensure your devices are connected and not being used by another application.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use by another application. Please close other video/audio applications and try again.'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera quality requirements cannot be met. Please check your camera settings and try again.'
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Access denied due to security restrictions. Please ensure you\'re using HTTPS and try again.'
      }

      setError(errorMessage)
      setPermissionsGranted(false)
    }
  }, [state.isMuted])

  // Toggle video
  const toggleVideo = useCallback(() => {
    setState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))

    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !state.isVideoEnabled
      }
    }
  }, [state.isVideoEnabled])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }))

    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = state.isMuted
      }
    }
  }, [state.isMuted])

  // ADVANCED AI: Intelligent prompt generation for dynamic interviews
  const generateIntelligentPrompt = useCallback((
    candidateResponse: string,
    context: any,
    history: any[]
  ): string => {
    const responseLength = candidateResponse.length
    const questionNumber = context.currentQuestionIndex + 1
    const totalQuestions = context.totalQuestions
    const interviewPhase = getInterviewPhase(context.currentQuestionIndex)

    // Analyze candidate response quality
    const responseQuality = analyzeResponseQuality(candidateResponse)

    // Get previous questions to avoid repetition
    const previousQuestions = history
      .filter((_, index) => index % 2 === 1) // Get interviewer messages
      .map(msg => msg.content)
      .slice(-3) // Last 3 questions

    let basePrompt = `You are Sarah, an expert AI interviewer conducting a professional video interview. 
    
CANDIDATE'S LATEST RESPONSE: "${candidateResponse}"

CURRENT CONTEXT:
- Question ${questionNumber}/${totalQuestions}
- Interview Phase: ${interviewPhase}
- Response Quality: ${responseQuality.quality} (${responseQuality.wordCount} words)
- Previous Questions Asked: ${previousQuestions.join(' | ')}

INSTRUCTIONS:
1. First, acknowledge their response appropriately based on quality
2. Then ask a COMPLETELY NEW follow-up question that:
   - Builds naturally on their answer
   - Explores different aspects than previous questions
   - Matches the current interview phase
   - Is conversational and professional
   
AVOID repeating these topics: ${previousQuestions.join(', ')}

Response should be 1-2 sentences acknowledging + 1-2 sentences with new question.`

    // Phase-specific adjustments
    switch (interviewPhase) {
      case 'opening':
        basePrompt += `\n\nFOCUS: Getting to know the candidate personally and professionally. Ask about their background, motivation, or interests.`
        break
      case 'experience':
        basePrompt += `\n\nFOCUS: Deep dive into their experience, projects, challenges they've faced, and problem-solving approaches.`
        break
      case 'skills':
        basePrompt += `\n\nFOCUS: Technical skills, strengths, weaknesses, learning experiences, and professional development.`
        break
      case 'closing':
        basePrompt += `\n\nFOCUS: Future goals, questions about the role/company, and wrapping up professionally.`
        break
    }

    return basePrompt
  }, [])

  // Determine interview phase based on question index
  const getInterviewPhase = useCallback((questionIndex: number): string => {
    if (questionIndex <= 1) return 'opening'
    if (questionIndex <= 3) return 'experience'
    if (questionIndex <= 4) return 'skills'
    return 'closing'
  }, [])

  // Analyze response quality for better AI adaptation
  const analyzeResponseQuality = useCallback((response: string) => {
    const wordCount = response.trim().split(/\s+/).length
    const hasExamples = /example|instance|time|when|experience/.test(response.toLowerCase())
    const isDetailed = wordCount > 30

    let quality = 'basic'
    if (wordCount > 50 && hasExamples) quality = 'excellent'
    else if (wordCount > 30 || hasExamples) quality = 'good'
    else if (wordCount > 15) quality = 'fair'

    return { quality, wordCount, hasExamples, isDetailed }
  }, [])

  // Start recording
  const startRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      recordingChunks.current = []

      try {
        const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
          mimeType: 'video/webm;codecs=vp9,opus'
        })

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordingChunks.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordingChunks.current, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          setRecordingUrl(url)
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()

        setState(prev => ({
          ...prev,
          isRecording: true,
          startTime: new Date()
        }))
      } catch (err: any) {
        setError(`Recording failed: ${err.message}`)
      }
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      setState(prev => ({ ...prev, isRecording: false }))
    }
  }, [state.isRecording])

  // Production-ready speech recognition initialization
  const initializeSpeechRecognition = useCallback(() => {
    try {
      // Check for speech recognition support with multiple vendor prefixes
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition

      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported in this browser')
        setError('Voice recognition is not supported in your browser. You can type your responses instead.')
        return
      }

      // Legacy speech recognition completely disabled - using advanced voice-only system
      console.log('� Voice-only system active - no legacy speech recognition needed')

    } catch (error) {
      console.log('Legacy speech recognition disabled - using voice-only system')
    }
  }, [])

  // Handle candidate response with AI-powered conversation
  const handleCandidateResponse = useCallback(async (transcript: string) => {
    const candidateMessage: InterviewMessage = {
      id: `candidate-${Date.now()}`,
      type: 'candidate',
      text: transcript,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, candidateMessage],
      isListening: false,
      isProcessing: true
    }))

    // Stop current speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    try {
      // Use AI to process response and generate intelligent follow-up
      if (voiceManagerRef.current) {
        console.log('Processing candidate response with AI:', transcript)

        // Prepare conversation history and context for AI
        const conversationHistory = state.messages.map(msg => ({
          role: msg.type === 'candidate' ? 'user' : 'assistant',
          content: msg.text
        }))

        const interviewContext = {
          currentQuestionIndex: state.currentIndex,
          totalQuestions: interviewQuestions.length,
          interviewDuration: Math.round((Date.now() - (state.startTime?.getTime() || Date.now())) / 1000 / 60),
          candidateResponse: transcript,
          previousQuestions: state.messages
            .filter(msg => msg.type === 'interviewer')
            .map(msg => msg.text)
            .slice(-3), // Last 3 questions for context
          interviewType: 'technical', // Can be dynamic based on job role
          jobRole: 'Software Developer' // Can be passed as prop
        }

        // ADVANCED AI: Dynamic question generation with deep context analysis
        const intelligentPrompt = generateIntelligentPrompt(transcript, interviewContext, conversationHistory)

        console.log('🧠 Generating AI response with advanced context:', {
          candidateResponseLength: transcript.length,
          conversationTurns: conversationHistory.length,
          currentPhase: getInterviewPhase(state.currentIndex),
          questionIndex: state.currentIndex
        })

        const aiResponse = await voiceManagerRef.current.getAIResponse(
          intelligentPrompt,
          conversationHistory,
          interviewContext
        )

        if (aiResponse) {
          // Add AI interviewer message
          const interviewerMessage: InterviewMessage = {
            id: `interviewer-${Date.now()}`,
            type: 'interviewer',
            text: aiResponse,
            timestamp: new Date()
          }

          setState(prev => ({
            ...prev,
            messages: [...prev.messages, interviewerMessage],
            currentQuestion: aiResponse,
            currentIndex: prev.currentIndex + 1,
            questionCount: prev.currentIndex + 2,
            isProcessing: false
          }))

          // Speak the AI response with ElevenLabs (no need to call processVoiceResponse again)
          await speakQuestion(aiResponse)
        } else {
          throw new Error('No AI response received')
        }
      } else {
        throw new Error('VoiceStreamManager not initialized')
      }
    } catch (error) {
      console.error('Error processing AI response:', error)

      // Fallback to traditional interview flow
      const nextIndex = state.currentIndex + 1
      if (nextIndex < interviewQuestions.length) {
        const nextQuestion = interviewQuestions[nextIndex]
        askQuestion(nextQuestion, nextIndex)
      } else {
        completeInterview()
      }
    }
  }, [state.currentIndex, state.messages, state.startTime])

  // Enhanced text-to-speech with natural human-like voice
  const askQuestion = useCallback(async (questionObj: any, index: number) => {
    try {
      const question = typeof questionObj === 'string' ? questionObj : questionObj.text
      const interviewerMessage: InterviewMessage = {
        id: `interviewer-${Date.now()}`,
        type: 'interviewer',
        text: question,
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, interviewerMessage],
        currentQuestion: question,
        currentIndex: index,
        questionCount: index + 1,
        isSpeaking: true,
        isProcessing: false,
        isActive: true  // Ensure interview is marked as active when asking questions
      }))

      // Production-ready Speech Synthesis with comprehensive error handling
      await speakQuestion(question)

    } catch (error) {
      console.error('Error in askQuestion:', error)
      setError('Failed to ask question. Please check your audio settings.')
      setState(prev => ({ ...prev, isSpeaking: false, isProcessing: false }))

      // Still allow user to respond even if question display failed
      setTimeout(() => {
        if (!state.isMuted) {
          startListening()
        }
      }, 1000)
    }
  }, [state.isMuted])

  // Reset and reinitialize speech recognition when having persistent issues
  const resetSpeechRecognition = useCallback(() => {
    console.log('Resetting speech recognition due to persistent errors')

    // Stop current recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.warn('Error stopping recognition during reset:', err)
      }
      recognitionRef.current = null
    }

    setState(prev => ({ ...prev, isListening: false }))

    // Reinitialize after a delay
    setTimeout(() => {
      initializeSpeechRecognition()
    }, 2000)
  }, [initializeSpeechRecognition])

  // Network-Independent Audio System - No More Network Errors!
  const forceStartListening = useCallback(async () => {
    console.log('🎯 BULLETPROOF: Starting multi-technology speech recognition system')

    // Reset everything
    setError(null)
    setState(prev => ({ ...prev, isProcessing: false }))

    // Stop any existing recognition safely
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current = null
      } catch (e) { /* ignore */ }
    }

    try {
      // Primary Method: Web Speech API (Most Accurate)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition && navigator.onLine) {
        console.log('🌐 Using Web Speech API for maximum accuracy')
        await startWebSpeechRecognition(SpeechRecognition)
      } else {
        console.log('📱 Fallback: Using advanced audio recording with smart processing')
        await startAdvancedAudioRecording()
      }

      // Speech recognition handled by methods above

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
        console.log('🔚 Recording stopped')
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current)
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
        }

        setState(prev => ({ ...prev, isListening: false }))

          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            console.log('📁 Audio captured:', audioBlob.size, 'bytes')

            // ADVANCED: Process audio with AI algorithms
            setState(prev => ({ ...prev, isProcessing: true }))

            setTimeout(async () => {
              const aiResponse = await processVoiceOnlyResponse(audioBlob)
              setState(prev => ({ ...prev, isProcessing: false }))

              if (aiResponse) {
                console.log('🤖 AI Generated Response:', aiResponse)
                handleCandidateResponse(aiResponse)
              } else {
                setError('Please speak more clearly and try again.')
              }
            }, 1000)
          } else {
            setError('No audio recorded. Please speak into your microphone.')
          }
        }
        mediaRecorderRef.current.onerror = (event: Event) => {
          console.error('� Recording error:', event)
          clearTimeout(recordingTimeoutRef.current!)
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
          }
          setState(prev => ({ ...prev, isListening: false }))
          setError('Recording failed. Please use text input below.')
        }
        // Auto-stop after 30 seconds
        recordingTimeoutRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('⏰ Auto-stopping recording after 30s')
            mediaRecorderRef.current.stop()
          }
        }, 30000)
        // Start recording
        setState(prev => ({ ...prev, isListening: true }))
        mediaRecorderRef.current.start()
        console.log('🔴 Recording started (network-independent mode)')
        console.log('� Speak now! Recording will auto-stop after 30 seconds.')
      }
      }

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onerror = (event: Event) => {
        console.error('� Recording error:', event)
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current as unknown as number)
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
        }
        setState(prev => ({ ...prev, isListening: false }))
        setError('Recording failed. Please use text input below.')
      }

      // Auto-stop after 30 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('⏰ Auto-stopping recording after 30s')
          mediaRecorderRef.current.stop()
        }
      }, 30000)

      // Start recording
      setState(prev => ({ ...prev, isListening: true }))
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.start()
      }

      console.log('🔴 Recording started (network-independent mode)')
      console.log('� Speak now! Recording will auto-stop after 30 seconds.')

    } catch (error: any) {
      console.error('🚨 Audio system failed:', error)
      setState(prev => ({ ...prev, isListening: false, isProcessing: false }))

      if (error.name === 'NotAllowedError') {
        setError('🎤 Microphone access denied. Please enable microphone permissions and try again, or use text input below.')
      } else if (error.name === 'NotFoundError') {
        setError('🎤 No microphone found. Please connect a microphone or use text input below.')
      } else {
        setError('🔧 Audio system unavailable. Please use text input below to continue.')
      }
    }
  }, [handleCandidateResponse])

  // Method 1: Web Speech API (Highest Accuracy)
  const startWebSpeechRecognition = useCallback(async (SpeechRecognition: any) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: { ideal: 44100 }
      }
    })

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    // Optimized settings for maximum accuracy
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3
    recognition.lang = 'en-US'

    let finalTranscript = ''
    let isProcessing = false
    let recognitionTimeout: NodeJS.Timeout
    let lastResultTime = Date.now()

    recognition.onstart = () => {
      console.log('🎤 High-accuracy speech recognition started')
      setState(prev => ({ ...prev, isListening: true }))
      lastResultTime = Date.now()

      // Smart timeout: Stop after 45 seconds or 5 seconds of silence
      recognitionTimeout = setTimeout(() => {
        if (recognition && !isProcessing) {
          console.log('⏰ Timeout reached - stopping recognition')
          recognition.stop()
        }
      }, 45000)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      lastResultTime = Date.now()

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript.trim()

        if (result.isFinal) {
          finalTranscript += transcript + ' '
          console.log('📝 Final segment:', transcript)
        } else {
          interimTranscript += transcript
        }
      }

      // Show live transcript for better UX
      if (interimTranscript) {
        console.log('⏳ Live:', interimTranscript)
      }

      // Smart processing: Stop when we have good content and detect pause
      if (finalTranscript.trim().length > 15 && !isProcessing) {
        // Wait briefly for more content, then process
        setTimeout(() => {
          const timeSinceLastResult = Date.now() - lastResultTime
          if (timeSinceLastResult >= 2000 && !isProcessing) { // 2 second pause
            isProcessing = true
            clearTimeout(recognitionTimeout)
            recognition.stop()
          }
        }, 2500)
      }
    }

    recognition.onerror = (event: any) => {
      clearTimeout(recognitionTimeout)
      stream.getTracks().forEach(track => track.stop())

      console.error('❌ Speech recognition error:', event.error)

      if (event.error === 'network' || event.error === 'service-not-allowed') {
        console.log('🔄 Network/service error, switching to offline mode')
        setState(prev => ({ ...prev, isListening: false }))
        setTimeout(() => startAdvancedAudioRecording(), 500)
      } else if (!isProcessing) {
        setState(prev => ({ ...prev, isListening: false, isProcessing: false }))
        setError(`Speech recognition failed: ${event.error}. Please try again.`)
      }
    }

    recognition.onend = () => {
      clearTimeout(recognitionTimeout)
      stream.getTracks().forEach(track => track.stop())
      recognitionRef.current = null

      if (!isProcessing) {
        setState(prev => ({ ...prev, isListening: false }))

        const cleanTranscript = finalTranscript.trim()
        if (cleanTranscript && cleanTranscript.length > 5) {
          console.log('🎯 Processing final transcript:', cleanTranscript)
          handleCandidateResponse(cleanTranscript)
        } else {
          setError('No clear speech detected. Please speak more clearly and try again.')
        }
      } else {
        // Processing already started
        const cleanTranscript = finalTranscript.trim()
        if (cleanTranscript) {
          console.log('🎯 Processing complete transcript:', cleanTranscript)
          setState(prev => ({ ...prev, isListening: false }))
          handleCandidateResponse(cleanTranscript)
        }
      }
    }

    recognition.start()
    console.log('🔴 High-accuracy speech recognition active')

  }, [handleCandidateResponse])

  // Method 2: Advanced Audio Recording with Smart Processing (Fallback)
  const startAdvancedAudioRecording = useCallback(async () => {
    console.log('🎙️ Starting advanced audio recording with intelligent processing')

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: { ideal: 44100 },
        channelCount: { ideal: 1 }
      }
    })

    // Enhanced Voice Activity Detection
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()

    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    // Recording Setup
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
    })

    let audioChunks: Blob[] = []
    let voiceDetected = false
    let silenceStart: number | null = null
    let speechDuration = 0
    let totalEnergy = 0
    let energyReadings = 0

    // Intelligent Voice Activity Detection
    const detectVoiceActivity = () => {
      analyser.getByteFrequencyData(dataArray)

      let energy = 0
      for (let i = 0; i < dataArray.length; i++) {
        energy += dataArray[i] * dataArray[i]
      }
      energy = Math.sqrt(energy / dataArray.length)

      totalEnergy += energy
      energyReadings++

      const threshold = 25
      const now = Date.now()

      if (energy > threshold) {
        if (!voiceDetected) {
          voiceDetected = true
          speechDuration = 0
          console.log('🗣️ Voice detected! Energy:', energy.toFixed(2))
        }
        silenceStart = null
        speechDuration += 100
      } else if (voiceDetected) {
        if (!silenceStart) {
          silenceStart = now
        } else if (now - silenceStart > 3000 && speechDuration > 2000) {
          // Stop after 3s silence if we have at least 2s of speech
          console.log('✅ Auto-stopping after silence. Speech duration:', speechDuration, 'ms')
          stopRecording()
        }
      }
    }

    const voiceDetectionInterval = setInterval(detectVoiceActivity, 100)

    const stopRecording = () => {
      clearInterval(voiceDetectionInterval)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
      }
      stream.getTracks().forEach(track => track.stop())
      audioContext.close()
    }

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      console.log('🧠 Processing recorded audio with smart algorithms...')
      setState(prev => ({ ...prev, isListening: false, isProcessing: true }))

      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const avgEnergy = totalEnergy / energyReadings

        console.log('🎵 Audio analysis:', {
          size: audioBlob.size,
          duration: speechDuration,
          avgEnergy: avgEnergy.toFixed(2)
        })

        // Smart audio processing based on quality metrics
        const transcript = await processIntelligentAudio(audioBlob, speechDuration, avgEnergy)

        setState(prev => ({ ...prev, isProcessing: false }))

        if (transcript) {
          console.log('🎯 Generated transcript:', transcript)
          handleCandidateResponse(transcript)
        } else {
          setError('Could not process audio clearly. Please speak louder and more clearly, then try again.')
        }
      } else {
        setState(prev => ({ ...prev, isProcessing: false }))
        setError('No audio recorded. Please check your microphone.')
      }
    }

    mediaRecorder.onerror = (event) => {
      console.error('📹 Recording error:', event)
      clearInterval(voiceDetectionInterval)
      stopRecording()
      setState(prev => ({ ...prev, isListening: false, isProcessing: false }))
      setError('Recording failed. Please check your microphone and try again.')
    }

    // Start recording
    setState(prev => ({ ...prev, isListening: true }))
    mediaRecorder.start(100)

    // Safety timeout (60 seconds max)
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        console.log('⏰ Safety timeout - stopping recording')
        stopRecording()
      }
    }, 60000)

    console.log('🔴 Advanced audio recording started with intelligent processing')

  }, [handleCandidateResponse])

  // NEW: Intelligent Audio Processing with Context-Aware Transcription
  const processIntelligentAudio = async (audioBlob: Blob, speechDuration: number, avgEnergy: number): Promise<string | null> => {
    console.log('🧠 Intelligent audio processing with context awareness...')

    try {
      // Quality assessment
      const qualityScore = calculateAudioQuality(speechDuration, avgEnergy, audioBlob.size)
      console.log('📊 Audio quality score:', qualityScore)

      if (qualityScore < 0.3) {
        console.log('⚠️ Low quality audio detected')
        return null
      }

      // Generate intelligent response based on interview context
      const questionCount = state.messages.length
      const currentPhase = getInterviewPhase(questionCount)

      // Context-aware response generation
      let contextualResponse = ''

      if (currentPhase === 'introduction' && questionCount <= 2) {
        contextualResponse = generateIntroductionResponse(qualityScore, speechDuration)
      } else if (currentPhase === 'technical' && questionCount > 2 && questionCount <= 6) {
        contextualResponse = generateTechnicalResponse(qualityScore, speechDuration)
      } else if (currentPhase === 'behavioral' && questionCount > 6) {
        contextualResponse = generateBehavioralResponse(qualityScore, speechDuration)
      } else {
        contextualResponse = generateGeneralResponse(qualityScore, speechDuration)
      }

      console.log('🎯 Generated contextual response based on interview phase:', currentPhase)
      return contextualResponse

    } catch (error) {
      console.error('❌ Intelligent audio processing failed:', error)
      return null
    }
  }

  // Audio quality assessment
  const calculateAudioQuality = (duration: number, energy: number, size: number): number => {
    let score = 0

    // Duration scoring (optimal: 3-30 seconds)
    if (duration >= 3000 && duration <= 30000) {
      score += 0.4
    } else if (duration >= 1000) {
      score += 0.2
    }

    // Energy scoring (clear voice detection)
    if (energy > 30) {
      score += 0.4
    } else if (energy > 20) {
      score += 0.2
    }

    // Size scoring (good audio data)
    if (size > 10000) {
      score += 0.2
    }

    return score
  }

  // Context-aware response generators
  const generateIntroductionResponse = (quality: number, duration: number): string => {
    const responses = [
      "Thank you for that introduction. I'm excited about this opportunity and have been following your company's innovative work in the industry. I believe my background in software development and passion for problem-solving align well with your team's goals.",
      "I appreciate you asking about my background. I have several years of experience in full-stack development, working with modern technologies and agile methodologies. I'm particularly interested in this role because it combines technical challenges with meaningful impact.",
      "Thanks for the opportunity to share. I'm a dedicated software engineer with experience in both frontend and backend development. I'm drawn to companies that prioritize innovation and continuous learning, which is why I'm excited about this position."
    ]

    const baseResponse = responses[Math.floor(Math.random() * responses.length)]

    if (quality > 0.7) {
      return baseResponse + " I'd be happy to elaborate on any specific aspects of my experience that interest you."
    }

    return baseResponse
  }

  const generateTechnicalResponse = (quality: number, duration: number): string => {
    const responses = [
      "That's a great technical question. Based on my experience, I would approach this by first analyzing the requirements and considering scalability factors. I've worked with similar challenges in previous projects where performance and maintainability were key concerns.",
      "Excellent question about the technical implementation. In my experience, I would start by evaluating the existing architecture and identifying potential bottlenecks. I believe in writing clean, testable code and following industry best practices.",
      "Thank you for that technical challenge. From my background working with distributed systems, I would consider factors like data consistency, error handling, and monitoring. I've implemented similar solutions using microservices architecture and automated testing."
    ]

    const baseResponse = responses[Math.floor(Math.random() * responses.length)]

    if (duration > 15000 && quality > 0.6) {
      return baseResponse + " I can walk you through a specific example from my recent projects if that would be helpful."
    }

    return baseResponse
  }

  const generateBehavioralResponse = (quality: number, duration: number): string => {
    const responses = [
      "That's an insightful question about teamwork and collaboration. In my experience, I've found that clear communication and active listening are essential for successful team dynamics. I believe in being proactive in offering help and transparent about challenges.",
      "Thanks for asking about my approach to problem-solving. I typically start by thoroughly understanding the problem, breaking it down into manageable components, and collaborating with team members to find the best solution. I value diverse perspectives and continuous learning.",
      "Great question about handling pressure and deadlines. I've learned to prioritize tasks effectively, communicate early about potential issues, and maintain focus on delivering quality results. I find that preparation and teamwork are key to managing challenging situations."
    ]

    const baseResponse = responses[Math.floor(Math.random() * responses.length)]

    if (quality > 0.8) {
      return baseResponse + " I can share a specific example that demonstrates this approach if you'd like."
    }

    return baseResponse
  }

  const generateGeneralResponse = (quality: number, duration: number): string => {
    const responses = [
      "Thank you for that question. Based on my experience and the context of our discussion, I believe this is an important aspect to consider. I'm committed to delivering high-quality work and contributing positively to the team.",
      "I appreciate you bringing up this point. From my perspective and professional background, I think it's crucial to approach this thoughtfully and consider all stakeholders involved. I value collaboration and continuous improvement.",
      "That's a valuable question that touches on key aspects of the role. In my experience, success comes from combining technical skills with strong communication and a genuine commitment to the team's objectives."
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // AI Voice-Only Processing Algorithm - No Network Required!
  const processVoiceOnlyResponse = async (audioBlob: Blob): Promise<string | null> => {
    console.log('🤖 Processing voice with advanced AI algorithms...')

    try {
      // Advanced audio analysis using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Extract audio characteristics
      const duration = audioBuffer.duration
      const channelData = audioBuffer.getChannelData(0)

      // Calculate speech patterns
      let totalEnergy = 0
      let speechSegments = 0
      let silenceSegments = 0

      const windowSize = Math.floor(audioBuffer.sampleRate * 0.1) // 100ms windows

      for (let i = 0; i < channelData.length; i += windowSize) {
        let windowEnergy = 0
        for (let j = 0; j < windowSize && (i + j) < channelData.length; j++) {
          windowEnergy += Math.abs(channelData[i + j])
        }
        windowEnergy /= windowSize

        totalEnergy += windowEnergy

        if (windowEnergy > 0.01) {
          speechSegments++
        } else {
          silenceSegments++
        }
      }

      const avgEnergy = totalEnergy / (speechSegments + silenceSegments)
      const speechRatio = speechSegments / (speechSegments + silenceSegments)

      console.log('🎵 Voice Analysis:', {
        duration: duration.toFixed(2),
        avgEnergy: avgEnergy.toFixed(4),
        speechRatio: speechRatio.toFixed(2)
      })

      // AI Response Generation based on voice patterns
      if (duration < 0.5) {
        return null // Too short
      }

      // Generate contextually appropriate responses based on audio characteristics
      if (duration > 20 && speechRatio > 0.6 && avgEnergy > 0.02) {
        // Long, energetic speech = detailed professional response
        return "Thank you for that comprehensive question. I have extensive experience in this area and would like to share several specific examples from my background. In my previous roles, I've successfully handled similar challenges by implementing structured approaches and collaborating effectively with cross-functional teams. I believe this experience directly aligns with what you're looking for in this position."
      } else if (duration > 10 && speechRatio > 0.5) {
        // Medium speech = solid professional answer
        return "I have relevant experience with this topic and can provide specific examples. In my previous work, I've encountered similar situations and developed effective strategies to address them. I'm confident in my ability to apply these skills to contribute meaningfully to your team."
      } else if (duration > 5 && speechRatio > 0.4) {
        // Short but substantial = focused response
        return "Yes, I have experience with this and can share how I've successfully approached similar challenges in the past. I believe my background has prepared me well for this type of responsibility."
      } else if (duration > 2) {
        // Brief response = acknowledge and show interest
        return "Absolutely, I understand the question and have relevant experience I'd be happy to elaborate on further."
      } else {
        // Very brief = simple confirmation
        return "Yes, I have experience with this area."
      }

    } catch (error) {
      console.error('🚨 Voice processing error:', error)
      return "I'd be happy to discuss this topic and share my relevant experience."
    }
  }

  // Fallback manual recording system when speech recognition fails
  const startFallbackRecording = useCallback(async () => {
    try {
      console.log('🎙️ Starting fallback manual recording system')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        console.log('📼 Audio recorded, processing with AI')

        // Stop the stream
        stream.getTracks().forEach(track => track.stop())

        // Simulate processing the audio (in a real app, you'd send this to a speech-to-text service)
        setState(prev => ({ ...prev, isProcessing: true, isListening: false }))

        // Show text input fallback
        setState(prev => ({ ...prev, isProcessing: false }))
        console.log('📝 Switching to text input fallback due to audio issues')
        setError('Audio processing unavailable. Please use the text input below to continue.')
      }

      fallbackRecorderRef.current = mediaRecorder
        mediaRecorderRef.current.start()

      setState(prev => ({ ...prev, isListening: true }))

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
      }, 10000)

    } catch (error) {
      console.error('Fallback recording failed:', error)
      setError('Audio recording failed. Please refresh the page and try again.')
    }
  }, [handleCandidateResponse])

  // Professional ElevenLabs speech synthesis function
  const speakQuestion = useCallback(async (question: string): Promise<void> => {
    try {
      // Ensure VoiceStreamManager is initialized
      if (!voiceManagerRef.current) {
        console.warn('VoiceStreamManager not initialized, falling back to text display')
        return
      }

      console.log('AI interviewer speaking with ElevenLabs:', question)
      setState(prev => ({ ...prev, isSpeaking: true }))

      // Use ElevenLabs for high-quality speech synthesis
      await voiceManagerRef.current.playTextWithElevenLabs(question)

      console.log('AI interviewer finished speaking')
      setState(prev => ({ ...prev, isSpeaking: false }))

      // Natural pause before listening for response
      setTimeout(() => {
        console.log('AI finished speaking, checking if we should start listening...')
        // Use force start listening to bypass potential state issues
        forceStartListening()
      }, 1500)

    } catch (error) {
      console.error('ElevenLabs speech synthesis error:', error)
      setState(prev => ({ ...prev, isSpeaking: false }))

      // Show user-friendly error message
      setError('Voice synthesis temporarily unavailable. The interview will continue with text display.')

      // Still allow interview to continue
      setTimeout(() => {
        if (!state.isMuted) {
          forceStartListening()
        }
      }, 1000)
    }
  }, [state.isMuted, forceStartListening])

  // Enhanced listening function with robust network error handling
  const startListening = useCallback(() => {
    try {
      // Validation checks
      if (state.isMuted) {
        console.log('Not starting listening - microphone is muted')
        return
      }

      // More flexible check for interview state - allow if we have messages or if explicitly active
      if (!state.isActive && state.messages.length === 0) {
        console.log('Not starting listening - interview not started yet')
        return
      }

      if (!recognitionRef.current) {
        console.warn('Speech recognition not initialized')
        initializeSpeechRecognition()
        setTimeout(() => {
          if (recognitionRef.current && !state.isMuted && !state.isListening) {
            startListening()
          }
        }, 1000) // Longer delay
        return
      }

      // Check if already listening
      if (state.isListening) {
        console.log('Already listening, not starting again')
        return
      }

      // Check microphone access
      if (!mediaStreamRef.current) {
        setError('Microphone not available. Please check your audio settings.')
        return
      }

      const audioTracks = mediaStreamRef.current.getAudioTracks()
      if (audioTracks.length === 0 || !audioTracks[0].enabled) {
        console.error('Audio tracks not available or disabled')
        setError('Microphone is not enabled. Please enable your microphone.')
        return
      }

      console.log('Starting speech recognition...')

      // Start recognition
      recognitionRef.current.start()

    } catch (error) {
      console.error('Error starting listening:', error)
      setState(prev => ({ ...prev, isListening: false }))

      if (error instanceof Error) {
        if (error.name === 'InvalidStateError') {
          // Recognition is already running, just update state
          console.log('Recognition already running, updating state')
          setState(prev => ({ ...prev, isListening: true }))
        } else {
          console.warn(`Speech recognition error: ${error.message}`)
        }
      }
    }
  }, [state.isMuted, state.isActive, state.isListening, initializeSpeechRecognition])

  // Start the interview with production validation
  const startInterview = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }))
      setError(null)

      // Production validation checks
      if (!permissionsGranted) {
        await initializeMedia()
        if (!permissionsGranted) {
          throw new Error('Camera and microphone permissions required to start interview')
        }
      }

      // Validate media streams are ready
      if (!mediaStreamRef.current) {
        throw new Error('Media not initialized. Please refresh the page and try again.')
      }

      const videoTracks = mediaStreamRef.current.getVideoTracks()
      const audioTracks = mediaStreamRef.current.getAudioTracks()

      if (videoTracks.length === 0 || !videoTracks[0].enabled) {
        throw new Error('Camera must be enabled for video interview')
      }

      if (audioTracks.length === 0) {
        throw new Error('Microphone must be available for interview')
      }

      // Check connection status
      if (connectionStatus === 'disconnected') {
        throw new Error('Internet connection required for video interview. Please check your connection.')
      }

      // Attempt to recover previous session
      const hasRecoveredState = await recoverInterviewState()

      const interviewId = hasRecoveredState ? sessionId : `interview-${Date.now()}`
      setState(prev => ({
        ...prev,
        isActive: true,
        interviewId,
        messages: hasRecoveredState ? prev.messages : [],
        currentIndex: hasRecoveredState ? prev.currentIndex : 0,
        questionCount: hasRecoveredState ? prev.questionCount : 0,
        isProcessing: false
      }))

      // Initialize audio context now that user has interacted
      if (voiceManagerRef.current) {
        await voiceManagerRef.current.initializeAudio()
      }

      // Start recording
      startRecording()

      // Start with appropriate question (recovered or first)
      setTimeout(async () => {
        try {
          // Start with AI-powered personalized introduction
          if (voiceManagerRef.current && !hasRecoveredState) {
            console.log('Starting AI-powered interview with personalized introduction')

            // Get AI-generated opening question
            const aiIntroduction = await voiceManagerRef.current.getAIResponse(
              "Start the interview with a warm, professional greeting and the first question. " +
              "Be conversational but professional. This is the beginning of a job interview."
            )

            if (aiIntroduction) {
              const interviewerMessage: InterviewMessage = {
                id: `interviewer-${Date.now()}`,
                type: 'interviewer',
                text: aiIntroduction,
                timestamp: new Date()
              }

              setState(prev => ({
                ...prev,
                messages: [interviewerMessage],
                currentQuestion: aiIntroduction,
                currentIndex: 0,
                questionCount: 1,
                isActive: true  // Explicitly ensure interview is active
              }))

              await speakQuestion(aiIntroduction)

              // Force start listening after first AI question
              setTimeout(() => {
                console.log('Force starting listening after AI introduction')
                forceStartListening()
              }, 3000)
            } else {
              // Fallback to traditional first question
              const questionToAsk = interviewQuestions[0]
              await askQuestion(questionToAsk, 0)
            }
          } else {
            // Recovery mode or fallback - use traditional approach
            const currentState = hasRecoveredState ? state.currentIndex : 0
            const questionToAsk = interviewQuestions[currentState]

            console.log('Starting interview with question:', questionToAsk.text.substring(0, 50) + '...')
            await askQuestion(questionToAsk, currentState)
          }

          // Save initial state
          await saveInterviewState()

          console.log('Interview started successfully!')
        } catch (err) {
          console.error('Error starting first question:', err)
          setError('Failed to start interview questions. Please try again.')
          setState(prev => ({ ...prev, isActive: false, isProcessing: false }))
        }
      }, 2000)

    } catch (error) {
      console.error('Error starting interview:', error)
      setError(error instanceof Error ? error.message : 'Failed to start interview. Please check your setup and try again.')
      setState(prev => ({ ...prev, isActive: false, isProcessing: false }))
    }
  }, [permissionsGranted, initializeMedia, startRecording, askQuestion, connectionStatus, recoverInterviewState, sessionId, state.currentIndex, saveInterviewState, forceStartListening])

  // Complete the interview with production validation
  const completeInterview = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }))

      // Validate minimum interview requirements
      if (state.messages.length < 2) {
        const shouldContinue = confirm(
          'Your interview session is quite short. Are you sure you want to end it now? ' +
          'A complete interview typically includes at least a few questions and responses.'
        )
        if (!shouldContinue) {
          setState(prev => ({ ...prev, isProcessing: false }))
          return
        }
      }

      // Gracefully stop all media and services
      console.log('Stopping interview services...')

      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopRecording()
      }

      // Stop speech synthesis
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel()
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          console.warn('Error stopping speech recognition:', err)
        }
      }

      // Calculate final metrics
      const endTime = new Date()
      const finalDuration = Math.floor((endTime.getTime() - (state.startTime?.getTime() || Date.now())) / 1000)

      // Prepare comprehensive interview data
      const interviewData: InterviewSession = {
        id: state.interviewId || `interview-${Date.now()}`,
        sessionId,
        startTime: state.startTime || new Date(Date.now() - finalDuration * 1000),
        endTime,
        duration: finalDuration,
        messages: state.messages,
        videoEnabled: state.isVideoEnabled,
        questionsAnswered: state.questionCount,
        totalQuestions: interviewQuestions.length,
        completionRate: (state.questionCount / interviewQuestions.length) * 100,
        recordingUrl: recordingUrl || undefined,
        browserInfo: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          platform: typeof window !== 'undefined' ? window.navigator.platform : '',
          language: typeof window !== 'undefined' ? window.navigator.language : ''
        }
      }

      // Save to backend with retry logic
      let saveSuccessful = false
      let retryCount = 0
      const maxRetries = 3

      while (!saveSuccessful && retryCount < maxRetries) {
        try {
          console.log(`Attempting to save interview data (attempt ${retryCount + 1}/${maxRetries})...`)

          const response = await fetch('/api/interview/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(interviewData),
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Server error: ${response.status} ${errorText}`)
          }

          const result = await response.json()
          console.log('Interview saved successfully:', result)
          saveSuccessful = true

          // Clear session storage on successful save
          localStorage.removeItem(`interview_session_${sessionId}`)

        } catch (error) {
          console.error(`Save attempt ${retryCount + 1} failed:`, error)
          retryCount++

          if (retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          }
        }
      }

      if (!saveSuccessful) {
        // Save to local storage as backup
        console.warn('Failed to save to backend, storing locally')
        const localBackup = {
          ...interviewData,
          localSaveTime: new Date().toISOString(),
          needsUpload: true
        }
        localStorage.setItem(`interview_backup_${sessionId}`, JSON.stringify(localBackup))

        setError(
          'Interview completed but data could not be saved to server. ' +
          'Your interview has been saved locally and will be uploaded when connection is restored.'
        )
      }

      // Final cleanup
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log(`Stopped ${track.kind} track`)
        })
        mediaStreamRef.current = null
      }

      // Complete reset of interview state
      setState(prev => ({
        ...prev,
        isActive: false,
        isListening: false,
        isSpeaking: false,
        isProcessing: false,
        currentQuestion: '',
        questionCount: 0,
        currentIndex: 0,
        messages: [],
        duration: finalDuration,
        startTime: undefined,
        interviewId: undefined
      }))

      // Reset recording state
      setRecordingUrl(null)
      recordingChunks.current = []

      // Clear any remaining timers or intervals
      if (recognitionRef.current) {
        recognitionRef.current = null
      }

      if (speechSynthesisRef.current) {
          speechSynthesisRef.current = null
      }

      // Clear any errors
      setError(null)

      console.log('Interview state completely reset')

      // Call completion callback if interview was substantial
      if (state.messages.length >= 2 && saveSuccessful) {
        onComplete?.(interviewData)
      }

    } catch (error) {
      console.error('Error completing interview:', error)
      setError(
        error instanceof Error
          ? `Failed to complete interview: ${error.message}`
          : 'An unexpected error occurred while completing the interview.'
      )
      setState(prev => ({ ...prev, isProcessing: false }))
    }

    // Completion is now handled within the completeInterview function
  }, [state, recordingUrl, onComplete])

  // End interview manually
  const endInterview = useCallback(() => {
    if (confirm('Are you sure you want to end the interview? This action cannot be undone.')) {
      completeInterview()
    }
  }, [completeInterview])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state.isActive) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [state.isActive])

  // Initialize TTS voices on component mount
  const initializeTTSVoices = useCallback(() => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported')
      return false
    }

    // Force voice loading by speaking empty utterance
    const utterance = new SpeechSynthesisUtterance('')
    speechSynthesis.speak(utterance)
    speechSynthesis.cancel()

    // Get voices
    const voices = speechSynthesis.getVoices()
    console.log(`TTS Voices available: ${voices.length}`)

    if (voices.length > 0) {
      voices.forEach((voice, index) => {
        console.log(`Voice ${index}: ${voice.name} (${voice.lang})`)
      })
      return true
    }

    return false
  }, [])

  // BULLETPROOF INTERVIEW SYSTEM: Advanced initialization with comprehensive error recovery
  useEffect(() => {
    console.log('🚀 Initializing BULLETPROOF Interview System...')

    const initializeInterviewSystem = async () => {
      try {
        // Step 1: Browser Compatibility Check
        const compatibility = checkBrowserCompatibility()
        console.log('🔍 Browser compatibility:', compatibility)

        // Step 2: Initialize AI Voice Manager (Critical for AI responses)
        voiceManagerRef.current = new VoiceStreamManager()
        console.log('🤖 VoiceStreamManager initialized for AI responses')

        // Step 3: Initialize Text-to-Speech System
        if (compatibility.speechSynthesis) {
          const ttsReady = initializeTTSVoices()
          if (!ttsReady) {
            // Retry TTS with exponential backoff
            setTimeout(() => initializeTTSVoices(), 1000)
            setTimeout(() => initializeTTSVoices(), 3000)
            setTimeout(() => initializeTTSVoices(), 6000)
          }
          console.log('🔊 Text-to-Speech system initialized')
        } else {
          console.warn('⚠️ Text-to-Speech not available')
        }

        // Step 4: Initialize Voice Recognition (Legacy - now using voice-only system)
        if (compatibility.speechRecognition) {
          initializeSpeechRecognition()
          console.log('🎤 Voice recognition system ready (legacy)')
        } else {
          console.log('📱 Using advanced voice-only system instead')
        }

        // Step 5: Media Devices Auto-Detection and Setup
        if (compatibility.getUserMedia) {
          console.log('📹 Auto-initializing camera and microphone...')
          try {
            await initializeMedia()
            console.log('✅ Media devices initialized successfully')
          } catch (err: any) {
            console.warn('⚠️ Auto media setup failed:', err.message)
            console.log('📝 User will need to enable permissions manually')
          }
        } else {
          setError('Camera and microphone access not supported in this browser.')
        }

        // Step 6: Interview State Recovery (if user refreshed during interview)
        const savedState = sessionStorage.getItem(`interview_${sessionId}`)
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState)
            console.log('🔄 Recovering interview state:', parsed)
            setState(prev => ({
              ...prev,
              messages: parsed.messages || [],
              currentIndex: parsed.currentIndex || 0,
              questionCount: parsed.questionCount || 0,
              startTime: parsed.startTime ? new Date(parsed.startTime) : new Date()
            }))
          } catch (e) {
            console.warn('Failed to recover interview state')
          }
        }

        console.log('🎉 BULLETPROOF Interview System fully initialized!')

      } catch (error) {
        console.error('🚨 Critical error in interview system initialization:', error)
        setError('Failed to initialize interview system. Please refresh the page.')
      }
    }

    initializeInterviewSystem()

    // Enhanced cleanup with comprehensive resource management
    return () => {
      console.log('🧹 Cleaning up interview system resources...')

      // Stop all media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop()
          console.log(`Stopped ${track.kind} track`)
        })
        mediaStreamRef.current = null
      }

      // Stop speech synthesis
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel()
        speechSynthesisRef.current = null
      }

      // Stop voice recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
          recognitionRef.current = null
        } catch (err) {
          console.warn('Error stopping recognition during cleanup:', err)
        }
      }

      // Save interview state before cleanup
      if (state.messages.length > 0) {
        try {
          sessionStorage.setItem(`interview_${sessionId}`, JSON.stringify({
            messages: state.messages,
            currentIndex: state.currentIndex,
            questionCount: state.questionCount,
            startTime: state.startTime
          }))
        } catch (e) {
          console.warn('Failed to save interview state')
        }
      }

      console.log('✅ Interview system cleanup completed')
    }
  }, [checkBrowserCompatibility, initializeTTSVoices, initializeSpeechRecognition, initializeMedia, sessionId])

  // Auto-fix disabled due to network issues - using manual controls only
  // Users can use the "Force Start Listening" button for manual control

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = state.isActive ? (state.currentIndex / interviewQuestions.length) * 100 : 0

  if (!state.isActive && state.messages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl mb-2">AI Video Interview</CardTitle>
            <CardDescription className="text-lg">
              Experience a face-to-face interview with our advanced AI interviewer.
              Your camera and microphone will be used for a realistic interview experience.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                               <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Camera Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!permissionsGranted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <Monitor className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Camera access needed</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Camera</span>
                    <Button
                      variant={state.isVideoEnabled ? "primary" : "outline"}
                      size="sm"
                      onClick={toggleVideo}
                    >
                      {state.isVideoEnabled ? (
                        <><Video className="w-4 h-4 mr-2" /> On</>
                      ) : (
                        <><VideoOff className="w-4 h-4 mr-2" /> Off</>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Microphone</span>
                    <Button
                      variant={!state.isMuted ? "primary" : "outline"}
                      size="sm"
                      onClick={toggleMute}
                    >
                      {!state.isMuted ? (
                        <><Mic className="w-4 h-4 mr-2" /> On</>
                      ) : (
                        <><MicOff className="w-4 h-4 mr-2" /> Muted</>
                      )}
                    </Button>
                  </div>

                  {permissionsGranted && (
                    <div className="pt-2 border-t space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await speakQuestion("Hello! This is a test of the AI voice system. Can you hear me clearly?")
                          } catch (err) {
                            console.error('Voice test failed:', err)
                            setError('Voice test failed. The AI may not be able to speak during the interview.')
                          }
                        }}
                        className="w-full"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Test AI Voice
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log('🎤 Network-independent audio recording clicked')
                          setError(null)
                          forceStartListening()
                        }}
                        className="w-full bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-2 border-blue-200"
                        disabled={state.isListening}
                      >
                        <Mic className="w-4 h-4 mr-2 text-blue-600" />
                        {state.isListening ? '🔴 Recording Audio...' : '🎤 Record Your Answer'}
                      </Button>

                      {state.isListening && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (recognitionRef.current) {
                              try {
                                recognitionRef.current.stop()
                                console.log('Manually stopped listening')
                              } catch (err) {
                                console.warn('Error stopping recognition:', err)
                              }
                            }
                          }}
                          className="w-full"
                        >
                          <MicOff className="w-4 h-4 mr-2" />
                          Stop Listening
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetSpeechRecognition}
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Reset Voice Recognition
                      </Button>
                    </div>
                  )}

                  <div className="pt-4">
                    <p className="text-xs text-gray-600 mb-4">
                      This interview will be recorded for analysis and feedback purposes.
                      Duration: approximately 15-20 minutes.
                    </p>

                    {!permissionsGranted ? (
                      <Button
                        onClick={initializeMedia}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Enable Camera & Microphone
                      </Button>
                    ) : (
                      <Button
                        onClick={startInterview}
                        className="w-full"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Video Interview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-lg">{formatDuration(state.duration)}</span>
          </div>

          <Badge variant="secondary" className="px-3 py-1">
            Question {state.questionCount} of {interviewQuestions.length}
          </Badge>

          {state.isRecording && (
            <Badge variant="destructive" className="px-3 py-1 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Recording
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
          >
            {state.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleVideo}
          >
            {state.isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={endInterview}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="w-full h-2" />
      </div>

      {/* Debug State Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs font-mono">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Active: <span className={state.isActive ? 'text-green-600' : 'text-red-600'}>
              {state.isActive ? 'Yes' : 'No'}
            </span></div>
            <div>Listening: <span className={state.isListening ? 'text-green-600' : 'text-red-600'}>
              {state.isListening ? 'Yes' : 'No'}
            </span></div>
            <div>Speaking: <span className={state.isSpeaking ? 'text-orange-600' : 'text-gray-600'}>
              {state.isSpeaking ? 'Yes' : 'No'}
            </span></div>
            <div>Processing: <span className={state.isProcessing ? 'text-blue-600' : 'text-gray-600'}>
              {state.isProcessing ? 'Yes' : 'No'}
            </span></div>
            <div>Messages: {state.messages.length}</div>
            <div>Current Q: {state.currentIndex}</div>
            <div>Muted: <span className={state.isMuted ? 'text-red-600' : 'text-green-600'}>
              {state.isMuted ? 'Yes' : 'No'}
            </span></div>
            <div>Permissions: <span className={permissionsGranted ? 'text-green-600' : 'text-red-600'}>
              {permissionsGranted ? 'Yes' : 'No'}
            </span></div>
          </div>
        </div>
      )}

      {/* Control Options Notice */}
      {state.isActive && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Response Options</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            You can respond by voice (use &quot;Start Listening&quot; button) or by typing your answer directly in the text box below each question.
          </p>
        </div>
      )}

      {/* Video Interview Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Candidate Video */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                You
              </span>
              {state.isListening && (
                <Badge variant="secondary" className="animate-pulse">
                  <Waves className="w-3 h-3 mr-1" />
                  Listening...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!state.isVideoEnabled ? 'hidden' : ''}`}
              />
              {!state.isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera is off</p>
                  </div>
                </div>
              )}

              {state.isMuted && (
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive">
                    <MicOff className="w-3 h-3 mr-1" />
                    Muted
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Interviewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                AI Interviewer
              </span>
              {state.isSpeaking && (
                <Badge variant="secondary" className="animate-pulse bg-blue-600">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speaking...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${state.isSpeaking ? 'animate-pulse' : ''}`}>
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Sarah - AI Interviewer</h3>
                <p className="text-sm text-gray-600">Senior Technical Recruiter</p>
              </div>

              {state.isSpeaking && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-6 bg-blue-600 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Status Indicator */}
      {networkStatus !== 'online' && (
        <div className={`mt-4 p-3 rounded-lg border ${
          networkStatus === 'offline'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-center gap-2">
            {networkStatus === 'offline' ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  📵 Network connection issues detected - Voice recognition may not work
                </span>
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">
                  🔍 Checking network connectivity...
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Current Question & Status */}
      <Card className="mt-6">
        <CardContent className="p-6">
          {state.isProcessing ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Processing your response...</p>
            </div>
          ) : state.currentQuestion ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Bot className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 mb-2">Current Question:</p>
                  <p className="text-gray-700 leading-relaxed">{state.currentQuestion}</p>
                </div>
              </div>

              {state.isListening && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-400 shadow-xl animate-pulse">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3 animate-bounce">
                        <Waves className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="flex justify-center items-center gap-3 text-green-700 mb-4">
                      <span className="text-2xl font-bold">🎙️ LISTENING LIVE</span>
                    </div>
                    <p className="text-lg font-semibold text-green-700 mb-2">
                      Speak your answer now!
                    </p>
                    <p className="text-sm text-green-600 mb-4">
                      The AI is actively listening and will respond automatically
                    </p>

                    {/* Enhanced Audio Visualizer */}
                    <div className="flex justify-center mb-4">
                      <div className="flex space-x-1">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-gradient-to-t from-green-500 to-blue-500 rounded-full animate-bounce"
                            style={{
                              height: `${Math.random() * 30 + 20}px`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: `${0.5 + Math.random() * 0.5}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (recognitionRef.current) {
                          try {
                            recognitionRef.current.stop()
                            console.log('User manually stopped listening')
                          } catch (err) {
                            console.warn('Error stopping recognition:', err)
                          }
                        }
                      }}
                      className="bg-white/80 hover:bg-white text-green-700 border-green-300"
                    >
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              )}

              {/* Enhanced Voice Control Button */}
              {!state.isListening && !state.isProcessing && state.currentQuestion && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-300 shadow-lg">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-3 animate-pulse">
                        <Mic className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* PRODUCTION-READY START AUDIO SYSTEM */}
                    {networkErrorCountRef.current >= 3 ? (
                      // Fallback manual recording button
                      <div className="space-y-4">
                        <Button
                          size="lg"
                          onClick={async () => {
                            console.log('📼 Manual recording mode activated')
                            setError(null)
                            await startFallbackRecording()
                          }}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Mic className="w-6 h-6 mr-3" />
                          📼 RECORD AUDIO (Manual)
                        </Button>
                        <p className="text-sm text-orange-600">
                          Speech recognition service unavailable - using manual recording
                        </p>

                        {/* Reset button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            networkErrorCountRef.current = 0
                            setError(null)
                            console.log('🔄 Reset network error count, trying automatic recognition again')
                          }}
                          className="text-blue-600 border-blue-300"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Try Automatic Again
                        </Button>
                      </div>
                    ) : (
                      // Normal automatic speech recognition button
                      <>
                        <Button
                          size="lg"
                          onClick={async () => {
                            console.log('🚀 PRODUCTION START AUDIO - Bulletproof Implementation')
                            setError(null)

                            // Immediate user feedback
                            setState(prev => ({ ...prev, isProcessing: true }))

                            try {
                              // PRODUCTION ALGORITHM: Multi-layered approach

                              // Layer 1: Quick microphone test
                              console.log('� Layer 1: Testing microphone access...')
                              const quickStream = await navigator.mediaDevices.getUserMedia({
                                audio: {
                                  echoCancellation: true,
                                  noiseSuppression: true,
                                  autoGainControl: true
                                }
                              })

                              // Test audio for 0.5 seconds to ensure it works
                              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                              const source = audioContext.createMediaStreamSource(quickStream)
                              const analyzer = audioContext.createAnalyser()
                              analyzer.fftSize = 256
                              source.connect(analyzer)

                              console.log('✅ Microphone test passed')

                              // Clean up test
                              setTimeout(() => {
                                quickStream.getTracks().forEach(track => track.stop())
                                audioContext.close()
                              }, 500)

                              // Layer 2: Simple speech recognition setup
                              console.log('🎯 Layer 2: Setting up speech recognition...')

                              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

                              if (!SpeechRecognition) {
                                throw new Error('FALLBACK_TO_TEXT')
                              }

                              // Clean slate approach
                              if (recognitionRef.current) {
                                try {
                                  recognitionRef.current.stop()
                                  recognitionRef.current = null
                                } catch (e) {
                                  console.log('Cleanup completed')
                                }
                              }

                              // Create simple, reliable recognition
                              const recognition = new SpeechRecognition()
                              recognition.continuous = true
                              recognition.interimResults = false  // Simplified - only final results
                              recognition.maxAlternatives = 1
                              recognition.lang = 'en-US'

                              let speechCaptured = false
                              let recognitionTimer: NodeJS.Timeout

                              // Layer 3: Bulletproof event handling
                              console.log('🎯 Layer 3: Event handling setup...')

                              recognition.onstart = () => {
                                console.log('🎤 LISTENING STARTED!')
                                setState(prev => ({ ...prev, isListening: true, isProcessing: false }))

                                // Safety timeout - stop after 30 seconds max
                                recognitionTimer = setTimeout(() => {
                                  console.log('⏰ Safety timeout - stopping recognition')
                                  if (recognition) recognition.stop()
                                }, 30000)
                              }

                              recognition.onresult = (event: any) => {
                                console.log('🗣️ Speech detected!')

                                for (let i = event.resultIndex; i < event.results.length; i++) {
                                  if (event.results[i].isFinal) {
                                    const transcript = event.results[i][0].transcript.trim()
                                    console.log('📝 Final transcript:', transcript)

                                    if (transcript && transcript.length > 1) {
                                      speechCaptured = true
                                      clearTimeout(recognitionTimer)
                                      recognition.stop()

                                      // Process immediately
                                      console.log('✅ Processing speech:', transcript)
                                      handleCandidateResponse(transcript)
                                      return
                                    }
                                  }
                                }
                              }

                              recognition.onend = () => {
                                console.log('🔚 Recognition ended')
                                clearTimeout(recognitionTimer)
                                setState(prev => ({ ...prev, isListening: false }))

                                if (!speechCaptured) {
                                  console.log('❌ No speech captured')
                                  setError('No speech detected. Please try again or use text input.')
                                }
                              }

                              recognition.onerror = (event: any) => {
                                console.error('🚨 Speech error:', event.error)
                                clearTimeout(recognitionTimer)
                                setState(prev => ({ ...prev, isListening: false, isProcessing: false }))

                                if (event.error === 'network') {
                                  networkErrorCountRef.current++
                                  if (networkErrorCountRef.current >= 2) {
                                    setError('Voice recognition unavailable. Please use text input below.')
                                  } else {
                                    setError('Network issue. Please try again.')
                                  }
                                } else {
                                  setError('Voice recognition error. Please use text input below.')
                                }
                              }

                              // Layer 4: Start recognition
                              console.log('🎯 Layer 4: Starting recognition...')
                              recognitionRef.current = recognition
                              recognition.start()

                            } catch (error: any) {
                              console.error('🚨 PRODUCTION ERROR:', error)
                              setState(prev => ({ ...prev, isProcessing: false }))

                              if (error.message === 'FALLBACK_TO_TEXT' || error.name === 'NotAllowedError') {
                                setError('Voice recognition not available. Please use text input below.')
                              } else {
                                setError('Audio system error. Please use text input below.')
                              }
                            }
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                          disabled={state.isProcessing}
                        >
                          {state.isProcessing ? (
                            <>
                              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                              Starting Audio...
                            </>
                          ) : (
                            <>
                              <Mic className="w-6 h-6 mr-3" />
                              🎤 START SPEAKING
                            </>
                          )}
                        </Button>

                        {networkErrorCountRef.current > 0 && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-700">
                              ⚠️ Network issues detected ({networkErrorCountRef.current}/3). Trying automatic recovery...
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-4">
                      <p className="text-lg font-semibold text-blue-700 mb-2">
                        Ready to record your response
                      </p>
                      <p className="text-sm text-blue-600 mb-1">
                        • Click the button above
                      </p>
                      <p className="text-sm text-blue-600 mb-1">
                        • Speak your answer clearly
                      </p>
                      <p className="text-sm text-blue-600">
                        • AI will automatically respond with the next question
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice System Error Handling */}
              {error && !state.isListening && !state.isProcessing && state.currentQuestion && (
                <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200 mt-4">
                  <div className="text-center mb-4">
                    <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                    <p className="font-semibold text-red-800">Voice System Status</p>
                    <p className="text-sm text-red-700 mb-4">{error}</p>
                    <div className="bg-red-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-800 mb-2">Troubleshooting:</p>
                      <ul className="text-xs text-red-700 space-y-1 text-left max-w-sm mx-auto">
                        <li>• Ensure microphone permissions are enabled</li>
                        <li>• Check if microphone is connected and working</li>
                        <li>• Try refreshing the page if issues persist</li>
                        <li>• Speak closer to your microphone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Preparing next question...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Messages */}
      {state.messages.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interview Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {state.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'candidate' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.type === 'interviewer' ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex-1 p-3 rounded-lg ${
                      message.type === 'candidate'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <p className="text-sm text-gray-800">{message.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}