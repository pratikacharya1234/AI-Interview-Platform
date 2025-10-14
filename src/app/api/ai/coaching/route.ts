import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { coachingService } from '@/lib/services/ai-features-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get specific session with messages
      const data = await coachingService.getSession(sessionId)
      return NextResponse.json(data)
    } else {
      // Get all sessions for user
      const sessions = await coachingService.getSessions(session.user.email)
      return NextResponse.json(sessions)
    }
  } catch (error: any) {
    console.error('Error fetching coaching sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch coaching sessions' },
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

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_session') {
      const newSession = await coachingService.createSession({
        ...data,
        user_email: session.user.email
      })
      return NextResponse.json(newSession, { status: 201 })
    }

    if (action === 'add_message') {
      const message = await coachingService.addMessage(data)
      return NextResponse.json(message, { status: 201 })
    }

    if (action === 'update_session') {
      const { sessionId, updates } = data
      const updatedSession = await coachingService.updateSession(sessionId, updates)
      return NextResponse.json(updatedSession)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in coaching API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
