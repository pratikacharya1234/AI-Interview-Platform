import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const user = await requireAuth()

    // Fetch user's interviews from database
    const { data: interviews, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error fetching interviews:', error)
      return NextResponse.json({
        success: false,
        interviews: [],
        error: error.message
      })
    }
    
    // Transform data for frontend
    const transformedInterviews = (interviews || []).map(interview => ({
      id: interview.id,
      start_time: interview.started_at || interview.created_at,
      end_time: interview.completed_at,
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
      scores: {
        overall: interview.overall_score,
        communication: interview.communication_score,
        technical: interview.technical_score,
        ai_accuracy: interview.ai_accuracy_score
      },
      created_at: interview.created_at,
      updated_at: interview.updated_at
    }))
    
    console.log(`Fetched ${transformedInterviews.length} interviews for user ${user.id}`)
    
    return NextResponse.json({
      success: true,
      interviews: transformedInterviews,
      total: transformedInterviews.length,
      user: {
        id: user.id,
        email: user.email
      }
    })
    
  } catch (error) {
    console.error('Error in interview history endpoint:', error)
    return NextResponse.json({
      success: false,
      interviews: [],
      error: 'Failed to fetch interview history'
    }, { status: 500 })
  }
}