"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import {
  UserProfile,
  InterviewConfig,
  InterviewSession,
  Question,
  Response,
  AudioState,
  InterviewMetrics,
  InterviewFeedback
} from "./types"

// Import components
import SetupView from "./components/SetupView"
import InterviewView from "./components/InterviewView"
import ResultsView from "./components/ResultsView"

export default function AudioInterviewPage() {
  const router = useRouter()
  const { supabase, user, loading: authLoading } = useSupabase()
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // State
  const [currentView, setCurrentView] = useState<'setup' | 'interview' | 'results'>('setup')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  
  const [config, setConfig] = useState<InterviewConfig>({
    company: '',
    position: '',
    department: '',
    jobDescription: '',
    requirements: '',
    experienceLevel: 'mid',
    interviewType: 'mixed',
    interviewFocus: [],
    duration: 30,
    difficulty: 'medium'
  })
  
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    isPaused: false,
    isProcessing: false,
    isSpeaking: false,
    audioLevel: 0,
    recordingTime: 0,
    currentTranscript: '',
    interimTranscript: ''
  })
  
  const [metrics, setMetrics] = useState<InterviewMetrics>({
    overallProgress: 0,
    responseQuality: 0,
    averageResponseTime: 0,
    keywordsMatched: 0,
    confidenceLevel: 0,
    engagementScore: 0
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  // Initialize
  useEffect(() => {
    if (!authLoading && user) {
      loadUserProfile()
      initializeSpeechRecognition()
    } else if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/interview/audio')
    }
    
    return () => {
      cleanup()
    }
  }, [authLoading, user])
  
  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }
  
  const loadUserProfile = async () => {
    try {
      // Use the user from context which is already authenticated
      if (!user) {
        console.log('No authenticated user, redirecting to signin')
        router.push('/auth/signin?redirect=/interview/audio')
        return
      }
      
      // First try to get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      // Fetch user attempts with error handling
      const { data: attempts, error: attemptsError } = await supabase
        .from('practice_attempts')
        .select('question_id, score')
        .eq('user_id', user.id)
      
      if (attemptsError && attemptsError.code !== '42P01') {
        console.error('Error fetching attempts:', attemptsError)
      }
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError)
      }
      
      // If profile doesn't exist, create one
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            username: user.email?.split('@')[0] || 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating profile:', createError)
        }
        
        setUserProfile({
          id: user.id,
          name: newProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: newProfile?.avatar_url || user.user_metadata?.avatar_url
        })
      } else {
        setUserProfile({
          id: user.id,
          name: profile.full_name || profile.username || user.email?.split('@')[0] || 'User',
          email: user.email || profile.email || '',
          avatar: profile.avatar_url
        })
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
      // Redirect to login on error
      router.push('/auth/signin?redirect=/interview/audio')
    }
  }
  
  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        setAudioState(prev => ({
          ...prev,
          currentTranscript: prev.currentTranscript + finalTranscript,
          interimTranscript
        }))
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }
    }
  }
  
  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!config.company.trim()) {
      newErrors.company = 'Company name is required'
    }
    if (!config.position.trim()) {
      newErrors.position = 'Position is required'
    }
    if (!config.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required'
    }
    if (config.interviewFocus.length === 0) {
      newErrors.focus = 'Select at least one interview focus area'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const startInterview = async () => {
    if (!validateConfig() || !userProfile) return
    
    setLoading(true)
    setErrors({})
    
    try {
      const sessionId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const response = await fetch('/api/audio-interview/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: userProfile.id,
          userName: userProfile.name,
          config,
          systemPrompt: generateSystemPrompt()
        })
      })
      
      if (!response.ok) throw new Error('Failed to initialize interview')
      
      const data = await response.json()
      
      const newSession: InterviewSession = {
        id: sessionId,
        userId: userProfile.id,
        config,
        status: 'active',
        currentStage: 'intro',
        startedAt: new Date().toISOString(),
        totalQuestions: Math.ceil(config.duration / 3),
        answeredQuestions: 0
      }
      
      setSession(newSession)
      setCurrentQuestion(data.firstQuestion)
      setCurrentView('interview')
      
      await speakQuestion(data.firstQuestion.text)
      
    } catch (error) {
      console.error('Error starting interview:', error)
      setErrors({ general: 'Failed to start interview. Please try again.' })
    } finally {
      setLoading(false)
    }
  }
  
  const generateSystemPrompt = (): string => {
    return `You are an expert interviewer conducting a ${config.interviewType} interview for the position of ${config.position} at ${config.company}.
    
    Candidate: ${userProfile?.name}
    Experience Level: ${config.experienceLevel}
    Department: ${config.department}
    Duration: ${config.duration} minutes
    Difficulty: ${config.difficulty}
    
    Job Description: ${config.jobDescription}
    Requirements: ${config.requirements}
    Focus Areas: ${config.interviewFocus.join(', ')}
    
    Guidelines:
    1. Ask questions appropriate for ${config.experienceLevel} level
    2. Focus on ${config.interviewFocus.join(', ')}
    3. Maintain ${config.difficulty} difficulty throughout
    4. Provide constructive and encouraging tone
    5. Ask follow-up questions based on responses
    6. Evaluate for technical skills, problem-solving, and cultural fit
    7. Keep questions concise and clear for audio format`
  }
  
  const speakQuestion = async (text: string) => {
    setAudioState(prev => ({ ...prev, isSpeaking: true }))
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onend = () => {
        setAudioState(prev => ({ ...prev, isSpeaking: false }))
      }
      
      window.speechSynthesis.speak(utterance)
    } else {
      setAudioState(prev => ({ ...prev, isSpeaking: false }))
    }
  }
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      visualizeAudio()
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        processAudioResponse(audioBlob)
      }
      
      mediaRecorderRef.current.start()
      
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      
      setAudioState(prev => ({
        ...prev,
        isRecording: true,
        currentTranscript: '',
        interimTranscript: '',
        recordingTime: 0
      }))
      
      startRecordingTimer()
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setErrors({ recording: 'Failed to access microphone' })
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    
    setAudioState(prev => ({
      ...prev,
      isRecording: false,
      audioLevel: 0
    }))
  }
  
  const visualizeAudio = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    const normalizedLevel = Math.min(100, (average / 128) * 100)
    
    setAudioState(prev => ({ ...prev, audioLevel: normalizedLevel }))
    
    animationFrameRef.current = requestAnimationFrame(visualizeAudio)
  }
  
  const startRecordingTimer = () => {
    recordingTimerRef.current = setInterval(() => {
      setAudioState(prev => {
        if (!prev.isRecording) {
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current)
          }
          return prev
        }
        return { ...prev, recordingTime: prev.recordingTime + 1 }
      })
    }, 1000)
  }
  
  const processAudioResponse = async (audioBlob: Blob) => {
    if (!session || !currentQuestion) {
      console.error('Missing session or question')
      setErrors({ processing: 'Session expired. Please refresh the page.' })
      return
    }
    
    setAudioState(prev => ({ ...prev, isProcessing: true }))
    
    try {
      const transcript = audioState.currentTranscript
      
      if (!transcript || transcript.trim().length < 10) {
        setErrors({ processing: 'Response too short. Please provide a more detailed answer.' })
        setAudioState(prev => ({ ...prev, isProcessing: false }))
        return
      }
      
      const response = await fetch('/api/audio-interview/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: currentQuestion.id,
          transcript,
          questionText: currentQuestion.text,
          stage: session.currentStage,
          responseNumber: responses.length + 1
        })
      })
      
      if (!response.ok) throw new Error('Failed to process response')
      
      const data = await response.json()
      
      const newResponse: Response = {
        id: data.responseId,
        questionId: currentQuestion.id,
        transcript,
        duration: audioState.recordingTime,
        timestamp: new Date().toISOString(),
        analysis: data.analysis
      }
      
      setResponses(prev => [...prev, newResponse])
      updateMetrics(data.analysis)
      
      const updatedSession = {
        ...session,
        answeredQuestions: session.answeredQuestions + 1,
        currentStage: data.nextStage || session.currentStage
      }
      setSession(updatedSession)
      
      if (updatedSession.answeredQuestions >= updatedSession.totalQuestions || data.isComplete) {
        await completeInterview()
      } else {
        setCurrentQuestion(data.nextQuestion)
        await speakQuestion(data.nextQuestion.text)
      }
      
    } catch (error) {
      console.error('Error processing response:', error)
      setErrors({ processing: 'Failed to process response' })
    } finally {
      setAudioState(prev => ({ 
        ...prev, 
        isProcessing: false,
        currentTranscript: '',
        interimTranscript: '',
        recordingTime: 0
      }))
    }
  }
  
  const updateMetrics = (analysis: any) => {
    setMetrics(prev => {
      const totalResponses = responses.length + 1
      return {
        overallProgress: ((session?.answeredQuestions || 0) + 1) / (session?.totalQuestions || 1) * 100,
        responseQuality: (prev.responseQuality * responses.length + analysis.score) / totalResponses,
        averageResponseTime: (prev.averageResponseTime * responses.length + audioState.recordingTime) / totalResponses,
        keywordsMatched: prev.keywordsMatched + analysis.keywords.length,
        confidenceLevel: (prev.confidenceLevel * responses.length + analysis.confidence) / totalResponses,
        engagementScore: (prev.engagementScore * responses.length + (analysis.relevance + analysis.depth) / 2) / totalResponses
      }
    })
  }
  
  const completeInterview = async () => {
    if (!session) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/audio-interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          responses,
          metrics,
          config
        })
      })
      
      if (!response.ok) throw new Error('Failed to complete interview')
      
      const data = await response.json()
      
      setFeedback(data.feedback)
      setSession(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date().toISOString()
      } : null)
      
      setCurrentView('results')
      
    } catch (error) {
      console.error('Error completing interview:', error)
      setErrors({ complete: 'Failed to generate results' })
    } finally {
      setLoading(false)
    }
  }
  
  const pauseInterview = () => {
    setSession(prev => prev ? { ...prev, status: 'paused' } : null)
  }
  
  const skipQuestion = async () => {
    if (!session) return
    
    const updatedSession = {
      ...session,
      answeredQuestions: session.answeredQuestions + 1
    }
    setSession(updatedSession)
    
    if (updatedSession.answeredQuestions >= updatedSession.totalQuestions) {
      await completeInterview()
    }
  }
  
  const restartInterview = () => {
    setCurrentView('setup')
    setSession(null)
    setCurrentQuestion(null)
    setResponses([])
    setFeedback(null)
    setMetrics({
      overallProgress: 0,
      responseQuality: 0,
      averageResponseTime: 0,
      keywordsMatched: 0,
      confidenceLevel: 0,
      engagementScore: 0
    })
  }
  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if not authenticated
  if (!user) {
    return null // Middleware will handle redirect
  }
  
  // Render based on current view
  if (currentView === 'setup') {
    return (
      <SetupView
        userProfile={userProfile}
        config={config}
        setConfig={setConfig}
        errors={errors}
        loading={loading}
        onStartInterview={startInterview}
      />
    )
  }
  
  if (currentView === 'interview') {
    return (
      <InterviewView
        session={session}
        currentQuestion={currentQuestion}
        responses={responses}
        audioState={audioState}
        metrics={metrics}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onPauseInterview={pauseInterview}
        onSkipQuestion={skipQuestion}
      />
    )
  }
  
  if (currentView === 'results') {
    return (
      <ResultsView
        session={session}
        responses={responses}
        feedback={feedback}
        metrics={metrics}
        onRestartInterview={restartInterview}
      />
    )
  }
  
  return null
}
