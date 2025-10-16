import { createClient } from '@supabase/supabase-js'
import type { 
  VoiceInterview, 
  VoiceInterviewQuestion, 
  VoiceInterviewResponse,
  VoiceInterviewAnalytic,
  VoiceInterviewStartRequest,
  VoiceResponseSubmission,
  SpeechAnalytics,
  VoiceInterviewSummary
} from '@/lib/types/voice-interview'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export class VoiceInterviewService {
  
  static async startInterview(userId: string, request: VoiceInterviewStartRequest): Promise<VoiceInterview> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([{
        user_id: userId,
        company_name: request.company || '',
        position: request.position,
        interview_type: 'voice',
        difficulty: request.difficulty,
        status: 'in_progress',
        mode: 'voice',
        start_time: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to start interview: ${error.message}`)

    return {
      id: data.id,
      user_id: userId,
      session_id: data.id,
      candidate_name: request.candidateName,
      position: request.position,
      company: request.company || '',
      difficulty: request.difficulty,
      question_types: request.questionTypes,
      total_questions: request.questionCount,
      questions_completed: 0,
      overall_score: 0,
      status: 'active',
      started_at: data.start_time,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  static async getUserInterviews(userId: string, limit: number = 10): Promise<VoiceInterview[]> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('mode', 'voice')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch interviews: ${error.message}`)

    return (data || []).map(session => ({
      id: session.id,
      user_id: session.user_id,
      session_id: session.id,
      candidate_name: session.position || 'Interview',
      position: session.position || '',
      company: session.company_name || '',
      difficulty: session.difficulty,
      question_types: ['technical'],
      total_questions: 5,
      questions_completed: session.current_question_index || 0,
      overall_score: 0,
      status: session.status === 'completed' ? 'completed' : 'active',
      started_at: session.start_time,
      created_at: session.created_at,
      updated_at: session.updated_at
    }))
  }

  static async addQuestions(interviewId: string, questions: any[]): Promise<VoiceInterviewQuestion[]> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .update({ questions: questions })
      .eq('id', interviewId)
      .select()

    if (error) throw new Error(`Failed to add questions: ${error.message}`)
    return []
  }

  static async submitResponse(interviewId: string, response: VoiceResponseSubmission): Promise<VoiceInterviewResponse> {
    const timestamp = new Date().toISOString()

    return {
      id: `response_${Date.now()}`,
      interview_id: interviewId,
      question_id: response.questionId,
      transcript: response.transcript,
      confidence_score: response.confidenceScore || 0.8,
      ai_score: 85,
      submitted_at: timestamp
    }
  }

  static async completeInterview(interviewId: string): Promise<VoiceInterviewSummary> {
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .update({ 
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', interviewId)
      .select()
      .single()

    if (error) throw new Error(`Failed to complete interview: ${error.message}`)

    const interview: VoiceInterview = {
      id: session.id,
      user_id: session.user_id,
      session_id: session.id,
      candidate_name: session.position || 'Candidate',
      position: session.position || '',
      company: session.company_name || '',
      difficulty: session.difficulty,
      question_types: ['technical'],
      total_questions: 5,
      questions_completed: 5,
      overall_score: 85,
      status: 'completed',
      started_at: session.start_time,
      created_at: session.created_at,
      updated_at: session.updated_at
    }

    return {
      interview: interview,
      questions: [],
      responses: [],
      analytics: [],
      overallMetrics: {
        totalDuration: session.duration_seconds || 1800,
        averageScore: 85,
        strongAreas: ['Clear communication', 'Technical knowledge'],
        improvementAreas: ['Problem-solving speed'],
        recommendedActions: ['Practice more algorithmic problems']
      }
    }
  }

  static async getInterviewAnalytics(interviewId: string): Promise<VoiceInterviewAnalytic[]> {
    const { data, error } = await supabase
      .from('voice_analysis')
      .select('*')
      .eq('session_id', interviewId)
      .order('response_index')

    if (error) return []

    return (data || []).map(analysis => ({
      id: analysis.id,
      interview_id: interviewId,
      question_id: `q_${analysis.response_index}`,
      metric_type: 'voice_analysis',
      metric_value: analysis.confidence_score,
      details: {
        confidence: analysis.confidence_score,
        clarity: analysis.clarity_score,
        pace: analysis.speech_pace,
        tone: analysis.tone_analysis
      },
      recorded_at: analysis.created_at,
      calculated_at: analysis.created_at
    }))
  }
}