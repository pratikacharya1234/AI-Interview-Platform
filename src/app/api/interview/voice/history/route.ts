/**
 * GET /api/interview/voice/history
 *
 * Retrieves user's voice interview history with pagination and filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/auth/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const difficulty = searchParams.get('difficulty') // 'easy', 'medium', 'hard'
    const role = searchParams.get('role') // 'behavioral', 'technical'
    const status = searchParams.get('status') // 'completed', 'in_progress'
    const sortBy = searchParams.get('sortBy') || 'created_at' // 'created_at', 'overall_score'
    const sortOrder = searchParams.get('sortOrder') || 'desc' // 'asc', 'desc'

    const supabase = await createServerSupabaseClient()

    // Build query
    let query = supabase
      .from('interview_sessions')
      .select(`
        id,
        role,
        position,
        difficulty,
        industry,
        status,
        interview_type,
        voice_enabled,
        started_at,
        completed_at,
        overall_score,
        duration_minutes,
        total_questions,
        average_response_time,
        created_at
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .eq('interview_type', 'voice')

    // Apply filters
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data: sessions, error, count } = await query

    if (error) {
      console.error('Error fetching interview history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch interview history' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const completedSessions = sessions?.filter(s => s.status === 'completed') || []
    const totalCompleted = completedSessions.length

    const averageScore = totalCompleted > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalCompleted
        )
      : 0

    const totalDuration = completedSessions.reduce(
      (sum, s) => sum + (s.duration_minutes || 0),
      0
    )

    const totalQuestions = completedSessions.reduce(
      (sum, s) => sum + (s.total_questions || 0),
      0
    )

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasMore: (count || 0) > page * pageSize,
      },
      statistics: {
        totalInterviews: count || 0,
        completedInterviews: totalCompleted,
        inProgressInterviews: (sessions?.filter(s => s.status === 'in_progress').length) || 0,
        averageScore,
        totalDuration, // minutes
        totalQuestions,
      },
      filters: {
        difficulty,
        role,
        status,
        sortBy,
        sortOrder,
      },
    })
  } catch (error: any) {
    console.error('Error in interview history:', error)

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve interview history',
      },
      { status: 500 }
    )
  }
}
