import { NextRequest, NextResponse } from 'next/server'

interface InterviewSessionState {
  sessionId: string
  currentIndex: number
  questionCount: number
  messages: any[]
  duration: number
  timestamp: number
  userId?: string
}

// In-memory session storage (replace with database in production)
const sessionStorage = new Map<string, InterviewSessionState>()

export async function POST(request: NextRequest) {
  try {
    const sessionState: InterviewSessionState = await request.json()
    
    // Store session state
    sessionStorage.set(sessionState.sessionId, {
      ...sessionState,
      timestamp: Date.now()
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session state saved successfully',
      sessionId: sessionState.sessionId 
    })
    
  } catch (error) {
    console.error('Error saving session state:', error)
    return NextResponse.json(
      { error: 'Failed to save session state' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    
    const sessionState = sessionStorage.get(sessionId)
    
    if (!sessionState) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Check if session is not too old (24 hours max)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    if (Date.now() - sessionState.timestamp > maxAge) {
      sessionStorage.delete(sessionId)
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(sessionState)
    
  } catch (error) {
    console.error('Error retrieving session state:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session state' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }
    const deleted = sessionStorage.delete(sessionId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session deleted successfully' 
    })
    
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}