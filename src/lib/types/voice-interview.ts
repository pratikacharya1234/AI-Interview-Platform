// Voice Interview Types
export interface VoiceInterview {
  id: string
  user_id: string
  session_id: string
  candidate_name: string
  position: string
  company?: string
  difficulty: 'easy' | 'medium' | 'hard'
  question_types: string[]
  total_questions: number
  questions_completed: number
  overall_score: number
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface VoiceInterviewQuestion {
  id: string
  interview_id: string
  question_order: number
  question_type: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  question_text: string
  follow_up_points?: string[]
  expected_duration: number
  created_at: string
}

export interface VoiceInterviewResponse {
  id: string
  interview_id: string
  question_id: string
  transcript: string
  audio_url?: string
  audio_duration?: number
  response_time?: number
  word_count?: number
  confidence_score: number
  ai_score: number
  ai_feedback?: string
  strengths?: string[]
  improvements?: string[]
  keywords_mentioned?: string[]
  sentiment_score?: number
  fluency_score?: number
  submitted_at: string
  analyzed_at?: string
}

export interface VoiceInterviewAnalytic {
  id: string
  interview_id: string
  response_id?: string
  metric_type: string
  metric_value: number
  metric_unit?: string
  calculated_at: string
}

// Service interfaces
export interface VoiceInterviewStartRequest {
  candidateName: string
  position: string
  company?: string
  questionTypes: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
}

export interface VoiceResponseSubmission {
  interviewId: string
  questionId: string
  transcript: string
  audioBlob?: Blob
  responseTime?: number
  confidenceScore?: number
}

// Analytics interfaces
export interface SpeechAnalytics {
  wordsPerMinute: number
  pauseFrequency: number
  averagePauseLength: number
  volumeConsistency: number
  clarityScore: number
  sentimentScore: number
  fluencyScore: number
}

export interface InterviewProgress {
  totalQuestions: number
  completedQuestions: number
  currentQuestion: number
  estimatedTimeRemaining: number
  averageResponseTime: number
}

export interface VoiceInterviewSummary {
  interview: VoiceInterview
  questions: VoiceInterviewQuestion[]
  responses: VoiceInterviewResponse[]
  analytics: VoiceInterviewAnalytic[]
  overallMetrics: {
    totalDuration: number
    averageScore: number
    strongAreas: string[]
    improvementAreas: string[]
    recommendedActions: string[]
  }
}