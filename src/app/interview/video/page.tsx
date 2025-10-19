"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function VideoInterviewPage() {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'idle' | 'in_progress'>('idle')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
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
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      mediaStreamRef.current = stream
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
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
      }
    }
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
      sendMessage(`[Audio Response: ${base64Audio.substring(0, 50)}...]`)
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
      const response = await fetch('/api/interview/video', {
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
    if (!isVideoEnabled) {
      await startCamera()
    }
    setInterviewStarted(true)
    sendMessage("Start the interview. Introduce yourself as an AI interviewer and ask the first question.")
  }

  const endInterview = () => {
    stopCamera()
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
          <h1 className="text-xl font-bold">Video Interview</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Video Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
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
                  {interviewStarted && (
                    <div className="absolute top-4 right-4 rounded-lg bg-black/50 px-3 py-1 text-sm font-mono text-white backdrop-blur-sm">
                      {Math.floor(interviewDuration / 60)}:{String(interviewDuration % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    variant={isVideoEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={toggleVideo}
                    disabled={!mediaStreamRef.current}
                    className="p-2"
                  >
                    {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={isAudioEnabled ? "primary" : "outline"}
                    size="sm"
                    onClick={toggleAudio}
                    disabled={!mediaStreamRef.current}
                    className="p-2"
                  >
                    {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  {!interviewStarted ? (
                    <Button onClick={startInterview} size="lg" className="ml-4">
                      Start Interview
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        size="lg"
                        variant={isRecording ? "danger" : "primary"}
                        className="ml-4"
                        disabled={status === "in_progress"}
                      >
                        {isRecording ? "Stop Speaking" : "Start Speaking"}
                      </Button>
                      <Button onClick={endInterview} size="lg" variant="outline">
                        End Interview
                      </Button>
                    </>
                  )}
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
          </div>

          {/* Chat Section */}
          <div className="space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {!interviewStarted && (
                    <div className="rounded-lg bg-muted p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Click &quot;Start Interview&quot; to begin your AI-powered video interview session
                      </p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {status === "in_progress" && (
                    <div className="flex justify-start">
                      <div className="rounded-lg bg-muted px-4 py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
