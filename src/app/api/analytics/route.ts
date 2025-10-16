import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { analyticsService } from '@/lib/services/analytics-service'
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
    const days = parseInt(searchParams.get('days') || '30')

    if (action === 'summary') {
      const summary = await analyticsService.getUserAnalytics(user.id, days)
      return NextResponse.json(summary)
    }

    if (action === 'skills') {
      const skills = await analyticsService.getSkillBreakdown(user.id)
      return NextResponse.json(skills)
    }

    if (action === 'by-type') {
      const typePerformance = await analyticsService.getInterviewTypePerformance(user.id)
      return NextResponse.json(typePerformance)
    }

    if (action === 'progress') {
      const progress = await analyticsService.getProgressOverTime(user.id, days)
      return NextResponse.json(progress)
    }

    if (action === 'comparison') {
      const comparison = await analyticsService.getComparisonWithPeers(user.id)
      return NextResponse.json(comparison)
    }

    if (action === 'insights') {
      const insights = await analyticsService.generateInsights(user.id)
      return NextResponse.json({ insights })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
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
    const { action } = body

    if (action === 'record_metrics') {
      await analyticsService.recordDailyMetrics(user.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in analytics POST:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
