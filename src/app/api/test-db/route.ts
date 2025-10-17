import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const results: any = {
    connection: {
      url: supabaseUrl ? '✓ Set' : '✗ Missing',
      key: supabaseKey ? '✓ Set' : '✗ Missing'
    },
    tables: {}
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      error: 'Missing Supabase credentials',
      results
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test interview_sessions table
    const { data: sessions, error: sessionsError, count: sessionsCount } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true })
    
    results.tables.interview_sessions = sessionsError 
      ? { status: '❌ Error', error: sessionsError.message }
      : { status: '✓ Exists', count: sessionsCount || 0 }

    // Test video_interview_reports table
    const { data: reports, error: reportsError, count: reportsCount } = await supabase
      .from('video_interview_reports')
      .select('*', { count: 'exact', head: true })
    
    results.tables.video_interview_reports = reportsError
      ? { status: '❌ Error', error: reportsError.message }
      : { status: '✓ Exists', count: reportsCount || 0 }

    // Test video_interview_sessions table
    const { data: videoSessions, error: videoError, count: videoCount } = await supabase
      .from('video_interview_sessions')
      .select('*', { count: 'exact', head: true })
    
    results.tables.video_interview_sessions = videoError
      ? { status: '❌ Error', error: videoError.message }
      : { status: '✓ Exists', count: videoCount || 0 }

    // Test users table
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    results.tables.users = usersError
      ? { status: '❌ Error', error: usersError.message }
      : { status: '✓ Exists', count: usersCount || 0 }

    // Get sample data from interview_sessions if it exists
    if (!sessionsError) {
      const { data: sampleSessions, error: sampleError } = await supabase
        .from('interview_sessions')
        .select('id, user_email, created_at, status')
        .limit(5)
        .order('created_at', { ascending: false })
      
      if (!sampleError && sampleSessions) {
        results.recentInterviews = sampleSessions
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      results
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Database test failed',
      message: error.message,
      results
    }, { status: 500 })
  }
}
