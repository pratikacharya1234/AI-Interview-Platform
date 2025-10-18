"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, ArrowLeft, Loader2, Radio } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AudioInterviewPage() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'idle' | 'in_progress'>('idle')
  
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

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

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      mediaStreamRef.current = stream
      setIsAudioEnabled(true)

      // Setup audio visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      visualizeAudio()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Unable to access microphone. Please check permissions.")
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const updateLevel = () => {
      if (!analyserRef.current) return

      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average)

      animationFrameRef.current = requestAnimationFrame(updateLevel)
    }

    updateLevel()
  }

  const stopAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setIsAudioEnabled(false)
    setAudioLevel(0)
  }

  const startRecording = () => {
    if (!mediaStreamRef.current) return

    audioChunksRef.current = []
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
      await processAudioResponse(audioBlob)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudioResponse = async (audioBlob: Blob) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Audio = reader.result as string
      sendMessage("[Audio Response Recorded]")
    }
    reader.readAsDataURL(audioBlob)
  }

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    setStatus('in_progress')
    
    // Call API for AI response
    try {
      const response = await fetch('/api/interview/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            parts: [{ type: 'text', text: m.content }]
          }))
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.content || 'I understand. Please continue.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setStatus('idle')
    }
  }

  const startInterview = async () => {
    if (!isAudioEnabled) {
      await startAudio()
    }
    setInterviewStarted(true)
    sendMessage("Start the interview. Introduce yourself as an AI interviewer and ask the first question.")
  }

  const endInterview = () => {
    stopAudio()
    setShowSummary(true)
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold">Audio Interview</h1>
          {interviewStarted && (
            <div className="rounded-lg bg-muted px-3 py-1 text-sm font-mono">
              {Math.floor(interviewDuration / 60)}:{String(interviewDuration % 60).padStart(2, "0")}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Audio Visualizer */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Circular Audio Visualizer */}
                <div className="relative flex h-48 w-48 items-center justify-center">
                  {/* Outer ring - animated based on audio level */}
                  <div
                    className="absolute inset-0 rounded-full border-4 border-accent/30 transition-all duration-100"
                    style={{
                      transform: `scale(${1 + audioLevel / 500})`,
                      opacity: isRecording ? 0.8 : 0.3,
                    }}
                  />
                  <div
                    className="absolute inset-4 rounded-full border-4 border-accent/20 transition-all duration-150"
                    style={{
                      transform: `scale(${1 + audioLevel / 400})`,
                      opacity: isRecording ? 0.6 : 0.2,
                    }}
                  />
                  <div
                    className="absolute inset-8 rounded-full border-4 border-accent/10 transition-all duration-200"
                    style={{
                      transform: `scale(${1 + audioLevel / 300})`,
                      opacity: isRecording ? 0.4 : 0.1,
                    }}
                  />

                  {/* Center icon */}
                  <div
                    className={`flex h-24 w-24 items-center justify-center rounded-full ${
                      isRecording ? "bg-destructive" : isAudioEnabled ? "bg-accent" : "bg-muted"
                    } transition-colors`}
                  >
                    {isRecording ? (
                      <Radio className="h-12 w-12 text-destructive-foreground animate-pulse" />
                    ) : isAudioEnabled ? (
                      <Mic className="h-12 w-12 text-accent-foreground" />
                    ) : (
                      <MicOff className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {isRecording ? "Recording..." : isAudioEnabled ? "Ready to Record" : "Microphone Off"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? "Speak clearly into your microphone" : "Click the button below to start"}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {!interviewStarted ? (
                    <Button onClick={startInterview} size="lg">
                      Start Interview
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        size="lg"
                        variant={isRecording ? "danger" : "primary"}
                        disabled={status === "in_progress" || !isAudioEnabled}
                      >
                        {isRecording ? "Stop Speaking" : "Start Speaking"}
                      </Button>
                      <Button onClick={endInterview} size="lg" variant="outline">
                        End Interview
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {showSummary && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Interview Summary</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Duration:</span> {Math.floor(interviewDuration / 60)} minutes {interviewDuration % 60} seconds
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Questions Asked:</span> {messages.filter(m => m.role === 'assistant').length}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Your Responses:</span> {messages.filter(m => m.role === 'user').length - 1}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation History */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Conversation</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {!interviewStarted && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Click "Start Interview" to begin your AI-powered audio interview session
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="mb-1 text-xs font-semibold opacity-70">
                        {message.role === "user" ? "You" : "AI Interviewer"}
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {status === "in_progress" && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
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
