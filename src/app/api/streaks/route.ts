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
      // Return mock data for unauthenticated users
      return NextResponse.json({
        streak: {
          current: 0,
          longest: 0,
          totalSessions: 0,
          lastActiveDate: null,
          status: 'inactive',
          frozen: false,
          freezeUsedDate: null
        },
        sessions: [],
        achievements: [],
        nextMilestone: 3,
        streakBonus: 0
      })
    }
    
    // Get user's streak data
    const { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Streak fetch error:', streakError)
      return NextResponse.json(
        { error: 'Failed to fetch streak data' },
        { status: 500 }
      )
    }
    
    // Get user's session history for the calendar view
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('session_logs')
      .select('session_date, session_count, completed')
      .eq('user_id', user.id)
      .gte('session_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('session_date', { ascending: false })
    
    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError)
    }
    
    // Get user's achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .in('achievement_type', ['streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_60', 'streak_100'])
      .order('streak_milestone', { ascending: true })
    
    // Calculate streak status
    const today = new Date().toISOString().split('T')[0]
    const lastActive = streak?.last_active_date
    const isActiveToday = sessions?.some(s => s.session_date === today)
    
    let streakStatus = 'inactive'
    if (isActiveToday) {
      streakStatus = 'active'
    } else if (lastActive) {
      const lastActiveDate = new Date(lastActive)
      const daysSinceActive = Math.floor((new Date().getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceActive === 1) {
        streakStatus = 'at_risk' // User needs to practice today to maintain streak
      } else if (daysSinceActive > 1) {
        streakStatus = 'broken'
      }
    }
    
    // Calculate next milestone
    const currentStreak = streak?.streak_count || 0
    const milestones = [3, 7, 14, 30, 60, 100]
    const nextMilestone = milestones.find(m => m > currentStreak) || null
    
    return NextResponse.json({
      streak: {
        current: currentStreak,
        longest: streak?.longest_streak || 0,
        totalSessions: streak?.total_sessions || 0,
        lastActiveDate: lastActive,
        status: streakStatus,
        frozen: streak?.streak_frozen || false,
        freezeUsedDate: streak?.freeze_used_date
      },
      sessions: sessions || [],
      achievements: achievements || [],
      nextMilestone,
      streakBonus: Math.min(currentStreak * 0.05, 0.5)
    })
  } catch (error) {
    console.error('Streaks API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { action } = body
    
    if (action === 'freeze') {
      // Implement streak freeze (one-time use per month)
      const { data: streak } = await supabase
        .from('user_streaks')
        .select('freeze_used_date')
        .eq('user_id', user.id)
        .single()
      
      if (streak?.freeze_used_date) {
        const freezeDate = new Date(streak.freeze_used_date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        if (freezeDate > thirtyDaysAgo) {
          return NextResponse.json(
            { error: 'Streak freeze already used this month' },
            { status: 400 }
          )
        }
      }
      
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          streak_frozen: true,
          freeze_used_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', user.id)
      
      if (updateError) {
        throw updateError
      }
      
      return NextResponse.json({
        message: 'Streak frozen successfully',
        freezeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    if (action === 'log_session') {
      // Log a new session
      const { ai_accuracy_score, communication_score, completed } = body
      
      const today = new Date().toISOString().split('T')[0]
      
      // Insert or update session log
      const { error: sessionError } = await supabase
        .from('session_logs')
        .upsert({
          user_id: user.id,
          session_date: today,
          ai_accuracy_score,
          communication_score,
          completed,
          session_count: 1
        }, {
          onConflict: 'user_id,session_date',
          count: 'exact'
        })
      
      if (sessionError) {
        throw sessionError
      }
      
      // Update user scores
      const performance_score = (0.6 * ai_accuracy_score) + (0.3 * communication_score) + (0.1 * (completed ? 100 : 0))
      
      const { error: scoreError } = await supabase
        .from('user_scores')
        .upsert({
          user_id: user.id,
          ai_accuracy_score,
          communication_score,
          completion_rate: completed ? 100 : 0,
          last_activity_timestamp: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
      
      if (scoreError) {
        throw scoreError
      }
      
      // Trigger Python service to update streak
      if (process.env.PYTHON_SERVICE_URL) {
        await fetch(`${process.env.PYTHON_SERVICE_URL}/api/ranking/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: user.id,
            ai_accuracy_score,
            communication_score,
            completed
          })
        })
      }
      
      return NextResponse.json({
        message: 'Session logged successfully',
        performance_score
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Streaks POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
