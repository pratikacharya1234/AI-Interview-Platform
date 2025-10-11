'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useInterview } from '@/hooks/useInterview'
import { QuestionType } from '@/lib/gemini'
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
  Target,
  BarChart3,
  MessageSquare,
  Lightbulb,
  Award,
  Waves,
  AlertCircle
} from 'lucide-react'

interface VoiceInterviewStartFormProps {
  onStart: (data: {
    candidateName: string
    position: string
    company: string
    questionTypes: QuestionType[]
    difficulty: 'easy' | 'medium' | 'hard'
    questionCount: number
  }) => void
  isLoading: boolean
}

function VoiceInterviewStartForm({ onStart, isLoading }: VoiceInterviewStartFormProps) {
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    company: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 5
  })
  
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['technical'])
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [testingMic, setTestingMic] = useState(false)

  const questionTypeOptions = [
    { 
      type: 'technical' as QuestionType, 
      label: 'Technical Skills', 
      description: 'Algorithm, data structures, system design',
      icon: BarChart3
    },
    { 
      type: 'behavioral' as QuestionType, 
      label: 'Behavioral', 
      description: 'Teamwork, leadership, problem-solving',
      icon: MessageSquare
    },
    { 
      type: 'situational' as QuestionType, 
      label: 'Situational', 
      description: 'Hypothetical scenarios and decisions',
      icon: Lightbulb
    },
    { 
      type: 'experience' as QuestionType, 
      label: 'Experience', 
      description: 'Past projects and achievements',
      icon: Award
    }
  ]

  const requestMicrophonePermission = async () => {
    setTestingMic(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicrophonePermission('granted')
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setMicrophonePermission('denied')
    }
    setTestingMic(false)
  }

  useEffect(() => {
    // Check if microphone is already granted
    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then(permission => {
        setMicrophonePermission(permission.state as 'granted' | 'denied' | 'prompt')
      })
      .catch(() => {
        // Fallback: try to access microphone directly
        requestMicrophonePermission()
      })
  }, [])

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypes.length === 0 || microphonePermission !== 'granted') return
    
    onStart({
      candidateName: formData.candidateName,
      position: formData.position,
      company: formData.company || '',
      questionTypes: selectedTypes,
      difficulty: formData.difficulty,
      questionCount: formData.questionCount
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Waves className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Voice AI Interview</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Speak naturally with our AI interviewer powered by Google Gemini
        </p>
      </div>

      {/* Microphone Permission Check */}
      {microphonePermission !== 'granted' && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-amber-800 dark:text-amber-200">
              Microphone Access Required
            </h3>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Voice interviews require microphone access to record your responses and enable natural conversation with AI.
          </p>
          <Button
            onClick={requestMicrophonePermission}
            disabled={testingMic}
            className="w-full"
            variant="outline"
          >
            {testingMic ? 'Testing Microphone...' : 'Enable Microphone'}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            value={formData.candidateName}
            onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
            required
            placeholder="Enter your full name"
          />
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            required
            placeholder="e.g. Software Engineer"
          />
        </div>

        <Input
          label="Company (Optional)"
          value={formData.company}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          placeholder="e.g. Google, Microsoft, Startup"
        />

        <div>
          <label className="block text-sm font-medium mb-3">
            Interview Focus Areas
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {questionTypeOptions.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleQuestionType(type)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedTypes.includes(type)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${
                    selectedTypes.includes(type) ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className="font-medium mb-1">{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedTypes.length === 0 && (
            <p className="text-sm text-red-500 mt-2">Please select at least one question type.</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="easy">Easy - Entry Level</option>
              <option value="medium">Medium - Mid Level</option>
              <option value="hard">Hard - Senior Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Questions
            </label>
            <select
              value={formData.questionCount}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                questionCount: parseInt(e.target.value) 
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value={3}>3 Questions (~15 min)</option>
              <option value={5}>5 Questions (~25 min)</option>
              <option value={7}>7 Questions (~35 min)</option>
              <option value={10}>10 Questions (~50 min)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={selectedTypes.length === 0 || isLoading || microphonePermission !== 'granted'}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Preparing Interview...' : 'Start Voice Interview'}
        </Button>
      </form>
    </div>
  )
}

interface VoiceQuestionDisplayProps {
  question: any
  questionNumber: number
  totalQuestions: number
  onSubmit: (answer: string, audioBlob?: Blob) => void
  isLoading: boolean
}

function VoiceQuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onSubmit, 
  isLoading 
}: VoiceQuestionDisplayProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'en-US'

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setTranscription(prev => prev + finalTranscript)
          }
        }

        setRecognition(recognitionInstance)
      }

      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Read question aloud when component loads
  useEffect(() => {
    if (question && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(question.text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      
      synthRef.current.speak(utterance)
    }
  }, [question])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start speech recognition
      if (recognition) {
        recognition.start()
      }
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    // Stop speech recognition
    if (recognition) {
      recognition.stop()
    }
  }

  const handleSubmit = () => {
    if (transcription.trim()) {
      onSubmit(transcription.trim(), audioBlob || undefined)
      setTranscription('')
      setAudioBlob(null)
    }
  }

  const replayQuestion = () => {
    if (question && synthRef.current) {
      synthRef.current.cancel() // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(question.text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      
      synthRef.current.speak(utterance)
    }
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'technical': return BarChart3
      case 'behavioral': return MessageSquare
      case 'situational': return Lightbulb
      case 'experience': return Award
      default: return MessageSquare
    }
  }

  const Icon = getQuestionIcon(question?.type || 'behavioral')

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">
              Question {questionNumber} of {totalQuestions}
            </h2>
          </div>
          <Badge variant="secondary">
            {question?.type || 'Interview'} Question
          </Badge>
        </div>
        
        <Progress 
          value={(questionNumber / totalQuestions) * 100} 
          className="mb-6"
        />
      </div>

      <div className="mb-8">
        <div className="flex items-start gap-4 mb-6">
          <Icon className="w-6 h-6 text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-3">Interview Question:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-lg leading-relaxed">{question?.text}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={replayQuestion}
                variant="outline"
                disabled={isPlaying}
                size="sm"
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Replay Question
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isPlaying}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {isRecording ? 'Recording your answer... Click to stop' : 'Click to start recording your answer'}
            </p>
            
            {isRecording && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-medium">Recording</span>
              </div>
            )}
          </div>

          {/* Live Transcription */}
          {transcription && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Your Response (Live Transcription):</label>
              <div className="bg-white dark:bg-gray-900 p-4 rounded border min-h-[100px]">
                <p className="text-gray-900 dark:text-white">{transcription}</p>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {transcription ? `${transcription.split(' ').length} words recorded` : 'Start speaking to see transcription'}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!transcription.trim() || isLoading || isRecording}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  Next Question
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component
export default function VoiceInterviewComponent() {
  const interview = useInterview()
  const [session, setSession] = useState<any>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [hasResponses, setHasResponses] = useState(false)

  const resetInterview = () => {
    interview.resetInterview()
    setSession(null)
    setIsSessionActive(false)
    setHasResponses(false)
  }

  const handleStart = async (formData: any) => {
    try {
      await interview.startInterview(
        formData.candidateName,
        formData.position,
        formData.company,
        formData.questionTypes,
        formData.difficulty,
        formData.questionCount
      )
      setSession(formData)
      setIsSessionActive(true)
    } catch (error) {
      console.error('Failed to start interview:', error)
    }
  }

  const handleAnswerSubmit = async (answer: string, audioBlob?: Blob) => {
    try {
      // Submit the answer using the existing interface
      await interview.submitAnswer(answer)
      setHasResponses(true)
      
      // Store audio data if available (for future enhancement)
      if (audioBlob && interview.currentQuestion) {
        // TODO: Integrate audio storage with Supabase
        console.log('Audio blob captured for future processing:', audioBlob.size, 'bytes')
      }
      
      if (interview.isLastQuestion) {
        setIsSessionActive(false)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
      // For now, just log the error - the interview hook handles error state
    }
  }

  // Show completion screen
  if (session && !isSessionActive && hasResponses) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Voice Interview Complete!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for completing your voice interview. Your responses have been recorded and analyzed.
        </p>
        <Button onClick={resetInterview} className="w-full">
          Start New Interview
        </Button>
      </div>
    )
  }

  // Show start form
  if (!session || !isSessionActive) {
    return <VoiceInterviewStartForm onStart={handleStart} isLoading={interview.isLoading} />
  }

  // Show question
  if (interview.currentQuestion) {
    return (
      <VoiceQuestionDisplay
        question={interview.currentQuestion}
        questionNumber={interview.currentQuestionIndex + 1}
        totalQuestions={interview.session?.questions.length || 0}
        onSubmit={handleAnswerSubmit}
        isLoading={interview.isLoading}
      />
    )
  }

  return null
}