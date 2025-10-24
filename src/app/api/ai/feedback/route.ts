import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { feedbackService } from '@/lib/services/ai-features-service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await feedbackService.getSessions(user.email)
    return NextResponse.json(sessions)
  } catch (error: any) {
    console.error('Error fetching feedback sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback sessions' },
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
    
    const newSession = await feedbackService.createSession({
      ...body,
      user_email: user.email
    })

    return NextResponse.json(newSession, { status: 201 })
  } catch (error: any) {
    console.error('Error creating feedback session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create feedback session' },
      { status: 500 }
    )
  }
}
