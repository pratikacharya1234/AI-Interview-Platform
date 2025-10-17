/**
 * API Route: Get Video Interview Report
 * GET /api/video-interview/report/[reportId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportId } = await params

    const { data: report, error } = await supabase
      .from('video_interview_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      report: report
    })
  } catch (error: any) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get report' },
      { status: 500 }
    )
  }
}
