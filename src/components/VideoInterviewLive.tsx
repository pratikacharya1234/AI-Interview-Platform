'use client'

/**
 * Video Interview Live Component
 * Real-time AI video interview with WebRTC, STT, LLM, and TTS
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  TrendingUp,
  MessageSquare,
  BarChart3
} from 'lucide-react'

interface VideoInterviewLiveProps {
  sessionId: string
  personaName: string
  jobTitle: string
  onComplete: (reportId: string) => void
}

interface LiveMetrics {
  rolling_technical_avg?: number
  rolling_clarity_avg?: number
  rolling_confidence_avg?: number
  rolling_behavioral_avg?: number
  questions_completed: number
  current_speech_pace?: number
  current_volume?: number
}

interface Transcript {
  speaker: 'user' | 'ai'
  text: string
  timestamp: Date
}

export default function VideoInterviewLive({
  sessionId,
  personaName,
  jobTitle,
  onComplete
}: VideoInterviewLiveProps) {
  // Media states
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Interview states
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null)
  const [sequenceNumber, setSequenceNumber] = useState(0)

  // Feedback states
  const [lastEvaluation, setLastEvaluation] = useState<any>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement>(null)

  /**
   * Initialize media devices
   */
  useEffect(() => {
    initializeMedia()
    startInterview()

    return () => {
      cleanup()
    }
  }, [])

  const initializeMedia = async () => {
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

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await processAudioChunk()
      }

      mediaRecorderRef.current = mediaRecorder
    } catch (error) {
      console.error('Media initialization error:', error)
      alert('Failed to access camera/microphone. Please grant permissions.')
    }
  }

  /**
   * Start interview - get first question
   */
  const startInterview = async () => {
    try {
      setIsProcessing(true)
      
      // For the first question, we'll trigger it by sending an empty audio
      // In production, you might want a separate endpoint for the first question
      const response = await fetch('/api/video-interview/initial-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentQuestion(data.question)
        
        // Play AI audio if available
        if (data.audio_data) {
          playAIAudio(data.audio_data)
        }

        // Add to transcripts
        setTranscripts([{
          speaker: 'ai',
          text: data.question,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Start interview error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Toggle video
   */
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  /**
   * Toggle audio
   */
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  /**
   * Start recording answer
   */
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
    }
  }

  /**
   * Stop recording and process
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  /**
   * Process audio chunk - send to backend
   */
  const processAudioChunk = async () => {
    if (audioChunksRef.current.length === 0) return

    try {
      setIsProcessing(true)

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('session_id', sessionId)
      formData.append('audio', audioBlob)
      formData.append('sequence_number', sequenceNumber.toString())

      const response = await fetch('/api/video-interview/process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process audio')
      }

      const data = await response.json()

      // Add user transcript
      setTranscripts(prev => [...prev, {
        speaker: 'user',
        text: data.transcription.text,
        timestamp: new Date()
      }])

      // Show evaluation feedback
      setLastEvaluation(data.evaluation)
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 5000)

      // Update live metrics
      setLiveMetrics(data.live_metrics)

      // Add AI response
      setCurrentQuestion(data.interviewer_response.question)
      setTranscripts(prev => [...prev, {
        speaker: 'ai',
        text: data.interviewer_response.question,
        timestamp: new Date()
      }])

      // Play AI audio
      if (data.interviewer_response.audio_data) {
        playAIAudio(data.interviewer_response.audio_data)
      }

      // Increment sequence
      setSequenceNumber(prev => prev + 1)

      // Clear audio chunks
      audioChunksRef.current = []
    } catch (error) {
      console.error('Process audio error:', error)
      alert('Failed to process your response. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Play AI audio response
   */
  const playAIAudio = (base64Audio: string) => {
    try {
      const audioData = atob(base64Audio)
      const audioArray = new Uint8Array(audioData.length)
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i)
      }
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' })
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl
        audioPlayerRef.current.play()
      }
    } catch (error) {
      console.error('Audio playback error:', error)
    }
  }

  /**
   * End interview
   */
  const endInterview = async () => {
    try {
      setIsProcessing(true)

      const response = await fetch('/api/video-interview/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        onComplete(data.report.id)
      }
    } catch (error) {
      console.error('End interview error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Cleanup
   */
  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  /**
   * Fetch live metrics periodically
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-interview/metrics?session_id=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setLiveMetrics(data.metrics)
        }
      } catch (error) {
        console.error('Metrics fetch error:', error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Live Interview</h1>
          <p className="text-muted-foreground">
            {jobTitle} • Interviewer: {personaName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Feed */}
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Recording
                    </div>
                  )}

                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-2" />
                        <p>Processing your response...</p>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <Button
                      variant={videoEnabled ? 'default' : 'destructive'}
                      size="icon"
                      onClick={toggleVideo}
                      className="rounded-full"
                    >
                      {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant={audioEnabled ? 'default' : 'destructive'}
                      size="icon"
                      onClick={toggleAudio}
                      className="rounded-full"
                    >
                      {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>

                    {!isRecording ? (
                      <Button
                        size="lg"
                        onClick={startRecording}
                        disabled={isProcessing}
                        className="rounded-full px-8"
                      >
                        <Mic className="h-5 w-5 mr-2" />
                        Start Answer
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={stopRecording}
                        className="rounded-full px-8"
                      >
                        <MicOff className="h-5 w-5 mr-2" />
                        Stop Answer
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={endInterview}
                      disabled={isProcessing}
                    >
                      End Interview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Current Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{currentQuestion || 'Waiting for question...'}</p>
              </CardContent>
            </Card>

            {/* Feedback Toast */}
            {showFeedback && lastEvaluation && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-2">Response Evaluated</p>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Technical:</span>
                          <span className="ml-1 font-medium">{lastEvaluation.technical_score?.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clarity:</span>
                          <span className="ml-1 font-medium">{lastEvaluation.clarity_score?.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-1 font-medium">{lastEvaluation.confidence_score?.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Overall:</span>
                          <span className="ml-1 font-medium">{lastEvaluation.overall_score?.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{lastEvaluation.feedback_summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Live Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Live Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveMetrics ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Technical</span>
                        <span className="font-medium">{liveMetrics.rolling_technical_avg?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <Progress value={(liveMetrics.rolling_technical_avg || 0) * 10} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Clarity</span>
                        <span className="font-medium">{liveMetrics.rolling_clarity_avg?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <Progress value={(liveMetrics.rolling_clarity_avg || 0) * 10} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Confidence</span>
                        <span className="font-medium">{liveMetrics.rolling_confidence_avg?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <Progress value={(liveMetrics.rolling_confidence_avg || 0) * 10} />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Behavioral</span>
                        <span className="font-medium">{liveMetrics.rolling_behavioral_avg?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <Progress value={(liveMetrics.rolling_behavioral_avg || 0) * 10} />
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Questions Completed</span>
                        <span className="font-medium">{liveMetrics.questions_completed}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Answer questions to see metrics</p>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transcripts.map((transcript, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        transcript.speaker === 'ai'
                          ? 'bg-blue-50 dark:bg-blue-950'
                          : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={transcript.speaker === 'ai' ? 'default' : 'secondary'}>
                          {transcript.speaker === 'ai' ? personaName : 'You'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {transcript.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{transcript.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden audio player for AI responses */}
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  )
}
