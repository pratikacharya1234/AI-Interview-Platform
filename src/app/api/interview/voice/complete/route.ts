/**
 * POST /api/interview/voice/complete
 *
 * Completes a voice interview session and generates comprehensive feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/auth/supabase-auth'
import {
  generateComprehensiveFeedback,
  type InterviewContext,
} from '@/lib/services/gemini-service'
import { z } from 'zod'

const CompleteInterviewSchema = z.object({
  sessionId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Parse and validate request
    const body = await request.json()
    const validation = CompleteInterviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { sessionId } = validation.data

    // Get session with all Q&A pairs
    const supabase = await createServerSupabaseClient()

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

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Interview already completed' },
        { status: 400 }
      )
    }

    // Check if there are answered questions
    const answeredQuestions = session.interview_qa?.filter(
      (qa: any) => qa.answer_text
    ) || []

    if (answeredQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions have been answered yet' },
        { status: 400 }
      )
    }

    // Build interview context for comprehensive feedback
    const context: InterviewContext = {
      role: session.role,
      position: session.position,
      difficulty: session.difficulty,
      industry: session.industry,
      previousQuestions: answeredQuestions.map((qa: any) => ({
        question: qa.question_text,
        answer: qa.answer_text,
        feedback: qa.feedback,
      })),
    }

    // Calculate session duration
    const startedAt = new Date(session.started_at)
    const endedAt = new Date()
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)

    // Generate comprehensive feedback using Gemini
    const comprehensiveFeedback = await generateComprehensiveFeedback(
      context,
      durationSeconds
    )

    // Calculate average scores from individual questions
    const totalScore = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.score || 0),
      0
    )
    const averageScore = Math.round(totalScore / answeredQuestions.length)

    const totalRelevance = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.relevance_score || 0),
      0
    )
    const averageRelevance = Math.round(totalRelevance / answeredQuestions.length)

    const totalClarity = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.clarity_score || 0),
      0
    )
    const averageClarity = Math.round(totalClarity / answeredQuestions.length)

    const totalConfidence = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.confidence_score || 0),
      0
    )
    const averageConfidence = Math.round(totalConfidence / answeredQuestions.length)

    const totalDuration = answeredQuestions.reduce(
      (sum: number, qa: any) => sum + (qa.answer_duration || 0),
      0
    )
    const averageResponseTime = Math.round(totalDuration / answeredQuestions.length)

    // Update session with final scores and status
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        completed_at: endedAt.toISOString(),
        overall_score: comprehensiveFeedback.overallScore,
        duration_minutes: Math.ceil(durationSeconds / 60),
        total_questions: answeredQuestions.length,
        average_response_time: averageResponseTime,
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
    }

    // Store performance metrics
    const metricsToStore = [
      {
        session_id: sessionId,
        user_id: user.id,
        metric_type: 'overall_performance',
        metric_value: comprehensiveFeedback.overallScore,
      },
      {
        session_id: sessionId,
        user_id: user.id,
        metric_type: 'communication_skills',
        metric_value: comprehensiveFeedback.communicationScore,
      },
      {
        session_id: sessionId,
        user_id: user.id,
        metric_type: 'technical_skills',
        metric_value: comprehensiveFeedback.technicalScore,
      },
      {
        session_id: sessionId,
        user_id: user.id,
        metric_type: 'confidence_level',
        metric_value: comprehensiveFeedback.confidenceScore,
      },
      {
        session_id: sessionId,
        user_id: user.id,
        metric_type: 'average_relevance',
        metric_value: averageRelevance,
      },
      {
        session_id: sessionId,
        user_id: user.id,
        metric_type: 'average_clarity',
        metric_value: averageClarity,
      },
    ]

    const { error: metricsError } = await supabase
      .from('performance_metrics')
      .insert(metricsToStore)

    if (metricsError) {
      console.error('Error storing metrics:', metricsError)
    }

    // Update user's overall statistics
    const { data: userScores } = await supabase
      .from('user_scores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (userScores) {
      // Update existing record
      await supabase
        .from('user_scores')
        .update({
          total_interviews: (userScores.total_interviews || 0) + 1,
          successful_interviews:
            comprehensiveFeedback.overallScore >= 70
              ? (userScores.successful_interviews || 0) + 1
              : userScores.successful_interviews,
          ai_accuracy_score: Math.round(
            ((userScores.ai_accuracy_score || 0) * (userScores.total_interviews || 0) +
              comprehensiveFeedback.overallScore) /
              ((userScores.total_interviews || 0) + 1)
          ),
          communication_score: comprehensiveFeedback.communicationScore,
          last_activity_timestamp: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      // Create new record
      await supabase.from('user_scores').insert({
        user_id: user.id,
        total_interviews: 1,
        successful_interviews: comprehensiveFeedback.overallScore >= 70 ? 1 : 0,
        ai_accuracy_score: comprehensiveFeedback.overallScore,
        communication_score: comprehensiveFeedback.communicationScore,
        completion_rate: 100,
        last_activity_timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      sessionId,
      feedback: {
        overallScore: comprehensiveFeedback.overallScore,
        communicationScore: comprehensiveFeedback.communicationScore,
        technicalScore: comprehensiveFeedback.technicalScore,
        confidenceScore: comprehensiveFeedback.confidenceScore,
        strengths: comprehensiveFeedback.strengths,
        weaknesses: comprehensiveFeedback.weaknesses,
        detailedFeedback: comprehensiveFeedback.detailedFeedback,
        improvementPlan: comprehensiveFeedback.improvementPlan,
        comparisonWithIndustryStandards:
          comprehensiveFeedback.comparisonWithIndustryStandards,
        recommendedResources: comprehensiveFeedback.recommendedResources,
      },
      statistics: {
        totalQuestions: answeredQuestions.length,
        averageScore,
        averageRelevance,
        averageClarity,
        averageConfidence,
        averageResponseTime, // seconds
        totalDuration: durationSeconds, // seconds
      },
      message: 'Interview completed successfully',
    })
  } catch (error: any) {
    console.error('Error completing interview:', error)

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to complete interview. Please try again.',
      },
      { status: 500 }
    )
  }
}
