import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, transcript, stage } = body

    if (!session_id || !transcript) {
      return NextResponse.json(
        { error: 'Session ID and transcript are required' },
        { status: 400 }
      )
    }

    // Forward to process-audio endpoint with transcript
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/voice-interview/process-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id,
        transcript,
        from_text: true
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error processing text:', error)
    return NextResponse.json(
      { error: 'Failed to process transcript' },
      { status: 500 }
    )
  }
}
