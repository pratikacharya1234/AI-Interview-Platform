import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { voiceAnalysisService } from '@/lib/services/voice-analysis-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

        const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const action = searchParams.get('action')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    if (action === 'analytics') {
      const analytics = await voiceAnalysisService.getSessionVoiceAnalytics(sessionId)
      return NextResponse.json(analytics)
    }

    if (action === 'compare') {
      const comparison = await voiceAnalysisService.compareVoicePerformance(user.id, sessionId)
      return NextResponse.json(comparison)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in voice analysis API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voice analysis' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_id, response_index, audio_url, transcript } = body

    if (!session_id || response_index === undefined || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const analysis = await voiceAnalysisService.analyzeVoiceResponse(
      session_id,
      response_index,
      audio_url || '',
      transcript
    )

    return NextResponse.json(analysis, { status: 201 })
  } catch (error: any) {
    console.error('Error analyzing voice:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze voice' },
      { status: 500 }
    )
  }
}
