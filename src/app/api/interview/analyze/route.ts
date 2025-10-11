import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { question, userResponse, context } = await request.json()

    // Validate required fields
    if (!question || !userResponse) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userResponse' },
        { status: 400 }
      )
    }

    // Validate question structure
    if (!question.id || !question.question || !question.type) {
      return NextResponse.json(
        { error: 'Invalid question format' },
        { status: 400 }
      )
    }

    // Analyze response using Gemini AI
    const analysis = await geminiService.analyzeResponse(
      question,
      userResponse,
      context
    )

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        analyzed_at: new Date().toISOString(),
        question_id: question.id,
        question_type: question.type
      }
    })

  } catch (error) {
    console.error('Error in /api/interview/analyze:', error)
    return NextResponse.json(
      { error: 'Failed to analyze response. Please try again.' },
      { status: 500 }
    )
  }
}