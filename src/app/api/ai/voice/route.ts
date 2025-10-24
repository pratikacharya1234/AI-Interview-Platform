import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { voiceService } from '@/lib/services/ai-features-service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await voiceService.getSessions(user.email)
    return NextResponse.json(sessions)
  } catch (error: any) {
    console.error('Error fetching voice sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voice sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_name, duration, overall_score, metrics, insights, recommendations, recording_url } = body

    const newSession = await voiceService.createSession(
      {
        user_email: user.email,
        session_name,
        duration,
        overall_score,
        recording_url
      },
      metrics,
      insights || [],
      recommendations || []
    )

    return NextResponse.json(newSession, { status: 201 })
  } catch (error: any) {
    console.error('Error creating voice session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create voice session' },
      { status: 500 }
    )
  }
}
