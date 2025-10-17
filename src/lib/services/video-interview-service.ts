/**
 * Video Interview Service
 * Handles real-time video interview sessions with STT, LLM, and TTS
 */

import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Gemini AI - only if API key is available
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// Initialize Anthropic - only if API key is available
const anthropic = process.env.CLAUDE_API_KEY
  ? new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    })
  : null

// ============================================================================
// TYPES
// ============================================================================

export interface VideoInterviewSession {
  id: string
  user_id: string
  persona_id: string
  job_title: string
  interview_type: 'technical' | 'behavioral' | 'system-design'
  difficulty: 'easy' | 'medium' | 'hard'
  start_time: string
  end_time?: string
  duration_seconds?: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  video_enabled: boolean
  audio_enabled: boolean
  recording_url?: string
  total_questions: number
  total_responses: number
  summary_text?: string
}

export interface VideoTranscript {
  id: string
  session_id: string
  speaker: 'user' | 'ai'
  speaker_name?: string
  text: string
  language: string
  audio_url?: string
  audio_duration_ms?: number
  speech_pace?: number
  pause_count?: number
  filler_word_count?: number
  volume_level?: number
  timestamp: string
  sequence_number: number
  confidence_score?: number
  processed: boolean
}

export interface VideoFeedback {
  id: string
  session_id: string
  transcript_id?: string
  technical_score?: number
  clarity_score?: number
  confidence_score?: number
  behavioral_score?: number
  technical_feedback?: string
  clarity_feedback?: string
  confidence_feedback?: string
  behavioral_feedback?: string
  has_situation?: boolean
  has_task?: boolean
  has_action?: boolean
  has_result?: boolean
  speech_quality_score?: number
  filler_words_detected?: string[]
  pause_analysis?: any
  overall_score?: number
  feedback_summary?: string
  improvement_suggestions?: string[]
  evaluator_model: string
}

export interface LiveMetrics {
  session_id: string
  current_question_number: number
  rolling_technical_avg?: number
  rolling_clarity_avg?: number
  rolling_confidence_avg?: number
  rolling_behavioral_avg?: number
  questions_completed: number
  estimated_time_remaining?: number
  current_speech_pace?: number
  current_volume?: number
  silence_duration_ms?: number
  eye_contact_score?: number
  posture_score?: number
}

export interface FinalReport {
  session_id: string
  avg_technical_score?: number
  avg_clarity_score?: number
  avg_confidence_score?: number
  avg_behavioral_score?: number
  overall_score?: number
  strengths?: string[]
  weaknesses?: string[]
  key_highlights?: string[]
  immediate_improvements?: string[]
  practice_areas?: string[]
  resources_recommended?: any
  total_speaking_time_seconds?: number
  avg_response_time_seconds?: number
  total_filler_words?: number
  avg_speech_pace?: number
  questions_answered?: number
  questions_skipped?: number
  report_json: any
  percentile_rank?: number
  generator_model: string
}

// ============================================================================
// VIDEO INTERVIEW SERVICE
// ============================================================================

export class VideoInterviewService {
  
  /**
   * Create a new video interview session
   */
  async createSession(
    userId: string,
    personaId: string,
    jobTitle: string,
    interviewType: 'technical' | 'behavioral' | 'system-design',
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<VideoInterviewSession> {
    const { data, error } = await supabase
      .from('video_interview_sessions')
      .insert([{
        user_id: userId,
        persona_id: personaId,
        job_title: jobTitle,
        interview_type: interviewType,
        difficulty: difficulty,
        status: 'active',
        video_enabled: true,
        audio_enabled: true,
        total_questions: 0,
        total_responses: 0
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create session: ${error.message}`)
    
    // Initialize live metrics
    await this.initializeLiveMetrics(data.id)
    
    return data
  }

  /**
   * Initialize live metrics for a session
   */
  async initializeLiveMetrics(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('video_interview_live_metrics')
      .insert([{
        session_id: sessionId,
        current_question_number: 0,
        questions_completed: 0,
        rolling_technical_avg: 0,
        rolling_clarity_avg: 0,
        rolling_confidence_avg: 0,
        rolling_behavioral_avg: 0
      }])

    if (error) throw new Error(`Failed to initialize metrics: ${error.message}`)
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<VideoInterviewSession> {
    const { data, error } = await supabase
      .from('video_interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) throw new Error(`Failed to fetch session: ${error.message}`)
    return data
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: 'active' | 'paused' | 'completed' | 'cancelled'
  ): Promise<void> {
    const updates: any = { status }
    
    if (status === 'completed' || status === 'cancelled') {
      updates.end_time = new Date().toISOString()
    }

    const { error } = await supabase
      .from('video_interview_sessions')
      .update(updates)
      .eq('id', sessionId)

    if (error) throw new Error(`Failed to update session: ${error.message}`)
  }

  /**
   * Add transcript entry
   */
  async addTranscript(
    sessionId: string,
    speaker: 'user' | 'ai',
    text: string,
    sequenceNumber: number,
    metadata?: {
      audio_url?: string
      audio_duration_ms?: number
      speech_pace?: number
      pause_count?: number
      filler_word_count?: number
      volume_level?: number
      confidence_score?: number
    }
  ): Promise<VideoTranscript> {
    const { data, error } = await supabase
      .from('video_interview_transcripts')
      .insert([{
        session_id: sessionId,
        speaker: speaker,
        text: text,
        sequence_number: sequenceNumber,
        language: 'en',
        processed: false,
        ...metadata
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to add transcript: ${error.message}`)
    
    // Update session response count
    if (speaker === 'user') {
      await this.incrementResponseCount(sessionId)
    }
    
    return data
  }

  /**
   * Get all transcripts for a session
   */
  async getTranscripts(sessionId: string): Promise<VideoTranscript[]> {
    const { data, error } = await supabase
      .from('video_interview_transcripts')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: true })

    if (error) throw new Error(`Failed to fetch transcripts: ${error.message}`)
    return data || []
  }

  /**
   * Add feedback for a response
   */
  async addFeedback(feedback: Omit<VideoFeedback, 'id'>): Promise<VideoFeedback> {
    const { data, error } = await supabase
      .from('video_interview_feedback')
      .insert([feedback])
      .select()
      .single()

    if (error) throw new Error(`Failed to add feedback: ${error.message}`)
    
    // Update live metrics
    await this.updateLiveMetrics(feedback.session_id)
    
    return data
  }

  /**
   * Update live metrics with rolling averages
   */
  async updateLiveMetrics(sessionId: string): Promise<void> {
    // Get all feedback for this session
    const { data: feedbacks } = await supabase
      .from('video_interview_feedback')
      .select('*')
      .eq('session_id', sessionId)

    if (!feedbacks || feedbacks.length === 0) return

    // Calculate rolling averages
    const avgTechnical = feedbacks
      .filter(f => f.technical_score)
      .reduce((sum, f) => sum + (f.technical_score || 0), 0) / feedbacks.filter(f => f.technical_score).length

    const avgClarity = feedbacks
      .filter(f => f.clarity_score)
      .reduce((sum, f) => sum + (f.clarity_score || 0), 0) / feedbacks.filter(f => f.clarity_score).length

    const avgConfidence = feedbacks
      .filter(f => f.confidence_score)
      .reduce((sum, f) => sum + (f.confidence_score || 0), 0) / feedbacks.filter(f => f.confidence_score).length

    const avgBehavioral = feedbacks
      .filter(f => f.behavioral_score)
      .reduce((sum, f) => sum + (f.behavioral_score || 0), 0) / feedbacks.filter(f => f.behavioral_score).length

    // Update metrics
    await supabase
      .from('video_interview_live_metrics')
      .update({
        rolling_technical_avg: isNaN(avgTechnical) ? null : avgTechnical,
        rolling_clarity_avg: isNaN(avgClarity) ? null : avgClarity,
        rolling_confidence_avg: isNaN(avgConfidence) ? null : avgConfidence,
        rolling_behavioral_avg: isNaN(avgBehavioral) ? null : avgBehavioral,
        questions_completed: feedbacks.length
      })
      .eq('session_id', sessionId)
  }

  /**
   * Get live metrics for a session
   */
  async getLiveMetrics(sessionId: string): Promise<LiveMetrics | null> {
    const { data, error } = await supabase
      .from('video_interview_live_metrics')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) return null
    return data
  }

  /**
   * Add a question to the session
   */
  async addQuestion(
    sessionId: string,
    questionText: string,
    questionType: string,
    sequenceNumber: number,
    generatedByModel: string,
    previousAnswerId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('video_interview_questions')
      .insert([{
        session_id: sessionId,
        question_text: questionText,
        question_type: questionType,
        sequence_number: sequenceNumber,
        generated_by_model: generatedByModel,
        previous_answer_id: previousAnswerId,
        is_follow_up: !!previousAnswerId
      }])

    if (error) throw new Error(`Failed to add question: ${error.message}`)
    
    // Increment question count
    await this.incrementQuestionCount(sessionId)
  }

  /**
   * Increment question count
   */
  private async incrementQuestionCount(sessionId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_question_count', {
      session_id: sessionId
    })

    if (error) {
      // Fallback if function doesn't exist
      const { data: session } = await supabase
        .from('video_interview_sessions')
        .select('total_questions')
        .eq('id', sessionId)
        .single()

      if (session) {
        await supabase
          .from('video_interview_sessions')
          .update({ total_questions: (session.total_questions || 0) + 1 })
          .eq('id', sessionId)
      }
    }
  }

  /**
   * Increment response count
   */
  private async incrementResponseCount(sessionId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_video_response_count', {
      session_id: sessionId
    })

    if (error) {
      // Fallback
      const { data: session } = await supabase
        .from('video_interview_sessions')
        .select('total_responses')
        .eq('id', sessionId)
        .single()

      if (session) {
        await supabase
          .from('video_interview_sessions')
          .update({ total_responses: (session.total_responses || 0) + 1 })
          .eq('id', sessionId)
      }
    }
  }

  /**
   * Generate final report
   */
  async generateFinalReport(sessionId: string): Promise<FinalReport> {
    // Get all feedback
    const { data: feedbacks } = await supabase
      .from('video_interview_feedback')
      .select('*')
      .eq('session_id', sessionId)

    // Get all transcripts
    const transcripts = await this.getTranscripts(sessionId)
    
    // Get session
    const session = await this.getSession(sessionId)

    if (!feedbacks || feedbacks.length === 0) {
      throw new Error('No feedback data available for report generation')
    }

    // Calculate aggregate scores
    const avgTechnical = this.calculateAverage(feedbacks.map(f => f.technical_score))
    const avgClarity = this.calculateAverage(feedbacks.map(f => f.clarity_score))
    const avgConfidence = this.calculateAverage(feedbacks.map(f => f.confidence_score))
    const avgBehavioral = this.calculateAverage(feedbacks.map(f => f.behavioral_score))
    const overallScore = this.calculateAverage([avgTechnical, avgClarity, avgConfidence, avgBehavioral])

    // Extract strengths and weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []
    
    if (avgTechnical && avgTechnical >= 7) strengths.push('Strong technical knowledge')
    if (avgClarity && avgClarity >= 7) strengths.push('Clear communication')
    if (avgConfidence && avgConfidence >= 7) strengths.push('Confident delivery')
    if (avgBehavioral && avgBehavioral >= 7) strengths.push('Good behavioral responses')
    
    if (avgTechnical && avgTechnical < 6) weaknesses.push('Technical knowledge needs improvement')
    if (avgClarity && avgClarity < 6) weaknesses.push('Communication clarity needs work')
    if (avgConfidence && avgConfidence < 6) weaknesses.push('Build more confidence')
    if (avgBehavioral && avgBehavioral < 6) weaknesses.push('Practice STAR method responses')

    // Calculate metrics
    const userTranscripts = transcripts.filter(t => t.speaker === 'user')
    const totalSpeakingTime = userTranscripts.reduce((sum, t) => sum + (t.audio_duration_ms || 0), 0) / 1000
    const totalFillerWords = userTranscripts.reduce((sum, t) => sum + (t.filler_word_count || 0), 0)
    const avgSpeechPace = this.calculateAverage(userTranscripts.map(t => t.speech_pace))

    // Build report JSON
    const reportJson = {
      session_summary: {
        job_title: session.job_title,
        interview_type: session.interview_type,
        difficulty: session.difficulty,
        duration_seconds: session.duration_seconds,
        total_questions: session.total_questions,
        total_responses: session.total_responses
      },
      scores: {
        technical: avgTechnical,
        clarity: avgClarity,
        confidence: avgConfidence,
        behavioral: avgBehavioral,
        overall: overallScore
      },
      performance: {
        strengths,
        weaknesses,
        total_speaking_time_seconds: totalSpeakingTime,
        avg_speech_pace: avgSpeechPace,
        total_filler_words: totalFillerWords
      },
      recommendations: this.generateRecommendations(feedbacks, avgTechnical, avgClarity, avgConfidence, avgBehavioral)
    }

    // Store report
    const { data: report, error } = await supabase
      .from('video_interview_reports')
      .insert([{
        session_id: sessionId,
        avg_technical_score: avgTechnical,
        avg_clarity_score: avgClarity,
        avg_confidence_score: avgConfidence,
        avg_behavioral_score: avgBehavioral,
        overall_score: overallScore,
        strengths,
        weaknesses,
        total_speaking_time_seconds: Math.round(totalSpeakingTime),
        avg_speech_pace: avgSpeechPace,
        total_filler_words: totalFillerWords,
        questions_answered: session.total_responses,
        report_json: reportJson,
        generator_model: 'gpt-4'
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to generate report: ${error.message}`)
    
    return report
  }

  /**
   * Calculate average of numbers (ignoring null/undefined)
   */
  private calculateAverage(numbers: (number | null | undefined)[]): number | undefined {
    const validNumbers = numbers.filter(n => n !== null && n !== undefined) as number[]
    if (validNumbers.length === 0) return undefined
    return validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(
    feedbacks: any[],
    avgTechnical?: number,
    avgClarity?: number,
    avgConfidence?: number,
    avgBehavioral?: number
  ): string[] {
    const recommendations: string[] = []

    if (avgTechnical && avgTechnical < 7) {
      recommendations.push('Review fundamental technical concepts for your role')
      recommendations.push('Practice coding problems on LeetCode or HackerRank')
    }

    if (avgClarity && avgClarity < 7) {
      recommendations.push('Practice explaining technical concepts in simple terms')
      recommendations.push('Record yourself and review for clarity improvements')
    }

    if (avgConfidence && avgConfidence < 7) {
      recommendations.push('Reduce filler words (um, uh, like) in your responses')
      recommendations.push('Practice maintaining steady speech pace')
    }

    if (avgBehavioral && avgBehavioral < 7) {
      recommendations.push('Use the STAR method for behavioral questions')
      recommendations.push('Prepare specific examples from your experience')
    }

    return recommendations
  }

  /**
   * Get final report
   */
  async getReport(sessionId: string): Promise<FinalReport | null> {
    const { data, error } = await supabase
      .from('video_interview_reports')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) return null
    return data
  }

  /**
   * Track WebSocket connection
   */
  async trackConnection(
    sessionId: string,
    userId: string,
    socketId: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<void> {
    await supabase
      .from('video_interview_connections')
      .insert([{
        session_id: sessionId,
        user_id: userId,
        socket_id: socketId,
        client_ip: clientIp,
        user_agent: userAgent,
        is_active: true
      }])
  }

  /**
   * Mark connection as disconnected
   */
  async disconnectConnection(socketId: string): Promise<void> {
    await supabase
      .from('video_interview_connections')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString()
      })
      .eq('socket_id', socketId)
  }
}

export const videoInterviewService = new VideoInterviewService()
