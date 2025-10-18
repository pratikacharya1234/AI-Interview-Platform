import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        stats: {
          totalInterviews: 0,
          averageScore: 0,
          weeklyProgress: 0,
          currentStreak: 0,
          completionRate: 0,
          totalPracticeTime: 0
        },
        message: 'Please sign in to view your statistics'
      })
    }
    
    // Fetch user's interview sessions
    const { data: interviews, error: interviewError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (interviewError) {
      console.error('Error fetching interviews:', interviewError)
    }
    
    // Calculate statistics from real data
    const totalInterviews = interviews?.length || 0
    
    // Calculate average score
    const scores = interviews?.map(i => i.overall_score || 0).filter(s => s > 0) || []
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    
    // Calculate weekly progress (interviews in last 7 days vs previous 7 days)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    
    const thisWeekInterviews = interviews?.filter(i => 
      new Date(i.created_at) >= oneWeekAgo
    ).length || 0
    
    const lastWeekInterviews = interviews?.filter(i => 
      new Date(i.created_at) >= twoWeeksAgo && new Date(i.created_at) < oneWeekAgo
    ).length || 0
    
    const weeklyProgress = lastWeekInterviews > 0 
      ? Math.round(((thisWeekInterviews - lastWeekInterviews) / lastWeekInterviews) * 100)
      : thisWeekInterviews > 0 ? 100 : 0
    
    // Calculate current streak (consecutive days with interviews)
    let currentStreak = 0
    const today = new Date().toDateString()
    const interviewDates = new Set(
      interviews?.map(i => new Date(i.created_at).toDateString()) || []
    )
    
    let checkDate = new Date()
    while (interviewDates.has(checkDate.toDateString())) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    // Calculate completion rate
    const completedInterviews = interviews?.filter(i => 
      i.status === 'completed' || i.completed_at
    ).length || 0
    
    const completionRate = totalInterviews > 0 
      ? Math.round((completedInterviews / totalInterviews) * 100)
      : 0
    
    // Calculate total practice time (in minutes)
    const totalPracticeTime = interviews?.reduce((total, interview) => {
      const duration = interview.duration_minutes || 0
      return total + duration
    }, 0) || 0
    
    // Fetch user scores if available
    const { data: userScores } = await supabase
      .from('user_scores')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // Fetch user streaks if available
    const { data: userStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // Use database values if available, otherwise use calculated values
    const stats = {
      totalInterviews: userScores?.total_interviews || totalInterviews,
      averageScore: userScores?.ai_accuracy_score || averageScore,
      weeklyProgress,
      currentStreak: userStreak?.streak_count || currentStreak,
      completionRate: userScores?.completion_rate || completionRate,
      totalPracticeTime,
      // Additional stats
      successfulInterviews: userScores?.successful_interviews || completedInterviews,
      communicationScore: userScores?.communication_score || 0,
      lastActivity: userScores?.last_activity_timestamp || interviews?.[0]?.created_at
    }
    
    return NextResponse.json({
      success: true,
      stats,
      user: {
        id: user.id,
        email: user.email
      }
    })
    
  } catch (error) {
    console.error('Error in dashboard stats endpoint:', error)
    return NextResponse.json({
      success: false,
      stats: {
        totalInterviews: 0,
        averageScore: 0,
        weeklyProgress: 0,
        currentStreak: 0,
        completionRate: 0,
        totalPracticeTime: 0
      },
      error: 'Failed to fetch dashboard statistics'
    }, { status: 500 })
  }
}
