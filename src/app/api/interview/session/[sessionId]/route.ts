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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params
    
    // In a real app, fetch from database
    // For now, return empty state to allow fresh start
    return NextResponse.json({
      sessionId,
      currentIndex: 0,
      questionCount: 0,
      messages: [],
      duration: 0,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Error retrieving session state:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session state' },
      { status: 500 }
    )
  }
}