"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Building,
  Target,
  FileText,
  Download,
  ArrowRight,
  Clock,
  Activity
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// Type definitions
interface UserProfile {
  id: string
  name: string
  email: string
}

interface InterviewFormData {
  company: string
  position: string
  jobDescription: string
  experience: 'entry' | 'mid' | 'senior' | 'lead'
  interviewType: 'technical' | 'behavioral' | 'mixed'
  duration: '15' | '30' | '45' | '60'
}

interface InterviewSession {
  id: string
  user_id: string
  user_name: string
  company: string
  position: string
  job_description: string
  experience: string
  interview_type: string
  status: 'active' | 'completed' | 'paused'
  stage: 'introduction' | 'technical' | 'behavioral' | 'situational' | 'closing'
  started_at: string
  ended_at?: string
  current_question_index: number
  total_questions: number
  feedback_summary?: any
}

interface InterviewResponse {
  id: string
  interview_id: string
  question: string
  answer: string
  analysis: {
    relevance: number
    clarity: number
    depth: number
    confidence: number
    keywords_mentioned: string[]
    follow_up_needed: boolean
  }
  timestamp: string
  stage: string
  response_time: number
}

interface InterviewState {
  isRecording: boolean
  isProcessing: boolean
  isSpeaking: boolean
  isListening: boolean
  currentTranscript: string
  interimTranscript: string
  currentQuestion: string
  responses: InterviewResponse[]
  stage: string
  progress: number
  audioLevel: number
  recordingDuration: number
}

interface FeedbackData {
  overall_score: number
  communication_score: number
  technical_score: number
  behavioral_score: number
  strengths: string[]
  improvements: string[]
  detailed_analysis: string
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire'
  next_steps: string[]
}

export default function VoiceInterviewPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const recognitionRef = useRef<any>(null)
  
  // User and Session State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState<InterviewFormData>({
    company: '',
    position: '',
    jobDescription: '',
    experience: 'entry',
    interviewType: 'mixed',
    duration: '30'
  })
  const [showForm, setShowForm] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Interview State
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    isListening: false,
    currentTranscript: '',
    interimTranscript: '',
    currentQuestion: '',
    responses: [],
    stage: 'introduction',
    progress: 0,
    audioLevel: 0,
    recordingDuration: 0
  })
  
  // Feedback State
  const [feedback, setFeedback] = useState<any>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  
  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
  }, [])
  
  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Initialize Web Speech API if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('')
          
          setInterviewState(prev => ({
            ...prev,
            currentTranscript: transcript
          }))
        }
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.')
          }
        }
      }
    }
  }, [])
  
  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user profile from database
        const { data: profile, error } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error loading profile:', error)
          // Fallback to auth user data
          setUserProfile({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || ''
          })
        } else {
          setUserProfile(profile)
        }
      } else {
        // For demo/testing without auth
        setUserProfile({
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com'
        })
      }
    } catch (err) {
      console.error('Error loading user:', err)
      // Fallback for demo
      setUserProfile({
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.company.trim()) {
      errors.company = 'Company name is required'
    }
    if (!formData.position.trim()) {
      errors.position = 'Position is required'
    }
    if (!formData.jobDescription.trim()) {
      errors.jobDescription = 'Job description is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const startInterview = async () => {
    if (!userProfile || !validateForm()) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Generate AI context based on form data
      const aiContext = {
        user_id: userProfile.id,
        user_name: userProfile.name,
        company: formData.company,
        position: formData.position,
        job_description: formData.jobDescription,
        experience: formData.experience,
        interview_type: formData.interviewType,
        duration: parseInt(formData.duration),
        system_prompt: generateSystemPrompt(formData)
      }
      
      // Initialize interview session
      const response = await fetch('/api/voice-interview/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiContext)
      })
      
      if (!response.ok) {
        throw new Error('Failed to initialize interview')
      }
      
      const data = await response.json()
      
      // Create session object
      const newSession: InterviewSession = {
        id: data.session_id,
        user_id: userProfile.id,
        user_name: userProfile.name,
        company: formData.company,
        position: formData.position,
        job_description: formData.jobDescription,
        experience: formData.experience,
        interview_type: formData.interviewType,
        status: 'active',
        stage: 'introduction',
        started_at: new Date().toISOString(),
        current_question_index: 0,
        total_questions: data.total_questions || 10
      }
      
      setSession(newSession)
      setInterviewState(prev => ({
        ...prev,
        currentQuestion: data.first_question,
        stage: 'introduction',
        progress: 0
      }))
      
      setShowForm(false)
      
      // Speak the first question
      await speakText(data.first_question)
      
    } catch (err) {
      console.error('Error starting interview:', err)
      setError('Failed to start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const generateSystemPrompt = (formData: InterviewFormData): string => {
    return `You are conducting a professional ${formData.interviewType} interview for the position of ${formData.position} at ${formData.company}. 
    The candidate has ${formData.experience} level experience. 
    Job Description: ${formData.jobDescription}
    
    Interview Guidelines:
    1. Ask relevant questions based on the job description and candidate's experience level
    2. Follow up on candidate's responses with deeper questions when appropriate
    3. Evaluate responses for relevance, clarity, depth, and technical accuracy
    4. Maintain a professional and encouraging tone
    5. Adapt difficulty based on candidate's responses
    6. Focus on practical scenarios and real-world applications
    7. Duration: ${formData.duration} minutes
    
    Generate questions that assess both technical competence and cultural fit.
    Provide constructive feedback and identify strengths and areas for improvement.`
  }
  
  const startRecording = async () => {
    try {
      setInterviewState(prev => ({ ...prev, isRecording: true, currentTranscript: '' }))
      
      // Try Web Speech API first
      if (recognitionRef.current) {
        recognitionRef.current.start()
      } else {
        // Fallback to MediaRecorder
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }
        
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          await processAudio(audioBlob)
        }
        
        mediaRecorderRef.current.start()
      }
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone')
      setInterviewState(prev => ({ ...prev, isRecording: false }))
    }
  }
  
  const stopRecording = async () => {
    setInterviewState(prev => ({ ...prev, isRecording: false }))
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      // Process the transcript
      if (interviewState.currentTranscript) {
        await processTranscript(interviewState.currentTranscript)
      }
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }
  
  const processAudio = async (audioBlob: Blob) => {
    if (!session) return
    
    try {
      setInterviewState(prev => ({ ...prev, isProcessing: true }))
      
      // If we have a transcript from Web Speech API, use it
      if (interviewState.currentTranscript) {
        await processTranscript(interviewState.currentTranscript)
      } else {
        // Otherwise, send audio for transcription
        const formData = new FormData()
        formData.append('audio', audioBlob)
        formData.append('session_id', session.id)
        
        const response = await fetch('/api/voice-interview/process-audio', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to process audio')
        }
        
        const data = await response.json()
        
        if (data.transcript) {
          await processTranscript(data.transcript)
        } else {
          throw new Error('No transcript generated')
        }
      }
      
    } catch (err) {
      console.error('Error processing audio:', err)
      setError('Failed to process your audio. Please ensure your microphone is working.')
    } finally {
      setInterviewState(prev => ({ ...prev, isProcessing: false }))
    }
  }
  
  const processTranscript = async (transcript: string) => {
    if (!session || !transcript.trim()) return
    
    try {
      setInterviewState(prev => ({ ...prev, isProcessing: true }))
      
      const startTime = Date.now()
      
      const response = await fetch('/api/voice-interview/process-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          transcript: transcript,
          stage: interviewState.stage,
          previous_question: interviewState.currentQuestion
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process response')
      }
      
      const data = await response.json()
      data.response_time = Date.now() - startTime
      
      await handleInterviewResponse(data)
      
    } catch (err) {
      console.error('Error processing transcript:', err)
      setError('Failed to process your response. Please try again.')
    } finally {
      setInterviewState(prev => ({ ...prev, isProcessing: false }))
    }
  }
  
  const handleInterviewResponse = async (data: any) => {
    // Update responses
    const newResponse: InterviewResponse = {
      id: data.response_id || `resp_${Date.now()}`,
      interview_id: session!.id,
      question: interviewState.currentQuestion,
      answer: data.transcript,
      analysis: data.analysis || {
        relevance: 0,
        clarity: 0,
        depth: 0,
        confidence: 0,
        keywords_mentioned: [],
        follow_up_needed: false
      },
      timestamp: new Date().toISOString(),
      stage: interviewState.stage,
      response_time: data.response_time || 0
    }
    
    setInterviewState(prev => ({
      ...prev,
      responses: [...prev.responses, newResponse],
      currentQuestion: data.next_question,
      stage: data.stage,
      progress: data.progress
    }))
    
    // Check if interview is complete
    if (data.stage === 'completed') {
      await completeInterview()
    } else {
      // Speak next question
      await speakText(data.next_question)
    }
  }
  
  const speakText = async (text: string) => {
    try {
      setInterviewState(prev => ({ ...prev, isSpeaking: true }))
      
      // Try browser TTS first
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        await new Promise<void>((resolve) => {
          utterance.onend = () => resolve()
          speechSynthesis.speak(utterance)
        })
      } else {
        // Fallback to backend TTS
        const response = await fetch('/api/voice-interview/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
        
        if (response.ok) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          await new Promise<void>((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl)
              resolve()
            }
            audio.play()
          })
        }
      }
    } catch (err) {
      console.error('Error speaking text:', err)
    } finally {
      setInterviewState(prev => ({ ...prev, isSpeaking: false }))
    }
  }
  
  const completeInterview = async () => {
    if (!session) return
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/voice-interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          responses: interviewState.responses
        })
      })
      
      if (!response.ok) throw new Error('Failed to complete interview')
      
      const data = await response.json()
      
      setFeedback(data.feedback)
      setShowFeedback(true)
      
    } catch (err) {
      console.error('Error completing interview:', err)
      setError('Failed to generate feedback')
    } finally {
      setLoading(false)
    }
  }
  
  const exportPDF = async () => {
    if (!feedback || !session) return
    
    try {
      const response = await fetch('/api/voice-interview/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          feedback: feedback
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `interview-feedback-${session.id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Error exporting PDF:', err)
      setError('Failed to export PDF')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  // Show feedback screen
  if (showFeedback && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Interview Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">
                  {feedback.overall_score}/10
                </div>
                <p className="text-muted-foreground mt-2">Overall Performance</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold">
                    {feedback.communication_clarity}/10
                  </div>
                  <p className="text-sm text-muted-foreground">Communication</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">
                    {feedback.confidence}/10
                  </div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">
                    {feedback.technical_understanding}/10
                  </div>
                  <p className="text-sm text-muted-foreground">Technical</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">
                    {feedback.problem_solving}/10
                  </div>
                  <p className="text-sm text-muted-foreground">Problem Solving</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Strengths</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.strengths?.map((strength: string, i: number) => (
                      <li key={i} className="text-sm">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.improvements?.map((improvement: string, i: number) => (
                      <li key={i} className="text-sm">{improvement}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">{feedback.summary}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={exportPDF} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => router.push('/interview')} className="flex-1">
                  Back to Interviews
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Show interview form
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Voice Interview Setup</CardTitle>
              <CardDescription>
                Configure your interview parameters for a personalized experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <User className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Welcome, {userProfile?.name}!</p>
                  <p className="text-sm text-muted-foreground">Complete the form below to start your interview</p>
                </div>
              </div>
              
              <div className="grid gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      placeholder="Enter the company name"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className={formErrors.company ? 'border-red-500' : ''}
                    />
                    {formErrors.company && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.company}</p>
                    )}
                  </div>
                </div>
                
                {/* Position Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Position Details
                  </h3>
                  
                  <div>
                    <Label htmlFor="position">Job Title *</Label>
                    <Input
                      id="position"
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className={formErrors.position ? 'border-red-500' : ''}
                    />
                    {formErrors.position && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.position}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="jobDescription">Job Description *</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste or type the job description here. This helps AI ask relevant questions."
                      value={formData.jobDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                      className={`min-h-[120px] ${formErrors.jobDescription ? 'border-red-500' : ''}`}
                    />
                    {formErrors.jobDescription && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.jobDescription}</p>
                    )}
                  </div>
                </div>
                
                {/* Interview Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Interview Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value: 'entry' | 'mid' | 'senior' | 'lead') => 
                          setFormData(prev => ({ ...prev, experience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (5+ years)</SelectItem>
                          <SelectItem value="lead">Lead (8+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="interviewType">Interview Type</Label>
                      <Select
                        value={formData.interviewType}
                        onValueChange={(value: 'technical' | 'behavioral' | 'mixed') => 
                          setFormData(prev => ({ ...prev, interviewType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={formData.duration}
                        onValueChange={(value: '15' | '30' | '45' | '60') => 
                          setFormData(prev => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={startInterview} 
                disabled={!formData.company || !formData.position || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Voice Interview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Main interview interface
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Interview Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Voice Interview in Progress</CardTitle>
                <CardDescription>
                  {session?.company} - {session?.position}
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">{interviewState.stage}</Badge>
                <p className="text-sm text-muted-foreground">
                  Question {interviewState.responses.length + 1} of {session?.total_questions || 10}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={interviewState.progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(interviewState.progress)}% Complete
            </p>
          </CardContent>
        </Card>
        
        {/* Current Question */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Current Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-lg leading-relaxed">{interviewState.currentQuestion}</p>
            </div>
            {interviewState.isSpeaking && (
              <div className="flex items-center gap-2 mt-4 text-sm text-primary">
                <Volume2 className="h-4 w-4 animate-pulse" />
                AI is speaking...
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recording Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Your Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live Transcript */}
            <div className="min-h-[100px] p-4 bg-muted rounded-lg">
              {interviewState.currentTranscript || interviewState.interimTranscript ? (
                <div>
                  <p className="text-sm font-medium mb-2">Live Transcript:</p>
                  <p className="text-base">
                    {interviewState.currentTranscript}
                    <span className="text-muted-foreground">{interviewState.interimTranscript}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {interviewState.isRecording 
                    ? 'Listening... Please speak clearly into your microphone'
                    : 'Click the button below to start recording your response'}
                </p>
              )}
            </div>
            
            {/* Audio Level Indicator */}
            {interviewState.isRecording && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm">Audio Level</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${interviewState.audioLevel}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Recording Button */}
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                variant={interviewState.isRecording ? "danger" : "primary"}
                onClick={interviewState.isRecording ? stopRecording : startRecording}
                disabled={interviewState.isProcessing || interviewState.isSpeaking}
                className="w-56 h-14 text-lg"
              >
                {interviewState.isProcessing ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : interviewState.isRecording ? (
                  <>
                    <MicOff className="h-6 w-6 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {interviewState.isRecording && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse" />
                  Recording: {Math.floor(interviewState.recordingDuration / 60)}:{String(interviewState.recordingDuration % 60).padStart(2, '0')}
                </div>
              )}
            </div>
            
            {interviewState.isRecording && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                  Recording in progress...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Previous Responses */}
        {interviewState.responses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {interviewState.responses.map((response, index) => (
                  <div key={response.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {response.stage}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Question {index + 1}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{response.question}</p>
                    <p className="text-sm text-muted-foreground">{response.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
