import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json()

    // Validate session data
    if (!session || !session.responses || !Array.isArray(session.responses)) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      )
    }

    if (session.responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses to analyze' },
        { status: 400 }
      )
    }

    // Generate comprehensive feedback
    const feedback = await geminiService.generateOverallFeedback(session)

    // Calculate overall statistics
    const scores = session.responses.map((r: any) => r.score)
    const averageScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)

    const stats = {
      totalQuestions: session.responses.length,
      averageScore: Math.round(averageScore * 10) / 10,
      maxScore,
      minScore,
      scoreDistribution: {
        excellent: scores.filter((s: number) => s >= 9).length,
        good: scores.filter((s: number) => s >= 7 && s < 9).length,
        average: scores.filter((s: number) => s >= 5 && s < 7).length,
        needsImprovement: scores.filter((s: number) => s < 5).length
      }
    }

    return NextResponse.json({
      success: true,
      feedback,
      stats,
      metadata: {
        generated_at: new Date().toISOString(),
        session_id: session.sessionId,
        position: session.position,
        company: session.company
      }
    })

  } catch (error) {
    console.error('Error in /api/interview/feedback:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Please sign in to view feedback'
      }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const interviewId = searchParams.get('id')
    
    if (!interviewId) {
      return NextResponse.json({
        success: false,
        error: 'Interview ID is required'
      }, { status: 400 })
    }
    
    // Fetch specific interview from database
    const { data: interview, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', interviewId)
      .eq('user_id', user.id)
      .single()
    
    if (error || !interview) {
      console.error('Error fetching interview:', error)
      return NextResponse.json({
        success: false,
        error: 'Interview not found'
      }, { status: 404 })
    }
    
    // Transform data for frontend
    const transformedInterview = {
      id: interview.id,
      startTime: interview.started_at || interview.created_at,
      endTime: interview.completed_at,
      duration: interview.duration_minutes ? interview.duration_minutes * 60 : 0,
      messages: [
        ...(interview.questions || []).map((q: any) => ({
          id: q.id,
          type: 'interviewer',
          text: q.question || q.text,
          timestamp: q.timestamp
        })),
        ...(interview.answers || []).map((a: any) => ({
          id: a.id,
          type: 'candidate',
          text: a.answer || a.text,
          timestamp: a.timestamp
        }))
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      videoEnabled: false,
      position: interview.title?.replace(' Interview', '') || 'Software Developer',
      company: interview.description?.replace('Text-based interview for ', '') || 'Company',
      status: interview.status,
      feedback: interview.feedback,
      metrics: {
        totalQuestions: interview.questions?.length || 0,
        totalResponses: interview.answers?.length || 0,
        averageScore: interview.overall_score || 0,
        completionRate: interview.questions?.length > 0 
          ? ((interview.answers?.length || 0) / interview.questions.length) * 100 
          : 0
      },
      createdAt: interview.created_at
    }
    
    return NextResponse.json({
      success: true,
      interview: transformedInterview
    })
    
  } catch (error) {
    console.error('Error in GET /api/interview/feedback:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch interview feedback'
    }, { status: 500 })
  }
}