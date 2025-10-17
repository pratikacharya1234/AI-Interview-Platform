'use client'

/**
 * Turn-Based Voice Interview Component
 * - AI speaks first, then waits for user to finish
 * - User speaks, AI listens to complete response
 * - AI analyzes user's actual audio content
 * - AI responds based on what user said (no pre-made prompts)
 * - True conversational flow
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
  Loader2,
  CheckCircle,
  AlertCircle,
  PhoneOff,
  User,
  Bot,
  Clock,
  Pause
} from 'lucide-react'

interface Message {
  id: string
  role: 'interviewer' | 'candidate'
  content: string
  timestamp: Date
}

type ConversationState = 'ai_speaking' | 'waiting_for_user' | 'user_speaking' | 'processing' | 'completed'

export default function VideoInterviewNew() {
  const router = useRouter()
  const { data: session } = useSession()
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef<string>('')
  
  // State
  const [conversationState, setConversationState] = useState<ConversationState>('ai_speaking')
  const [messages, setMessages] = useState<Message[]>([])
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState<string>(`interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [startTime] = useState<Date>(new Date())
  const [questionCount, setQuestionCount] = useState(0)
  const [interviewStarted, setInterviewStarted] = useState(false)
  
  const maxQuestions = 6
  const position = 'Software Developer'
  const company = 'Tech Company'

  /**
   * Initialize media devices
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

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      return true
    } catch (err: any) {
      console.error('Media initialization error:', err)
      setError(`Failed to access camera/microphone: ${err.message}`)
      return false
    }
  }, [])

  /**
   * Speak text using ElevenLabs
   */
  const speakText = useCallback(async (text: string): Promise<void> => {
    setConversationState('ai_speaking')

    try {
      console.log('🔊 AI Speaking:', text)
      
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Rachel' })
      })

      if (!response.ok) {
        throw new Error('TTS failed')
      }

      const audioData = await response.arrayBuffer()

      if (audioContextRef.current) {
        const audioBuffer = await audioContextRef.current.decodeAudioData(audioData)
        
        if (currentAudioSourceRef.current) {
          currentAudioSourceRef.current.stop()
        }

        const source = audioContextRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContextRef.current.destination)
        
        currentAudioSourceRef.current = source

        await new Promise<void>((resolve) => {
          source.onended = () => {
            console.log('✅ AI finished speaking')
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
      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve()
        speechSynthesis.speak(utterance)
      })
    }
  }, [])

  /**
   * Start recording user's response with Web Speech API
   */
  const startRecording = useCallback(async () => {
    if (!mediaStreamRef.current) return

    try {
      setConversationState('user_speaking')
      setError(null)
      audioChunksRef.current = []
      transcriptRef.current = ''

      // Try Web Speech API first (more reliable)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        let finalTranscript = ''
        
        recognition.onresult = (event: any) => {
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }
          
          transcriptRef.current = finalTranscript.trim()
          console.log('📝 Transcript:', transcriptRef.current)
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error !== 'no-speech') {
            setError(`Speech recognition error: ${event.error}`)
          }
        }
        
        recognition.start()
        console.log('🎤 User can speak now (Web Speech API)')
      } else {
        // Fallback to MediaRecorder
        const audioTracks = mediaStreamRef.current.getAudioTracks()
        if (audioTracks.length === 0) {
          throw new Error('No audio track available')
        }

        const audioStream = new MediaStream(audioTracks)

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'

        const mediaRecorder = new MediaRecorder(audioStream, {
          mimeType,
          audioBitsPerSecond: 128000
        })

        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.start(100)
        console.log('🎤 User can speak now (MediaRecorder)')
      }

    } catch (err: any) {
      console.error('Recording error:', err)
      setError(`Failed to start recording: ${err.message}`)
    }
  }, [])

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    // Stop Web Speech API if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current = null
      } catch (err) {
        console.error('Error stopping recognition:', err)
      }
    }

    // Stop MediaRecorder if active
    if (!mediaRecorderRef.current) return null

    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('🎤 Recording stopped, blob size:', audioBlob.size)
        resolve(audioBlob)
      }

      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    })
  }, [])

  /**
   * Process user's audio and get AI response
   */
  const processUserResponse = useCallback(async (audioBlob: Blob, transcript?: string) => {
    setConversationState('processing')

    try {
      let userTranscript = transcript

      // Web Speech API should always provide transcript
      // This fallback should rarely be needed
      if (!userTranscript) {
        console.warn('⚠️ No transcript provided. Web Speech API should have captured it.')
        setError('No speech detected. Please try speaking again.')
        setConversationState('waiting_for_user')
        return
      }

      if (userTranscript.length < 3) {
        setError('Speech too short. Please provide a longer response.')
        setConversationState('waiting_for_user')
        return
      }

      console.log('✅ User said:', userTranscript)

      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'candidate',
        content: userTranscript,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])

      // 2. Get AI response based on what user actually said
      console.log('🧠 Getting AI response based on user\'s actual words...')
      
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role === 'candidate' ? 'user' : 'assistant',
        content: msg.content
      }))

      const aiResponse = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userTranscript,
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

      console.log('✅ AI responds:', aiText)

      // Add AI message
      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'interviewer',
        content: aiText,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      setQuestionCount(prev => prev + 1)

      // 3. AI speaks the response
      await speakText(aiText)

      // 4. Check if interview should end
      if (questionCount >= maxQuestions - 1) {
        await endInterview()
      } else {
        // Wait for user to speak next
        setConversationState('waiting_for_user')
      }

    } catch (err: any) {
      console.error('Process error:', err)
      setError(`Failed to process response: ${err.message}`)
      setConversationState('waiting_for_user')
    }
  }, [messages, questionCount, speakText, position, company, maxQuestions])

  /**
   * Start the interview
   */
  const startInterview = useCallback(async () => {
    const mediaReady = await initializeMedia()
    if (!mediaReady) return

    setInterviewStarted(true)
    setQuestionCount(1)

    // AI greeting
    const greeting = `Hello! I'm Sarah, your AI interviewer. Welcome to your interview for the ${position} position at ${company}. I'll ask you questions and listen carefully to your responses. Let's begin. Please tell me about yourself and your background.`
    
    const greetingMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'interviewer',
      content: greeting,
      timestamp: new Date()
    }
    
    setMessages([greetingMessage])
    
    // AI speaks greeting
    await speakText(greeting)
    
    // Now wait for user to respond
    setConversationState('waiting_for_user')
    
  }, [initializeMedia, speakText, position, company])

  /**
   * User clicks to start speaking
   */
  const handleUserStartSpeaking = useCallback(async () => {
    await startRecording()
  }, [startRecording])

  /**
   * User clicks to stop speaking
   */
  const handleUserStopSpeaking = useCallback(async () => {
    const audioBlob = await stopRecording()
    
    // Use Web Speech API transcript if available
    if (transcriptRef.current && transcriptRef.current.length > 3) {
      await processUserResponse(audioBlob || new Blob(), transcriptRef.current)
    } else if (audioBlob && audioBlob.size > 1000) {
      // Fallback to audio transcription
      await processUserResponse(audioBlob)
    } else {
      setError('No speech detected. Please try again.')
      setConversationState('waiting_for_user')
    }
  }, [stopRecording, processUserResponse])

  /**
   * End interview
   */
  const endInterview = useCallback(async () => {
    setConversationState('completed')

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }

    if (!session?.user?.email) return

    try {
      // Transform messages to match API expectations
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        type: msg.role === 'interviewer' ? 'interviewer' : 'candidate',
        text: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))

      const interviewData = {
        id: sessionId,
        userId: session.user.email,
        userEmail: session.user.email,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: Math.round((Date.now() - startTime.getTime()) / 1000),
        messages: transformedMessages,
        status: 'completed',
        position,
        company,
        videoEnabled: isVideoEnabled
      }

      const response = await fetch('/api/interview/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/interview/feedback?id=${data.interviewId}`)
      }

    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save interview.')
    }
  }, [session, sessionId, startTime, messages, position, company, isVideoEnabled, router])

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
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [])

  // Render setup screen
  if (!interviewStarted) {
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
                  <strong>How it works:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>AI asks a question and waits</li>
                    <li>Click &quot;Start Speaking&quot; when ready</li>
                    <li>Speak your answer</li>
                    <li>Click &quot;Stop Speaking&quot; when done</li>
                    <li>AI listens and responds to what you said</li>
                    <li>Repeat for {maxQuestions} questions</li>
                  </ol>
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
  if (conversationState !== 'completed') {
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
                    {conversationState === 'ai_speaking' && (
                      <Badge className="bg-green-600">
                        <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                        AI Speaking - Please Wait
                      </Badge>
                    )}
                    {conversationState === 'waiting_for_user' && (
                      <Badge className="bg-blue-600 animate-pulse">
                        <Pause className="h-3 w-3 mr-1" />
                        Your Turn - Click to Speak
                      </Badge>
                    )}
                    {conversationState === 'user_speaking' && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Mic className="h-3 w-3 mr-1" />
                        You&apos;re Speaking
                      </Badge>
                    )}
                    {conversationState === 'processing' && (
                      <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing Your Response
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
                    variant={isVideoEnabled ? "primary" : "danger"}
                    size="sm"
                    onClick={toggleVideo}
                    className="w-12 h-12 p-0"
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>

                  {conversationState === 'waiting_for_user' && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleUserStartSpeaking}
                      className="flex-1"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Start Speaking
                    </Button>
                  )}

                  {conversationState === 'user_speaking' && (
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={handleUserStopSpeaking}
                      className="flex-1"
                    >
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop Speaking
                    </Button>
                  )}

                  {(conversationState === 'ai_speaking' || conversationState === 'processing') && (
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled
                      className="flex-1"
                    >
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {conversationState === 'ai_speaking' ? 'AI Speaking...' : 'Processing...'}
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    onClick={endInterview}
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions</span>
                    <span>{questionCount}/{maxQuestions}</span>
                  </div>
                  <Progress value={(questionCount / maxQuestions) * 100} />
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor((Date.now() - startTime.getTime()) / 60000)} minutes
                    </span>
                  </div>
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
