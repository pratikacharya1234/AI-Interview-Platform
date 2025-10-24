/**
 * POST /api/interview/voice/start
 *
 * Starts a new voice-based interview session
 * Generates the first question and returns audio
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/auth/supabase-auth'
import { generateInitialQuestion } from '@/lib/services/gemini-service'
import { generateAndStoreAudio, cleanTextForTTS } from '@/lib/services/tts-service'
import { z } from 'zod'

// Request validation schema
const StartInterviewSchema = z.object({
  role: z.string().min(1),
  position: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  industry: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Parse and validate request body
    const body = await request.json()
    const validation = StartInterviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { role, position, difficulty, industry } = validation.data

    // Rate limiting check
    const supabase = await createServerSupabaseClient()

    // Check user's interview count today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())

    // Free tier limit: 5 interviews per day
    const DAILY_LIMIT = 5
    if (count && count >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: 'Daily interview limit reached',
          message: `You've reached your daily limit of ${DAILY_LIMIT} interviews. Please upgrade your plan or try again tomorrow.`,
        },
        { status: 429 }
      )
    }

    // Generate first question using Gemini
    const firstQuestion = await generateInitialQuestion({
      role,
      position,
      difficulty,
      industry,
    })

    // Create interview session
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        role,
        position,
        difficulty,
        industry,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create interview session' },
        { status: 500 }
      )
    }

    // Generate audio for the first question
    const cleanedQuestion = cleanTextForTTS(firstQuestion)
    const audioUrl = await generateAndStoreAudio(
      cleanedQuestion,
      session.id,
      1
    )

    // Store first question in database
    const { data: questionData, error: questionError } = await supabase
      .from('interview_qa')
      .insert({
        session_id: session.id,
        user_id: user.id,
        question_number: 1,
        question_text: firstQuestion,
        question_audio_url: audioUrl,
        asked_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (questionError) {
      console.error('Question storage error:', questionError)
    }

    // Return session and first question
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        role,
        position,
        difficulty,
        industry,
        status: session.status,
      },
      question: {
        id: questionData?.id,
        number: 1,
        text: firstQuestion,
        audioUrl,
      },
      message: 'Interview started successfully',
    })
  } catch (error: any) {
    console.error('Error starting interview:', error)

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to start interview. Please try again.',
      },
      { status: 500 }
    )
  }
}
