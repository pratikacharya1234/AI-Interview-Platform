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
        activities: [],
        upcomingInterviews: [],
        message: 'Please sign in to view your activities'
      })
    }
    
    // Fetch recent interview sessions (last 10)
    const { data: interviews, error: interviewError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (interviewError) {
      console.error('Error fetching interviews:', interviewError)
    }
    
    // Transform interviews into activities
    const recentActivities = (interviews || []).map(interview => {
      const createdAt = new Date(interview.created_at)
      const now = new Date()
      const diffMs = now.getTime() - createdAt.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      let timestamp = ''
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        timestamp = diffMinutes === 0 ? 'Just now' : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
      } else if (diffHours < 24) {
        timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffDays === 1) {
        timestamp = 'Yesterday'
      } else if (diffDays < 7) {
        timestamp = `${diffDays} days ago`
      } else {
        timestamp = createdAt.toLocaleDateString()
      }
      
      // Determine activity type based on interview data
      let type = 'interview'
      let title = interview.title || 'Interview Session'
      
      // Clean up title
      if (title.includes('Interview - ')) {
        title = title.replace('Interview - ', '')
      }
      
      // Check if it's a practice session based on title or type
      if (interview.interview_type === 'practice' || title.toLowerCase().includes('practice')) {
        type = 'practice'
        title = title.includes('Practice') ? title : `${title} Practice`
      }
      
      return {
        id: interview.id,
        type,
        title,
        timestamp,
        score: interview.overall_score || interview.ai_accuracy_score,
        status: interview.status || 'completed',
        duration: interview.duration_minutes,
        feedback: interview.feedback
      }
    })
    
    // Fetch achievements/badges if available
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    // Add achievements to activities
    if (achievements && achievements.length > 0) {
      achievements.forEach(achievement => {
        const createdAt = new Date(achievement.created_at)
        const now = new Date()
        const diffMs = now.getTime() - createdAt.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        let timestamp = ''
        if (diffDays === 0) {
          timestamp = 'Today'
        } else if (diffDays === 1) {
          timestamp = 'Yesterday'
        } else if (diffDays < 7) {
          timestamp = `${diffDays} days ago`
        } else {
          timestamp = createdAt.toLocaleDateString()
        }
        
        recentActivities.push({
          id: achievement.id,
          type: 'achievement',
          title: `Unlocked: ${achievement.badge_name || achievement.title}`,
          timestamp,
          status: 'new',
          score: undefined,
          duration: undefined,
          feedback: undefined
        })
      })
    }
    
    // Sort activities by recency (already sorted for interviews, but need to re-sort if achievements added)
    recentActivities.sort((a, b) => {
      // Convert timestamp back to comparable format
      const getTimestampValue = (ts: string) => {
        if (ts === 'Just now') return 0
        if (ts.includes('minute')) return parseInt(ts) || 1
        if (ts.includes('hour')) return parseInt(ts) * 60
        if (ts === 'Yesterday') return 24 * 60
        if (ts.includes('days')) return parseInt(ts) * 24 * 60
        return 999999 // Old dates
      }
      return getTimestampValue(a.timestamp) - getTimestampValue(b.timestamp)
    })
    
    // Limit to 10 most recent activities
    const limitedActivities = recentActivities.slice(0, 10)
    
    // For upcoming interviews, we'll check for scheduled interviews
    // This would require a separate table for scheduled interviews
    // For now, return empty array or mock data based on existing patterns
    const upcomingInterviews: any[] = []
    
    // Check if there's a scheduled_interviews table
    const { data: scheduledInterviews } = await supabase
      .from('scheduled_interviews')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(5)
    
    if (scheduledInterviews && scheduledInterviews.length > 0) {
      scheduledInterviews.forEach(interview => {
        const scheduledDate = new Date(interview.scheduled_date)
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        let dateStr = ''
        if (scheduledDate.toDateString() === now.toDateString()) {
          dateStr = 'Today'
        } else if (scheduledDate.toDateString() === tomorrow.toDateString()) {
          dateStr = 'Tomorrow'
        } else {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          dateStr = days[scheduledDate.getDay()]
        }
        
        upcomingInterviews.push({
          id: interview.id,
          title: interview.title || 'Interview Session',
          type: interview.interview_type || 'Technical',
          date: dateStr,
          time: scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          difficulty: interview.difficulty || 'Medium'
        })
      })
    }
    
    return NextResponse.json({
      success: true,
      activities: limitedActivities,
      upcomingInterviews,
      user: {
        id: user.id,
        email: user.email
      }
    })
    
  } catch (error) {
    console.error('Error in dashboard activities endpoint:', error)
    return NextResponse.json({
      success: false,
      activities: [],
      upcomingInterviews: [],
      error: 'Failed to fetch activities'
    }, { status: 500 })
  }
}
