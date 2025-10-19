export interface InterviewSession {
  id: string
  interview_id: string
  status: 'initializing' | 'ready' | 'active' | 'paused' | 'completed'
  current_question: string
  question_number: number
}

export interface Transcript {
  id: string
  text: string
  timestamp: number
  confidence: number
  speaker: 'candidate' | 'interviewer'
}

export interface AIEvaluation {
  technical_accuracy: number
  communication_clarity: number
  depth_of_knowledge: number
  problem_solving: number
  relevance: number
  strengths: string[]
  areas_for_improvement: string[]
  follow_up_suggestions: string[]
  overall_score: number
  confidence_level: string
  red_flags: string[]
  positive_indicators: string[]
}

export interface AIResponse {
  assistant_reply: string
  evaluation_json: AIEvaluation
  next_question?: string
  interview_complete: boolean
}

export interface InterviewSummary {
  overall_performance: number
  technical_skills: number
  communication_skills: number
  problem_solving: number
  cultural_fit: number
  strengths: string[]
  weaknesses: string[]
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
  recommendation_reasoning: string
  suggested_next_steps: string[]
  notable_responses: string[]
  red_flags: string[]
  additional_notes: string
}
