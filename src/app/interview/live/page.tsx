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
// Components will be inlined for now
import type { 
  InterviewSession, 
  Transcript, 
  AIResponse, 
  InterviewSummary 
} from "@/types/interview"

// Use Next.js API routes instead of Python backend
const API_BASE = ''

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
  const durationIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
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
      
      const response = await fetch(`${API_BASE}/api/interview/start`, {
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
      
      // connectWebSocket(data.session_id) // Disabled for now
      
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
  
  // Polling-based approach instead of WebSocket
  const connectWebSocket = (sessionId: string) => {
    // For now, we'll use polling or direct API calls
    setConnectionStatus('connected')
    console.log('Using polling mode for session:', sessionId)
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
    if (!session) return
    
    try {
      const reader = new FileReader()
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(chunk)
      })
      
      // Send to API instead of WebSocket
      const response = await fetch('/api/interview/process-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          audio_chunk: base64Audio,
          timestamp: Date.now(),
          chunk_index: chunkIndexRef.current++
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle transcript
        if (data.transcript) {
          const newTranscript: Transcript = {
            id: Date.now().toString(),
            text: data.transcript,
            timestamp: Date.now(),
            confidence: 0.95,
            speaker: 'candidate'
          }
          setTranscripts(prev => [...prev, newTranscript])
        }
        
        // Handle AI response
        if (data.ai_response) {
          setCurrentAIResponse(data.ai_response)
          
          if (data.ai_response.assistant_reply) {
            setTranscripts(prev => [...prev, {
              id: Date.now().toString(),
              text: data.ai_response.assistant_reply,
              timestamp: Date.now(),
              confidence: 1.0,
              speaker: 'interviewer'
            }])
          }
        }
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error)
    }
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
      
      // No WebSocket to close
      
      const response = await fetch(`${API_BASE}/api/interview/end`, {
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
    // No WebSocket to close
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
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-xl font-bold">Interview Complete</h1>
            <div className="w-24" />
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Interview Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold">
                  {summary.overall_performance}%
                </div>
                <p className="text-muted-foreground mt-2">Overall Performance</p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => router.push(`/api/report/${session.interview_id}`)} className="flex-1">
                  View Full Report
                </Button>
                <Button variant="outline" onClick={() => router.push('/interview')} className="flex-1">
                  Start New Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                      variant="danger"
                      className="ml-4"
                      disabled={loading}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Interview
                    </Button>
                  )}
                </div>
                
                {currentAIResponse && (
                  <Card className="bg-muted">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-3">Real-time Evaluation</h4>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {currentAIResponse.evaluation_json.overall_score}%
                        </div>
                        <p className="text-xs text-muted-foreground">Current Score</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {transcripts.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Transcript will appear here once the interview starts</p>
                    </div>
                  )}
                  
                  {transcripts.map((transcript) => (
                    <div
                      key={transcript.id}
                      className={`p-3 rounded-lg ${
                        transcript.speaker === 'interviewer' 
                          ? 'bg-primary/10 border-l-4 border-primary' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {transcript.speaker === 'interviewer' ? (
                          <Brain className="h-4 w-4 mt-0.5 text-primary" />
                        ) : (
                          <User className="h-4 w-4 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold">
                              {transcript.speaker === 'interviewer' ? 'AI Interviewer' : 'You'}
                            </span>
                            {transcript.confidence < 1 && (
                              <span className="text-xs text-muted-foreground">
                                {Math.round(transcript.confidence * 100)}% confident
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{transcript.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
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
