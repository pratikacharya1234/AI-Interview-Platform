import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { interviewId, userId } = await request.json()

    // Return a mock response during NextAuth migration
    const mockSummary = {
      success: true,
      data: {
        interviewId: interviewId || 'mock-interview-id',
        userId: userId || 'mock-user-id',
        summary: "Interview summary temporarily unavailable during authentication system migration to GitHub OAuth.",
        score: 75,
        feedback: "The system is currently being upgraded. Please try again after the migration is complete.",
        strengths: ["Good communication", "Technical knowledge"],
        improvements: ["Practice more complex scenarios"],
        createdAt: new Date().toISOString()
      }
    }

    return NextResponse.json(mockSummary)
  } catch (error) {
    console.error('Interview summary API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
