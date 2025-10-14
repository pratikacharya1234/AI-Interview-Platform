# Voice Interview Integration Guide

## 🎯 Quick Integration

This guide shows how to integrate the enhanced voice system into the existing VideoInterview component.

---

## Option 1: Use Enhanced Voice Manager (Recommended)

### Step 1: Import Enhanced Voice Manager

```typescript
// In VideoInterview.tsx
import { EnhancedVoiceStreamManager } from '@/lib/voice-stream-enhanced'

// Replace the old voice manager
const voiceManagerRef = useRef<EnhancedVoiceStreamManager | null>(null)
```

### Step 2: Initialize on Mount

```typescript
useEffect(() => {
  voiceManagerRef.current = new EnhancedVoiceStreamManager()
  
  return () => {
    voiceManagerRef.current?.cleanup()
  }
}, [])
```

### Step 3: Update Recording Logic

```typescript
// Start recording user's response
const startListening = async () => {
  try {
    setState(prev => ({ ...prev, isListening: true }))
    await voiceManagerRef.current?.startRecording()
    
    // Set timeout to auto-stop after 30 seconds
    setTimeout(async () => {
      if (state.isListening) {
        await stopListening()
      }
    }, 30000)
    
  } catch (error) {
    console.error('Failed to start recording:', error)
    setError('Microphone access denied. Please enable microphone permissions.')
  }
}

// Stop recording and process
const stopListening = async () => {
  try {
    setState(prev => ({ ...prev, isListening: false, isProcessing: true }))
    
    // Get audio blob
    const audioBlob = await voiceManagerRef.current?.stopRecording()
    
    if (!audioBlob) {
      throw new Error('No audio recorded')
    }
    
    // Transcribe audio
    const transcript = await voiceManagerRef.current?.transcribeAudio(audioBlob)
    
    if (!transcript || transcript.length < 3) {
      setError('No speech detected. Please try again.')
      setState(prev => ({ ...prev, isProcessing: false }))
      return
    }
    
    // Process the transcript
    await handleCandidateResponse(transcript)
    
  } catch (error) {
    console.error('Failed to process audio:', error)
    setError('Failed to process your response. Please try again.')
    setState(prev => ({ ...prev, isProcessing: false }))
  }
}
```

### Step 4: Update AI Response Logic

```typescript
const handleCandidateResponse = async (transcript: string) => {
  // Add candidate message
  const candidateMessage: InterviewMessage = {
    id: `candidate-${Date.now()}`,
    type: 'candidate',
    text: transcript,
    timestamp: new Date()
  }
  
  setState(prev => ({
    ...prev,
    messages: [...prev.messages, candidateMessage],
    isProcessing: true
  }))
  
  try {
    // Get AI response
    const conversationHistory = state.messages.map(msg => ({
      role: msg.type === 'candidate' ? 'user' : 'assistant',
      content: msg.text
    }))
    
    const interviewContext = {
      currentQuestionIndex: state.currentIndex,
      totalQuestions: 6,
      position: 'Software Developer',
      company: 'Tech Company'
    }
    
    const aiResponse = await voiceManagerRef.current?.getAIResponse(
      transcript,
      conversationHistory,
      interviewContext
    )
    
    if (!aiResponse) {
      throw new Error('No AI response')
    }
    
    // Add AI message
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
      isProcessing: false,
      isSpeaking: true
    }))
    
    // Speak the response
    await voiceManagerRef.current?.speakText(aiResponse, 'Rachel')
    
    setState(prev => ({ ...prev, isSpeaking: false }))
    
    // Start listening for next response
    if (state.currentIndex < 5) {
      setTimeout(() => startListening(), 1000)
    } else {
      completeInterview()
    }
    
  } catch (error) {
    console.error('Error processing response:', error)
    setError('Failed to generate AI response. Please try again.')
    setState(prev => ({ ...prev, isProcessing: false }))
  }
}
```

---

## Option 2: Keep Existing System with Improvements

If you want to keep the existing Web Speech API system, here are improvements:

### Improvement 1: Add Gemini Transcription as Fallback

```typescript
const transcribeWithGemini = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData()
  formData.append('audio', audioBlob)
  
  const response = await fetch('/api/speech-to-text', {
    method: 'POST',
    body: formData
  })
  
  const data = await response.json()
  return data.transcript
}

// Use in error handler
recognition.onerror = async (event: any) => {
  if (event.error === 'network' || event.error === 'no-speech') {
    // Fallback to Gemini transcription
    try {
      const transcript = await transcribeWithGemini(recordedAudioBlob)
      handleCandidateResponse(transcript)
    } catch (error) {
      setError('Speech recognition failed. Please try again.')
    }
  }
}
```

### Improvement 2: Use ElevenLabs for All Speech

```typescript
const speakWithElevenLabs = async (text: string) => {
  try {
    const response = await fetch('/api/tts/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'Rachel' })
    })
    
    const audioData = await response.arrayBuffer()
    
    // Play audio
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(audioData)
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.start()
    
    return new Promise(resolve => {
      source.onended = resolve
    })
    
  } catch (error) {
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }
}
```

---

## 🧪 Testing the Integration

### Test 1: Basic Recording

```typescript
// Add test button
<Button onClick={async () => {
  await voiceManagerRef.current?.initializeAudio()
  await voiceManagerRef.current?.startRecording()
  
  setTimeout(async () => {
    const blob = await voiceManagerRef.current?.stopRecording()
    console.log('Recorded blob size:', blob?.size)
  }, 3000)
}}>
  Test Recording (3s)
</Button>
```

### Test 2: Transcription

```typescript
<Button onClick={async () => {
  await voiceManagerRef.current?.initializeAudio()
  await voiceManagerRef.current?.startRecording()
  
  setTimeout(async () => {
    const blob = await voiceManagerRef.current?.stopRecording()
    const transcript = await voiceManagerRef.current?.transcribeAudio(blob!)
    console.log('Transcript:', transcript)
    alert(`You said: ${transcript}`)
  }, 5000)
}}>
  Test Transcription (5s)
</Button>
```

### Test 3: Full Interaction

```typescript
<Button onClick={async () => {
  const { transcript, aiResponse } = await voiceManagerRef.current?.processVoiceInteraction(
    [],
    { position: 'Software Developer' }
  )
  console.log('User:', transcript)
  console.log('AI:', aiResponse)
}}>
  Test Full Interaction
</Button>
```

---

## 🎨 UI Improvements

### Add Visual Indicators

```typescript
// Recording indicator
{state.isListening && (
  <div className="flex items-center gap-2 text-red-600">
    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
    <span>Recording...</span>
  </div>
)}

// Processing indicator
{state.isProcessing && (
  <div className="flex items-center gap-2 text-blue-600">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Processing your response...</span>
  </div>
)}

// Speaking indicator
{state.isSpeaking && (
  <div className="flex items-center gap-2 text-green-600">
    <Volume2 className="w-4 h-4" />
    <span>AI is speaking...</span>
  </div>
)}
```

### Add Waveform Visualization

```typescript
import { useEffect, useRef } from 'react'

const AudioWaveform = ({ isRecording }: { isRecording: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!isRecording || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationId: number
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#3b82f6'
      
      // Draw animated bars
      for (let i = 0; i < 20; i++) {
        const height = Math.random() * 50 + 10
        const x = i * 15
        ctx.fillRect(x, canvas.height / 2 - height / 2, 10, height)
      }
      
      animationId = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => cancelAnimationFrame(animationId)
  }, [isRecording])
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100}
      className="border rounded"
    />
  )
}
```

---

## 📝 Complete Example Component

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { EnhancedVoiceStreamManager } from '@/lib/voice-stream-enhanced'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react'

export default function SimpleVoiceInterview() {
  const voiceManager = useRef<EnhancedVoiceStreamManager | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    voiceManager.current = new EnhancedVoiceStreamManager()
    return () => voiceManager.current?.cleanup()
  }, [])

  const startInterview = async () => {
    try {
      await voiceManager.current?.initializeAudio()
      
      // Start with greeting
      const greeting = "Hello! I'm Sarah, your AI interviewer. Let's begin. Tell me about yourself."
      setMessages([{ type: 'interviewer', text: greeting }])
      
      setIsSpeaking(true)
      await voiceManager.current?.speakText(greeting)
      setIsSpeaking(false)
      
      // Start listening
      await startListening()
      
    } catch (error) {
      setError('Failed to start interview')
    }
  }

  const startListening = async () => {
    try {
      setIsRecording(true)
      setError(null)
      await voiceManager.current?.startRecording()
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isRecording) stopListening()
      }, 30000)
      
    } catch (error) {
      setError('Microphone access denied')
      setIsRecording(false)
    }
  }

  const stopListening = async () => {
    try {
      setIsRecording(false)
      setIsProcessing(true)
      
      const audioBlob = await voiceManager.current?.stopRecording()
      const transcript = await voiceManager.current?.transcribeAudio(audioBlob!)
      
      if (!transcript) {
        setError('No speech detected')
        setIsProcessing(false)
        return
      }
      
      // Add user message
      setMessages(prev => [...prev, { type: 'candidate', text: transcript }])
      
      // Get AI response
      const aiResponse = await voiceManager.current?.getAIResponse(
        transcript,
        messages,
        { position: 'Software Developer' }
      )
      
      // Add AI message
      setMessages(prev => [...prev, { type: 'interviewer', text: aiResponse! }])
      
      setIsProcessing(false)
      setIsSpeaking(true)
      
      // Speak response
      await voiceManager.current?.speakText(aiResponse!)
      setIsSpeaking(false)
      
      // Continue interview
      await startListening()
      
    } catch (error) {
      setError('Failed to process response')
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">AI Voice Interview</h1>
        
        {/* Status */}
        <div className="mb-4">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <Mic className="w-5 h-5 animate-pulse" />
              <span>Recording your response...</span>
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-green-600">
              <Volume2 className="w-5 h-5" />
              <span>AI is speaking...</span>
            </div>
          )}
          {error && (
            <div className="text-red-600">{error}</div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-4">
          {messages.length === 0 ? (
            <Button onClick={startInterview}>
              Start Interview
            </Button>
          ) : (
            <>
              <Button 
                onClick={isRecording ? stopListening : startListening}
                disabled={isProcessing || isSpeaking}
              >
                {isRecording ? <MicOff /> : <Mic />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((msg, i) => (
          <Card key={i} className={`p-4 ${
            msg.type === 'interviewer' ? 'bg-blue-50' : 'bg-gray-50'
          }`}>
            <div className="font-semibold mb-2">
              {msg.type === 'interviewer' ? '🤖 AI Interviewer' : '👤 You'}
            </div>
            <div>{msg.text}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## ✅ Integration Checklist

- [ ] Import EnhancedVoiceStreamManager
- [ ] Initialize voice manager on mount
- [ ] Update startListening to use startRecording()
- [ ] Update stopListening to use stopRecording() + transcribeAudio()
- [ ] Update AI response to use getAIResponse()
- [ ] Update speech output to use speakText()
- [ ] Add error handling for all steps
- [ ] Add visual indicators for states
- [ ] Test with real microphone
- [ ] Test on different browsers
- [ ] Test on mobile devices

---

**Ready to integrate!** 🎤✨
