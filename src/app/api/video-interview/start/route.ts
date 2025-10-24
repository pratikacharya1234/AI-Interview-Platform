/**
 * API Route: Start Video Interview Session
 * POST /api/video-interview/start
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/supabase-auth'
import { videoInterviewService } from '@/lib/services/video-interview-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const body = await request.json()
    const { persona_id, job_title, interview_type, difficulty } = body

    // Validate inputs
    if (!persona_id || !job_title || !interview_type || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create session
    const interviewSession = await videoInterviewService.createSession(
      user.id,
      persona_id,
      job_title,
      interview_type,
      difficulty
    )

    return NextResponse.json({
      success: true,
      session: interviewSession
    })
  } catch (error: any) {
    console.error('Start video interview error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to start interview' },
      { status: 500 }
    )
  }
}
