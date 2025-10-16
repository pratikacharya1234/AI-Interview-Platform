import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { gamificationService } from '@/lib/services/gamification-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'progress') {
      const progress = await gamificationService.getUserProgress(user.id)
      return NextResponse.json(progress)
    }

    if (action === 'achievements') {
      const achievements = await gamificationService.getUserAchievements(user.id)
      return NextResponse.json(achievements)
    }

    if (action === 'available') {
      const available = await gamificationService.getAvailableAchievements(user.id)
      return NextResponse.json(available)
    }

    if (action === 'leaderboard') {
      const category = searchParams.get('category') || 'overall'
      const timePeriod = searchParams.get('timePeriod') || 'all-time'
      const leaderboard = await gamificationService.getLeaderboard(category, timePeriod)
      return NextResponse.json(leaderboard)
    }

    if (action === 'streak') {
      const streakInfo = await gamificationService.getStreakInfo(user.id)
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

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action, xp_amount, source, context } = body

    if (action === 'award_xp') {
      const progress = await gamificationService.awardXP(user.id, xp_amount, source)
      return NextResponse.json(progress)
    }

    if (action === 'check_achievements') {
      const newAchievements = await gamificationService.checkAndAwardAchievements(user.id, context)
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
