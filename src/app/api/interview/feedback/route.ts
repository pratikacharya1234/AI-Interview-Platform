import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json()

    // Validate session data
    if (!session || !session.responses || !Array.isArray(session.responses)) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      )
    }

    if (session.responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses to analyze' },
        { status: 400 }
      )
    }

    // Generate comprehensive feedback
    const feedback = await geminiService.generateOverallFeedback(session)

    // Calculate overall statistics
    const scores = session.responses.map((r: any) => r.score)
    const averageScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
    const maxScore = Math.max(...scores)
    const minScore = Math.min(...scores)

    const stats = {
      totalQuestions: session.responses.length,
      averageScore: Math.round(averageScore * 10) / 10,
      maxScore,
      minScore,
      scoreDistribution: {
        excellent: scores.filter((s: number) => s >= 9).length,
        good: scores.filter((s: number) => s >= 7 && s < 9).length,
        average: scores.filter((s: number) => s >= 5 && s < 7).length,
        needsImprovement: scores.filter((s: number) => s < 5).length
      }
    }

    return NextResponse.json({
      success: true,
      feedback,
      stats,
      metadata: {
        generated_at: new Date().toISOString(),
        session_id: session.sessionId,
        position: session.position,
        company: session.company
      }
    })

  } catch (error) {
    console.error('Error in /api/interview/feedback:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback. Please try again.' },
      { status: 500 }
    )
  }
}