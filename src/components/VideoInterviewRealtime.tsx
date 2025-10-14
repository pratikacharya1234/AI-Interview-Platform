'use client'

/**
 * Real-Time Voice Interview Component
 * - Listens to user audio in real-time
 * - Uses Gemini AI for transcription and responses
 * - Uses ElevenLabs for natural voice
 * - Saves complete interview data to Supabase
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mic, 
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle,
  AlertCircle,
  PhoneOff,
  User,
  Bot,
  Clock
} from 'lucide-react'

interface Message {
  id: string
  role: 'interviewer' | 'candidate'
  content: string
  timestamp: Date
  audioUrl?: string
}

interface InterviewSession {
  id: string
  userId: string
  userEmail: string
  startTime: Date
  endTime?: Date
  duration: number
  messages: Message[]
  status: 'active' | 'completed' | 'cancelled'
  position: string
  company: string
}

export default function VideoInterviewRealtime() {
  const router = useRouter()
  const { data: session } = useSession()
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // State
  const [interviewState, setInterviewState] = useState<'setup' | 'active' | 'completed'>('setup')
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [currentTranscript, setCurrentTranscript] = useState<string>('')
  const [questionCount, setQuestionCount] = useState(0)
  
  // Interview configuration
  const [position] = useState('Software Developer')
  const [company] = useState('Tech Company')
  const maxQuestions = 6

  /**
   * Initialize media devices (camera and microphone)
   */
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 }
        }
      })

      mediaStreamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Initialize audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      return true
    } catch (err: any) {
      console.error('Media initialization error:', err)
      setError(`Failed to access camera/microphone: ${err.message}`)
      return false
    }
  }, [])

  /**
   * Start the interview
   */
  const startInterview = useCallback(async () => {
    const mediaReady = await initializeMedia()
    if (!mediaReady) return

    const newSessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    setStartTime(new Date())
    setInterviewState('active')
    setQuestionCount(0)

    // Start with greeting
    const greeting = `Hello! I'm Sarah, your AI interviewer. Welcome to your interview for the ${position} position at ${company}. Let's begin. Please tell me about yourself and your background.`
    
    const greetingMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'interviewer',
      content: greeting,
      timestamp: new Date()
    }
    
    setMessages([greetingMessage])
    setQuestionCount(1)
    
    // Speak greeting
    await speakText(greeting)
    
    // Start listening for response
    setTimeout(() => {
      startListening()
    }, 1000)
    
  }, [position, company])

  /**
   * Start recording user's audio
   */
  const startListening = useCallback(async () => {
    if (!mediaStreamRef.current || isRecording) return

    try {
      setIsRecording(true)
      setError(null)
      audioChunksRef.current = []

      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType,
        audioBitsPerSecond: 128000
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      console.log('🎤 Started recording')

      // Auto-stop after 30 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        stopListening()
      }, 30000)

    } catch (err: any) {
      console.error('Recording error:', err)
      setError(`Failed to start recording: ${err.message}`)
      setIsRecording(false)
    }
  }, [isRecording])

  /**
   * Stop recording and process audio
   */
  const stopListening = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) return

    try {
      setIsRecording(false)
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }

      // Stop recording
      mediaRecorderRef.current.stop()
      
      // Wait for all data to be collected
      await new Promise(resolve => setTimeout(resolve, 300))

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      console.log('🎤 Stopped recording, blob size:', audioBlob.size)

      if (audioBlob.size < 1000) {
        setError('Recording too short. Please speak longer.')
        setTimeout(() => startListening(), 2000)
        return
      }

      // Process the audio
      await processAudio(audioBlob)

    } catch (err: any) {
      console.error('Stop recording error:', err)
      setError(`Failed to process recording: ${err.message}`)
      setIsProcessing(false)
    }
  }, [isRecording])

  /**
   * Process audio: transcribe and get AI response
   */
  const processAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true)
    setCurrentTranscript('')

    try {
      // 1. Transcribe audio
      console.log('🎯 Transcribing audio...')
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', 'en-US')

      const transcribeResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      })

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed')
      }

      const transcribeData = await transcribeResponse.json()
      const transcript = transcribeData.transcript

      if (!transcript || transcript.length < 3) {
        setError('No speech detected. Please try again.')
        setIsProcessing(false)
        setTimeout(() => startListening(), 2000)
        return
      }

      console.log('✅ Transcript:', transcript)
      setCurrentTranscript(transcript)

      // Add candidate message
      const candidateMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'candidate',
        content: transcript,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, candidateMessage])

      // 2. Get AI response
      console.log('🧠 Getting AI response...')
      const conversationHistory = [...messages, candidateMessage].map(msg => ({
        role: msg.role === 'candidate' ? 'user' : 'assistant',
        content: msg.content
      }))

      const aiResponse = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          conversationHistory,
          interviewContext: {
            position,
            company,
            currentQuestion: questionCount,
            totalQuestions: maxQuestions
          }
        })
      })

      if (!aiResponse.ok) {
        throw new Error('AI response failed')
      }

      const aiData = await aiResponse.json()
      const aiText = aiData.response

      console.log('✅ AI Response:', aiText)

      // Add interviewer message
      const interviewerMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'interviewer',
        content: aiText,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, interviewerMessage])
      setQuestionCount(prev => prev + 1)
      setIsProcessing(false)

      // 3. Speak AI response
      await speakText(aiText)

      // 4. Continue or end interview
      if (questionCount >= maxQuestions) {
        await endInterview()
      } else {
        setTimeout(() => startListening(), 1000)
      }

    } catch (err: any) {
      console.error('Process audio error:', err)
      setError(`Failed to process response: ${err.message}`)
      setIsProcessing(false)
      
      // Retry listening
      setTimeout(() => startListening(), 3000)
    }
  }, [messages, questionCount, position, company, maxQuestions])

  /**
   * Speak text using ElevenLabs
   */
  const speakText = useCallback(async (text: string) => {
    setIsSpeaking(true)

    try {
      console.log('🔊 Generating speech...')
      
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'Rachel'
        })
      })

      if (!response.ok) {
        throw new Error('TTS failed')
      }

      const audioData = await response.arrayBuffer()

      // Play audio
      if (audioContextRef.current) {
        const audioBuffer = await audioContextRef.current.decodeAudioData(audioData)
        
        // Stop current audio if playing
        if (currentAudioSourceRef.current) {
          currentAudioSourceRef.current.stop()
        }

        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)
        
        currentAudioSourceRef.current = source

        await new Promise<void>((resolve) => {
          source.onended = () => {
            setIsSpeaking(false)
            resolve()
          }
          source.start()
        })
      }

    } catch (err: any) {
      console.error('Speech error:', err)
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }, [])

  /**
   * End interview and save to database
   */
  const endInterview = useCallback(async () => {
    setInterviewState('completed')
    setIsRecording(false)
    setIsProcessing(false)

    // Stop media
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }

    if (!session?.user?.email || !startTime) return

    try {
      // Save to Supabase
      const interviewData: InterviewSession = {
        id: sessionId,
        userId: session.user.email,
        userEmail: session.user.email,
        startTime,
        endTime: new Date(),
        duration: Math.round((Date.now() - startTime.getTime()) / 1000),
        messages,
        status: 'completed',
        position,
        company
      }

      const response = await fetch('/api/interview/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to feedback page
        router.push(`/interview/feedback?id=${data.interviewId}`)
      }

    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save interview. Please try again.')
    }
  }, [session, sessionId, startTime, messages, position, company, router])

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => {
      const newState = !prev
      if (mediaStreamRef.current) {
        const videoTrack = mediaStreamRef.current.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.enabled = newState
        }
      }
      return newState
    })
  }, [])

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
    }
  }, [])

  // Render setup screen
  if (interviewState === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Video Interview Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Position: {position}</p>
                    <p className="text-sm text-muted-foreground">Company: {company}</p>
                  </div>
                </div>
                <Badge>~15 minutes</Badge>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This interview will use your camera and microphone. The AI will listen to your responses in real-time and ask follow-up questions.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={startInterview} 
                className="w-full"
                size="lg"
              >
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render active interview
  if (interviewState === 'active') {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status Indicators */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Mic className="h-3 w-3 mr-1" />
                        Recording
                      </Badge>
                    )}
                    {isProcessing && (
                      <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    )}
                    {isSpeaking && (
                      <Badge className="bg-green-600">
                        <Volume2 className="h-3 w-3 mr-1" />
                        AI Speaking
                      </Badge>
                    )}
                  </div>

                  {/* Question Counter */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-white">
                      Question {questionCount}/{maxQuestions}
                    </Badge>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    variant={isVideoEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant={isMuted ? "destructive" : "default"}
                    size="icon"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="icon"
                    onClick={isRecording ? stopListening : startListening}
                    disabled={isProcessing || isSpeaking}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={endInterview}
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Interview
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversation Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === 'candidate' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'interviewer' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {msg.role === 'interviewer' ? (
                          <Bot className="h-4 w-4 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`flex-1 ${
                        msg.role === 'candidate' ? 'text-right' : ''
                      }`}>
                        <div className={`inline-block p-3 rounded-lg ${
                          msg.role === 'interviewer' 
                            ? 'bg-blue-50 text-left' 
                            : 'bg-gray-100 text-left'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentTranscript && (
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="inline-block p-3 rounded-lg bg-gray-100 text-left">
                          <p className="text-sm text-muted-foreground italic">
                            {currentTranscript}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions</span>
                    <span>{questionCount}/{maxQuestions}</span>
                  </div>
                  <Progress value={(questionCount / maxQuestions) * 100} />
                  
                  {startTime && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                      <Clock className="h-4 w-4" />
                      <span>
                        {Math.floor((Date.now() - startTime.getTime()) / 60000)} minutes
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Render completed screen
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          <h2 className="text-2xl font-bold">Interview Completed!</h2>
          <p className="text-muted-foreground">
            Thank you for completing the interview. Your responses are being analyzed.
          </p>
          <Button onClick={() => router.push('/interview/feedback')}>
            View Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
