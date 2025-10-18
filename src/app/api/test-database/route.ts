import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test each table
    const tests = {
      auth: {
        status: authError ? 'error' : 'success',
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message
      },
      tables: {} as Record<string, any>
    }
    
    // Test interview_sessions table
    const { data: interviews, error: interviewError } = await supabase
      .from('interview_sessions')
      .select('id')
      .limit(1)
    
    tests.tables['interview_sessions'] = {
      status: interviewError ? 'error' : 'success',
      count: interviews?.length || 0,
      error: interviewError?.message
    }
    
    // Test user_scores table
    const { data: scores, error: scoresError } = await supabase
      .from('user_scores')
      .select('user_id')
      .limit(1)
    
    tests.tables['user_scores'] = {
      status: scoresError ? 'error' : 'success',
      count: scores?.length || 0,
      error: scoresError?.message
    }
    
    // Test user_streaks table
    const { data: streaks, error: streaksError } = await supabase
      .from('user_streaks')
      .select('user_id')
      .limit(1)
    
    tests.tables['user_streaks'] = {
      status: streaksError ? 'error' : 'success',
      count: streaks?.length || 0,
      error: streaksError?.message
    }
    
    // Test leaderboard_cache table
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboard_cache')
      .select('user_id')
      .limit(1)
    
    tests.tables['leaderboard_cache'] = {
      status: leaderboardError ? 'error' : 'success',
      count: leaderboard?.length || 0,
      error: leaderboardError?.message
    }
    
    // Test session_logs table
    const { data: logs, error: logsError } = await supabase
      .from('session_logs')
      .select('user_id')
      .limit(1)
    
    tests.tables['session_logs'] = {
      status: logsError ? 'error' : 'success',
      count: logs?.length || 0,
      error: logsError?.message
    }
    
    // Get actual interview count for current user
    let userInterviews: any[] = []
    if (user) {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('id, title, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (data) {
        userInterviews = data
      }
    }
    
    return NextResponse.json({
      status: 'Database Connection Test',
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      tests,
      userInterviews,
      summary: {
        allTablesExist: Object.values(tests.tables).every((t: any) => t.status === 'success'),
        userAuthenticated: !!user,
        interviewCount: userInterviews.length
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
