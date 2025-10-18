import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const country = searchParams.get('country')
    const timeframe = searchParams.get('timeframe') || 'all'
    
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('leaderboard_cache')
      .select(`
        *,
        profiles!inner(
          username,
          avatar_url,
          full_name
        )
      `)
      .eq('cache_date', new Date().toISOString().split('T')[0])
      .order('global_rank', { ascending: true })
      .range(offset, offset + limit - 1)
    
    // Apply country filter if provided
    if (country && country !== 'all') {
      query = query.eq('country_code', country)
    }
    
    // Apply timeframe filter
    if (timeframe === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('last_activity_timestamp', weekAgo.toISOString())
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('last_activity_timestamp', monthAgo.toISOString())
    }
    
    const { data: leaderboard, error } = await query
    
    if (error) {
      console.error('Leaderboard fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('leaderboard_cache')
      .select('*', { count: 'exact', head: true })
      .eq('cache_date', new Date().toISOString().split('T')[0])
    
    // Get current user's position if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    let userPosition = null
    
    if (user) {
      const { data: userRank } = await supabase
        .from('leaderboard_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('cache_date', new Date().toISOString().split('T')[0])
        .single()
      
      if (userRank) {
        userPosition = {
          rank: userRank.global_rank,
          score: userRank.adjusted_score,
          streak: userRank.streak_count,
          badge: userRank.badge_level,
          rankChange: userRank.rank_change
        }
      }
    }
    
    return NextResponse.json({
      leaderboard: leaderboard || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      userPosition,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
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
    
    // Verify admin privileges
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin (you might want to implement proper role checking)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Trigger ranking update via Python service
    const response = await fetch(`${process.env.PYTHON_SERVICE_URL}/api/ranking/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to trigger ranking update')
    }
    
    return NextResponse.json({
      message: 'Ranking update triggered successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ranking update error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger ranking update' },
      { status: 500 }
    )
  }
}
