export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface InterviewConfig {
  company: string
  position: string
  department: string
  jobDescription: string
  requirements: string
  experienceLevel: 'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  interviewType: 'technical' | 'behavioral' | 'situational' | 'competency' | 'mixed'
  interviewFocus: string[]
  duration: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

export interface InterviewSession {
  id: string
  userId: string
  config: InterviewConfig
  status: 'setup' | 'ready' | 'active' | 'paused' | 'completed'
  currentStage: 'intro' | 'warmup' | 'core' | 'deep' | 'closing'
  startedAt?: string
  completedAt?: string
  totalQuestions: number
  answeredQuestions: number
}

export interface Question {
  id: string
  text: string
  type: 'opening' | 'technical' | 'behavioral' | 'situational' | 'followup' | 'closing'
  difficulty: number
  stage: string
  expectedDuration: number
  keywords: string[]
  evaluationCriteria: string[]
}

export interface Response {
  id: string
  questionId: string
  transcript: string
  duration: number
  timestamp: string
  analysis?: ResponseAnalysis
}

export interface ResponseAnalysis {
  score: number
  relevance: number
  clarity: number
  depth: number
  confidence: number
  keywords: string[]
  strengths: string[]
  improvements: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface AudioState {
  isRecording: boolean
  isPaused: boolean
  isProcessing: boolean
  isSpeaking: boolean
  audioLevel: number
  recordingTime: number
  currentTranscript: string
  interimTranscript: string
}

export interface InterviewMetrics {
  overallProgress: number
  responseQuality: number
  averageResponseTime: number
  keywordsMatched: number
  confidenceLevel: number
  engagementScore: number
}

export interface InterviewFeedback {
  overallScore: number
  technicalScore: number
  communicationScore: number
  problemSolvingScore: number
  cultureFitScore: number
  strengths: string[]
  areasForImprovement: string[]
  detailedAnalysis: string
  recommendations: string[]
  nextSteps: string[]
}
