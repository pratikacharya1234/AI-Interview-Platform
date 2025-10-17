import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { gamificationService } from '@/lib/services/gamification-service-simple'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use email as user ID if database is not available
    let userId = session.user.email
    
    if (supabase) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (user) {
        userId = user.id
      }
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'progress') {
      const progress = await gamificationService.getUserProgress(userId)
      return NextResponse.json(progress)
    }

    if (action === 'achievements') {
      const achievements = await gamificationService.getUserAchievements(userId)
      return NextResponse.json(achievements)
    }

    if (action === 'available') {
      const available = await gamificationService.getAvailableAchievements(userId)
      return NextResponse.json(available)
    }

    if (action === 'leaderboard') {
      const category = searchParams.get('category') || 'overall'
      const timePeriod = searchParams.get('timePeriod') || 'all-time'
      const leaderboard = await gamificationService.getLeaderboard(category, timePeriod)
      return NextResponse.json(leaderboard)
    }

    if (action === 'streak') {
      const streakInfo = await gamificationService.getStreakInfo(userId)
      return NextResponse.json(streakInfo)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in gamification API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use email as user ID if database is not available
    let userId = session.user.email
    
    if (supabase) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (user) {
        userId = user.id
      }
    }

    const body = await request.json()
    const { action, xp_amount, source, context } = body

    if (action === 'award_xp') {
      const progress = await gamificationService.awardXP(userId, xp_amount, source)
      return NextResponse.json(progress)
    }

    if (action === 'check_achievements') {
      const newAchievements = await gamificationService.checkAndAwardAchievements(userId, context)
      return NextResponse.json(newAchievements)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in gamification POST:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
