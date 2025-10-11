import { NextRequest, NextResponse } from 'next/server'
import { geminiService, QuestionType } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { position, company, questionTypes, difficulty = 'medium', count = 5 } = await request.json()

    // Validate required fields
    if (!position || !company || !questionTypes || !Array.isArray(questionTypes)) {
      return NextResponse.json(
        { error: 'Missing required fields: position, company, questionTypes' },
        { status: 400 }
      )
    }

    // Validate question types
    const validTypes: QuestionType[] = ['technical', 'behavioral', 'system-design', 'coding', 'general']
    const invalidTypes = questionTypes.filter(type => !validTypes.includes(type))
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid question types: ${invalidTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate questions using Gemini AI
    const questions = await geminiService.generateQuestions(
      position,
      company,
      questionTypes,
      difficulty,
      count
    )

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        position,
        company,
        questionTypes,
        difficulty,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in /api/interview/questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    )
  }
}