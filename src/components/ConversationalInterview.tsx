'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
  Bot,
  Waves,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'

interface ConversationalInterviewProps {
  onComplete?: (interviewId: string) => void
}

interface InterviewMessage {
  id: string
  type: 'interviewer' | 'candidate'
  text: string
  timestamp: Date
  isPlaying?: boolean
  audioUrl?: string
}

interface InterviewState {
  isActive: boolean
  currentQuestion: string
  questionCount: number
  currentIndex: number
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  messages: InterviewMessage[]
  interviewId?: string
}

export default function ConversationalInterview({ onComplete }: ConversationalInterviewProps) {
  const [state, setState] = useState<InterviewState>({
    isActive: false,
    currentQuestion: '',
    questionCount: 5,
    currentIndex: 0,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    messages: []
  })

  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    company: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  })
  
  const [userResponse, setUserResponse] = useState('')

  const [interviewSummary, setInterviewSummary] = useState<any>(null)
  const [showSummary, setShowSummary] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'

          recognition.onstart = () => {
            console.log('Speech recognition service started')
          }

          recognition.onresult = (event: any) => {
            let finalTranscript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript
              }
            }
            if (finalTranscript) {
              handleCandidateResponse(finalTranscript.trim())
            }
          }

          recognition.onerror = (event: any) => {
            setState(prev => ({ ...prev, isListening: false }))
            
            // Handle specific errors more gracefully
            switch (event.error) {
              case 'network':
                // Don't log network errors to reduce console noise
                // These are common and usually temporary
                break
              case 'not-allowed':
                alert('Microphone permission denied. Please allow microphone access and refresh the page.')
                break
              case 'no-speech':
                // Normal - don't log this as it happens frequently
                break
              case 'audio-capture':
                console.log('Audio capture error - check microphone connection')
                break
              case 'service-not-allowed':
                console.log('Speech service not allowed')
                break
              case 'bad-grammar':
              case 'language-not-supported':
                console.log(`Speech recognition error: ${event.error}`)
                break
              default:
                // Only log unexpected errors
                if (!['aborted', 'no-speech', 'network'].includes(event.error)) {
                  console.log(`Speech recognition error: ${event.error}`)
                }
            }
          }

          recognition.onend = () => {
            setState(prev => ({ ...prev, isListening: false }))
            
            // Auto-restart if we should still be listening and no errors occurred
            if (state.isListening && state.isActive && !state.isSpeaking && !state.isProcessing) {
              setTimeout(() => {
                try {
                  if (recognitionRef.current && !state.isListening) {
                    recognitionRef.current.start()
                    setState(prev => ({ ...prev, isListening: true }))
                  }
                } catch (error) {
                  // Silent fail - let user manually restart
                }
              }, 500)
            }
          }

          recognitionRef.current = recognition
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error)
        }
      } else {
        console.warn('Speech recognition not supported in this browser')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startInterview = async () => {
    if (!formData.candidateName || !formData.position || !formData.company) {
      alert('Please fill in all required fields')
      return
    }

    setState(prev => ({ ...prev, isProcessing: true }))

    try {
      // Generate interview questions
      const response = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: formData.position,
          company: formData.company,
          questionTypes: ['behavioral', 'technical', 'general'],
          difficulty: formData.difficulty,
          count: state.questionCount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        isActive: true,
        isProcessing: false,
        interviewId: data.sessionId,
        messages: [{
          id: 'welcome',
          type: 'interviewer',
          text: `Hello ${formData.candidateName}! I'm your AI interviewer today. We'll be conducting an interview for the ${formData.position} position at ${formData.company}. I'll ask you ${state.questionCount} questions, and I'd like you to speak your answers naturally. Are you ready to begin?`,
          timestamp: new Date()
        }]
      }))

      // Speak the welcome message
      await speakText(`Hello ${formData.candidateName}! I'm your AI interviewer today. We'll be conducting an interview for the ${formData.position} position at ${formData.company}. I'll ask you ${state.questionCount} questions, and I'd like you to speak your answers naturally. Are you ready to begin?`)

    } catch (error) {
      console.error('Failed to start interview:', error)
      setState(prev => ({ ...prev, isProcessing: false }))
      alert('Failed to start interview. Please try again.')
    }
  }

  const speakText = async (text: string, voice: string = 'Rachel'): Promise<void> => {
    setState(prev => ({ ...prev, isSpeaking: true }))

    try {
      // Try ElevenLabs TTS first
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const audio = new Audio(audioUrl)
        currentAudioRef.current = audio

        return new Promise((resolve) => {
          audio.onended = () => {
            setState(prev => ({ ...prev, isSpeaking: false }))
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          
          audio.onerror = () => {
            console.warn('Audio playback failed, falling back to browser TTS')
            URL.revokeObjectURL(audioUrl)
            fallbackToWebSpeech(text)
            resolve()
          }

          audio.play().catch((err) => {
            console.warn('Audio play failed:', err)
            URL.revokeObjectURL(audioUrl)
            fallbackToWebSpeech(text)
            resolve()
          })
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('ElevenLabs TTS unavailable:', errorData.error || 'Service error')
        return fallbackToWebSpeech(text)
      }
    } catch (error) {
      console.error('TTS error:', error)
      fallbackToWebSpeech(text)
    }
  }

  const fallbackToWebSpeech = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8

        utterance.onend = () => {
          setState(prev => ({ ...prev, isSpeaking: false }))
          resolve()
        }

        utterance.onerror = () => {
          setState(prev => ({ ...prev, isSpeaking: false }))
          resolve()
        }

        synthRef.current = utterance
        window.speechSynthesis.speak(utterance)
      } else {
        setState(prev => ({ ...prev, isSpeaking: false }))
        resolve()
      }
    })
  }

  const startListening = () => {
    if (recognitionRef.current && !state.isListening) {
      try {
        setState(prev => ({ ...prev, isListening: true }))
        recognitionRef.current.start()
      } catch (error: any) {
        setState(prev => ({ ...prev, isListening: false }))
        
        if (error.name === 'InvalidStateError') {
          // Speech recognition already running, stop and retry
          recognitionRef.current.stop()
          setTimeout(() => {
            try {
              if (!state.isListening) { // Double-check state hasn't changed
                recognitionRef.current.start()
                setState(prev => ({ ...prev, isListening: true }))
              }
            } catch (retryError) {
              // Silent fail - user can try again manually
            }
          }, 1000) // Longer delay to prevent rapid cycling
        }
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
      setState(prev => ({ ...prev, isListening: false }))
    }
  }

  const handleCandidateResponse = async (response: string) => {
    if (!response.trim()) return

    stopListening()

    const candidateMessage: InterviewMessage = {
      id: `candidate-${Date.now()}`,
      type: 'candidate',
      text: response,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, candidateMessage],
      isProcessing: true
    }))

    try {
      // Submit response for analysis
      const analysisResponse = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: { 
            id: state.currentIndex,
            question: state.currentQuestion,
            type: 'general'
          },
          userResponse: response,
          context: {
            position: formData.position,
            company: formData.company
          }
        })
      })

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze response')
      }

      // Move to next question or complete interview
      if (state.currentIndex < state.questionCount - 1) {
        await askNextQuestion()
      } else {
        await completeInterview()
      }

    } catch (error) {
      console.error('Failed to process response:', error)
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const askNextQuestion = async () => {
    const nextIndex = state.currentIndex + 1
    
    // Generate next question based on previous responses
    const nextQuestion = generateNextQuestion(nextIndex)
    
    const questionMessage: InterviewMessage = {
      id: `question-${nextIndex}`,
      type: 'interviewer',
      text: nextQuestion,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      currentQuestion: nextQuestion,
      messages: [...prev.messages, questionMessage],
      isProcessing: false
    }))

    // Speak the question
    await speakText(nextQuestion)

    // Start listening for response after a brief pause
    setTimeout(startListening, 1000)
  }

  const generateNextQuestion = (index: number): string => {
    const questions = [
      `Tell me about yourself and why you're interested in the ${formData.position} role at ${formData.company}.`,
      `Describe a challenging project you've worked on and how you overcame the difficulties.`,
      `How do you handle working under pressure and tight deadlines?`,
      `What are your greatest strengths and how would they benefit our team?`,
      `Where do you see yourself in 5 years, and how does this role fit into your career goals?`
    ]

    return questions[index] || `What questions do you have about the ${formData.position} role or ${formData.company}?`
  }

  const completeInterview = async () => {
    const completionMessage: InterviewMessage = {
      id: 'completion',
      type: 'interviewer',
      text: `Thank you for completing the interview, ${formData.candidateName}. I'm now generating your comprehensive performance summary and analysis. This will just take a moment.`,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, completionMessage],
      isProcessing: true
    }))

    // Speak completion message
    await speakText(completionMessage.text)

    try {
      // Mock user for summary generation
      const user = {
        id: 'demo-user',
        email: 'demo@example.com'
      }

      // Generate comprehensive summary
      const summaryResponse = await fetch('/api/interview/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: state.interviewId,
          userId: user.id
        })
      })

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary')
      }

      const summaryData = await summaryResponse.json()
      setInterviewSummary(summaryData.summary)
      setShowSummary(true)

      setState(prev => ({
        ...prev,
        isActive: false,
        isProcessing: false
      }))

      if (onComplete && state.interviewId) {
        onComplete(state.interviewId)
      }

    } catch (error) {
      console.error('Failed to generate summary:', error)
      setState(prev => ({ ...prev, isProcessing: false }))
      alert('Interview completed, but failed to generate summary. You can view it later in your history.')
    }
  }

  const resetInterview = () => {
    setState({
      isActive: false,
      currentQuestion: '',
      questionCount: 5,
      currentIndex: 0,
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      messages: []
    })
    setShowSummary(false)
    setInterviewSummary(null)
  }

  // Show interview summary
  if (showSummary && interviewSummary) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Interview Complete
            </CardTitle>
            <CardDescription>
              {formData.position} at {formData.company} • {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {interviewSummary.overallScore}%
              </div>
              <div className="text-lg text-gray-600">Overall Performance</div>
              <Progress value={interviewSummary.overallScore} className="w-full mt-2" />
            </div>

            {/* Generated Image */}
            {interviewSummary.imageUrl && (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Performance Visualization
                </h3>
                <img 
                  src={interviewSummary.imageUrl} 
                  alt="Interview Performance Visualization"
                  className="mx-auto rounded-lg shadow-lg max-w-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Performance Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Key Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewSummary.analysis.keyStrengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {interviewSummary.analysis.improvementAreas.map((area: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{interviewSummary.analysis.overallAssessment}</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {interviewSummary.analysis.communicationScore}/10
                    </div>
                    <div className="text-sm text-gray-600">Communication</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {interviewSummary.analysis.technicalScore}/10
                    </div>
                    <div className="text-sm text-gray-600">Technical Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold capitalize text-green-600">
                      {interviewSummary.analysis.confidenceLevel}
                    </div>
                    <div className="text-sm text-gray-600">Confidence Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {interviewSummary.analysis.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={resetInterview} variant="outline">
                Take Another Interview
              </Button>
              <Button onClick={() => window.print()}>
                Save Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show active interview
  if (state.isActive) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Interview Session</CardTitle>
                <CardDescription>
                  {formData.position} at {formData.company}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Question Progress</div>
                <div className="font-semibold">{state.currentIndex + 1} / {state.questionCount}</div>
              </div>
            </div>
            <Progress value={(state.currentIndex / state.questionCount) * 100} />
          </CardHeader>
          
          <CardContent>
            {/* Conversation Display */}
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {state.messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === 'interviewer' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'interviewer' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'interviewer' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg ${
                    message.type === 'interviewer' 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'bg-gray-50 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {state.isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Processing your response...</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                {state.isSpeaking && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Waves className="w-5 h-5 animate-pulse" />
                    <span className="text-sm">AI is speaking...</span>
                  </div>
                )}
                
                {!state.isSpeaking && !state.isProcessing && (
                  <Button
                    onClick={state.isListening ? stopListening : startListening}
                    className={state.isListening ? 'bg-red-500 hover:bg-red-600' : ''}
                    size="lg"
                  >
                    {state.isListening ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop Speaking
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Speaking
                      </>
                    )}
                  </Button>
                )}
                
                {state.isListening && (
                  <div className="flex items-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Listening...</span>
                  </div>
                )}
              </div>

              {/* Text input fallback */}
              {!state.isSpeaking && !state.isProcessing && (
                <div className="max-w-md mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="Or type your response here..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && userResponse.trim()) {
                          handleCandidateResponse(userResponse.trim())
                          setUserResponse('')
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (userResponse.trim()) {
                          handleCandidateResponse(userResponse.trim())
                          setUserResponse('')
                        }
                      }}
                      disabled={!userResponse.trim()}
                      variant="outline"
                    >
                      Send
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Use voice or type your responses
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show setup form
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Start Your AI Interview</CardTitle>
          <CardDescription>
            Experience a realistic interview with our AI interviewer who will speak questions aloud and listen to your responses
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <Input
              value={formData.candidateName}
              onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <Input
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="e.g. Software Engineer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="e.g. Google, Microsoft, Startup"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty Level</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
            >
              <option value="easy">Easy - Entry Level</option>
              <option value="medium">Medium - Mid Level</option>
              <option value="hard">Hard - Senior Level</option>
            </select>
          </div>
          
          <Button 
            onClick={startInterview}
            disabled={state.isProcessing}
            className="w-full"
          >
            {state.isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Interview...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Begin Interview
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}