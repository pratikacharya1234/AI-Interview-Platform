/**
 * API Route: End Video Interview Session
 * POST /api/video-interview/end
 * Generates final report and closes session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { videoInterviewService } from '@/lib/services/video-interview-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    // Update session status to completed
    await videoInterviewService.updateSessionStatus(session_id, 'completed')

    // Generate final report
    const report = await videoInterviewService.generateFinalReport(session_id)

    return NextResponse.json({
      success: true,
      report: report
    })
  } catch (error: any) {
    console.error('End video interview error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to end interview' },
      { status: 500 }
    )
  }
}
