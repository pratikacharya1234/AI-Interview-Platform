/**
 * GET /api/interview/voice/feedback/[sessionId]
 *
 * Retrieves detailed feedback for a specific interview session
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/auth/supabase-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Get session ID from params
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get session with all details
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        interview_qa (
          id,
          question_number,
          question_text,
          answer_text,
          question_audio_url,
          answer_audio_url,
          answer_duration,
          score,
          relevance_score,
          clarity_score,
          confidence_score,
          feedback,
          asked_at,
          answered_at
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    // Get performance metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError)
    }

    // Organize metrics by type
    const metricsMap: Record<string, number> = {}
    metrics?.forEach(metric => {
      metricsMap[metric.metric_type] = metric.metric_value
    })

    // Calculate question-level statistics
    const answeredQuestions = session.interview_qa?.filter(
      (qa: any) => qa.answer_text
    ) || []

    const questionStats = answeredQuestions.map((qa: any) => ({
      questionNumber: qa.question_number,
      question: qa.question_text,
      answer: qa.answer_text,
      questionAudioUrl: qa.question_audio_url,
      answerAudioUrl: qa.answer_audio_url,
      answerDuration: qa.answer_duration,
      scores: {
        overall: qa.score,
        relevance: qa.relevance_score,
        clarity: qa.clarity_score,
        confidence: qa.confidence_score,
      },
      feedback: qa.feedback,
      askedAt: qa.asked_at,
      answeredAt: qa.answered_at,
    }))

    // Calculate overall statistics
    const totalScore = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.score || 0),
      0
    )
    const averageScore = answeredQuestions.length > 0
      ? Math.round(totalScore / answeredQuestions.length)
      : 0

    const totalRelevance = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.relevance_score || 0),
      0
    )
    const averageRelevance = answeredQuestions.length > 0
      ? Math.round(totalRelevance / answeredQuestions.length)
      : 0

    const totalClarity = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.clarity_score || 0),
      0
    )
    const averageClarity = answeredQuestions.length > 0
      ? Math.round(totalClarity / answeredQuestions.length)
      : 0

    const totalConfidence = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.confidence_score || 0),
      0
    )
    const averageConfidence = answeredQuestions.length > 0
      ? Math.round(totalConfidence / answeredQuestions.length)
      : 0

    // Generate strengths and weaknesses from question feedback
    const strengths: string[] = []
    const improvements: string[] = []

    answeredQuestions.forEach((qa: any) => {
      if (qa.score >= 80 && qa.feedback) {
        strengths.push(`Q${qa.question_number}: ${qa.feedback}`)
      } else if (qa.score < 60 && qa.feedback) {
        improvements.push(`Q${qa.question_number}: ${qa.feedback}`)
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        role: session.role,
        position: session.position,
        difficulty: session.difficulty,
        industry: session.industry,
        status: session.status,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        duration: session.duration_minutes,
        totalQuestions: session.total_questions,
        averageResponseTime: session.average_response_time,
      },
      scores: {
        overall: session.overall_score || averageScore,
        communication: metricsMap.communication_skills || averageClarity,
        technical: metricsMap.technical_skills || 0,
        confidence: metricsMap.confidence_level || averageConfidence,
        relevance: metricsMap.average_relevance || averageRelevance,
        clarity: metricsMap.average_clarity || averageClarity,
      },
      questions: questionStats,
      feedback: {
        strengths: strengths.slice(0, 5),
        improvements: improvements.slice(0, 5),
        overallFeedback: session.feedback_summary || 'Detailed feedback will be available after all questions are answered.',
      },
      metrics: metricsMap,
    })
  } catch (error: any) {
    console.error('Error fetching feedback:', error)

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve interview feedback',
      },
      { status: 500 }
    )
  }
}
