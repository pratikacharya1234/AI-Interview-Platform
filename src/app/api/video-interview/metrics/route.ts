import { requireAuth } from '@/lib/auth/supabase-auth'
/**
 * API Route: Get Live Metrics
 * GET /api/video-interview/metrics?session_id=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { videoInterviewService } from '@/lib/services/video-interview-service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    const metrics = await videoInterviewService.getLiveMetrics(sessionId)

    return NextResponse.json({
      success: true,
      metrics: metrics
    })
  } catch (error: any) {
    console.error('Get metrics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get metrics' },
      { status: 500 }
    )
  }
}
