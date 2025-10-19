"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Video, VideoOff, Mic, MicOff, ArrowLeft, Loader2,
  Play, StopCircle, MessageSquare, Brain, CheckCircle,
  AlertCircle, Clock, User
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InterviewSummaryView } from "@/components/interview/InterviewSummaryView"
import { TranscriptPanel } from "@/components/interview/TranscriptPanel"
import { EvaluationCard } from "@/components/interview/EvaluationCard"
import type { 
  InterviewSession, 
  Transcript, 
  AIResponse, 
  InterviewSummary 
} from "@/types/interview"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"

export default function LiveInterviewPage() {
  const router = useRouter()
  
  // Media refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const chunkIndexRef = useRef(0)
  
  // State
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [currentAIResponse, setCurrentAIResponse] = useState<AIResponse | null>(null)
  const [summary, setSummary] = useState<InterviewSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  
  // Timer
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout>()
  
  // Initialize interview session
  useEffect(() => {
    initializeInterview()
    return () => cleanup()
  }, [])
  
  // Duration timer
  useEffect(() => {
    if (interviewStarted && !durationIntervalRef.current) {
      startTimeRef.current = Date.now()
      durationIntervalRef.current = setInterval(() => {
        setInterviewDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    }
    
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [interviewStarted])
  
  const initializeInterview = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const candidateName = localStorage.getItem('candidateName') || 'Test Candidate'
      const candidateEmail = localStorage.getItem('candidateEmail') || 'test@example.com'
      const position = localStorage.getItem('position') || 'Software Engineer'
      
      const response = await fetch(`${BACKEND_URL}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          position: position,
          interview_type: 'technical',
          difficulty: 'medium'
        })
      })
      
      if (!response.ok) throw new Error('Failed to start interview session')
      
      const data = await response.json()
      
      setSession({
        id: data.session_id,
        interview_id: data.interview_id,
        status: 'ready',
        current_question: data.initial_question.question,
        question_number: 1
      })
      
      connectWebSocket(data.session_id)
      
      setTranscripts([{
        id: '0',
        text: data.initial_question.question,
        timestamp: Date.now(),
        confidence: 1.0,
        speaker: 'interviewer'
      }])
      
    } catch (err) {
      console.error('Failed to initialize interview:', err)
      setError('Failed to initialize interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const connectWebSocket = (sessionId: string) => {
    try {
      setConnectionStatus('connecting')
      const ws = new WebSocket(`${WS_URL}/ws/${sessionId}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('disconnected')
        setError('Connection error. Please check your internet connection.')
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnectionStatus('disconnected')
      }
      
      wsRef.current = ws
      
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)
      
      return () => {
        clearInterval(pingInterval)
        ws.close()
      }
    } catch (err) {
      console.error('WebSocket connection error:', err)
      setConnectionStatus('disconnected')
    }
  }
  
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'transcript':
        const newTranscript: Transcript = {
          id: Date.now().toString(),
          text: data.data.text,
          timestamp: data.data.timestamp,
          confidence: data.data.confidence,
          speaker: 'candidate'
        }
        setTranscripts(prev => [...prev, newTranscript])
        break
        
      case 'ai_response':
        const aiResponse: AIResponse = data.data
        setCurrentAIResponse(aiResponse)
        
        if (aiResponse.assistant_reply) {
          setTranscripts(prev => [...prev, {
            id: Date.now().toString(),
            text: aiResponse.assistant_reply,
            timestamp: Date.now(),
            confidence: 1.0,
            speaker: 'interviewer'
          }])
        }
        
        if (aiResponse.next_question && session) {
          setSession({
            ...session,
            current_question: aiResponse.next_question,
            question_number: session.question_number + 1
          })
        }
        
        if (aiResponse.interview_complete) {
          handleInterviewComplete()
        }
        break
    }
  }
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      mediaStreamRef.current = stream
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
      
      startChunkRecording()
      
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera/microphone. Please check permissions.")
    }
  }
  
  const startChunkRecording = () => {
    if (!mediaStreamRef.current) return
    
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 16000
    }
    
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current, options)
    
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        await processAudioChunk(event.data)
      }
    }
    
    mediaRecorder.start(2000) // Record in 2-second chunks
    mediaRecorderRef.current = mediaRecorder
    setIsRecording(true)
  }
  
  const processAudioChunk = async (chunk: Blob) => {
    if (!session || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Audio = reader.result as string
      
      const message = {
        type: 'audio_chunk',
        data: {
          chunk: base64Audio,
          timestamp: Date.now(),
          index: chunkIndexRef.current++
        }
      }
      
      wsRef.current?.send(JSON.stringify(message))
    }
    reader.readAsDataURL(chunk)
  }
  
  const stopCamera = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsVideoEnabled(false)
    setIsAudioEnabled(false)
  }
  
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }
  
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        
        if (mediaRecorderRef.current) {
          if (audioTrack.enabled && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume()
          } else if (!audioTrack.enabled && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause()
          }
        }
      }
    }
  }
  
  const startInterview = async () => {
    if (!session) return
    
    await startCamera()
    setInterviewStarted(true)
    
    if (session) {
      setSession({
        ...session,
        status: 'active'
      })
    }
  }
  
  const endInterview = async () => {
    if (!session) return
    
    try {
      setLoading(true)
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'end_interview' }))
      }
      
      const response = await fetch(`${BACKEND_URL}/api/interview/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          reason: 'completed'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        
        if (session) {
          setSession({
            ...session,
            status: 'completed'
          })
        }
      }
      
      stopCamera()
      
    } catch (err) {
      console.error('Error ending interview:', err)
      setError('Failed to end interview properly')
    } finally {
      setLoading(false)
    }
  }
  
  const handleInterviewComplete = () => {
    endInterview()
  }
  
  const cleanup = () => {
    stopCamera()
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
  }
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Render interview summary
  if (session?.status === 'completed' && summary) {
    return <InterviewSummaryView session={session} summary={summary} />
  }
  
  // Main interview interface
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus}
            </Badge>
            {interviewStarted && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatDuration(interviewDuration)}</span>
              </div>
            )}
          </div>
          <div className="w-20" />
        </div>
      </header>
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Interview</span>
                  {session && (
                    <Badge>Question {session.question_number}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  {isVideoEnabled ? (
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <VideoOff className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Camera is off</p>
                      </div>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1 text-white">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      <span className="text-sm font-medium">Recording</span>
                    </div>
                  )}
                </div>
                
                {session && (
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Current Question:</strong> {session.current_question}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant={isVideoEnabled ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleVideo}
                    disabled={!mediaStreamRef.current}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isAudioEnabled ? "secondary" : "outline"}
                    size="sm"
                    onClick={toggleAudio}
                    disabled={!mediaStreamRef.current}
                  >
                    {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  
                  {!interviewStarted ? (
                    <Button 
                      onClick={startInterview} 
                      size="lg" 
                      className="ml-4"
                      disabled={loading || !session}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Interview
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={endInterview} 
                      size="lg" 
                      variant="destructive"
                      className="ml-4"
                      disabled={loading}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Interview
                    </Button>
                  )}
                </div>
                
                {currentAIResponse && (
                  <EvaluationCard evaluation={currentAIResponse.evaluation_json} />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <TranscriptPanel transcripts={transcripts} />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
