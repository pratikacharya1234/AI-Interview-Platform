/**
 * POST /api/interview/voice/process-answer
 *
 * Processes user's audio answer using Gemini
 * Generates next question and AI feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/supabase-auth'
import { createServerSupabaseClient } from '@/lib/auth/supabase-auth'
import {
  processAudioAnswer,
  generateNextQuestion,
  getEncouragingFeedback,
  type InterviewContext,
} from '@/lib/services/gemini-service'
import { generateAndStoreAudio, cleanTextForTTS } from '@/lib/services/tts-service'
import { z } from 'zod'

// Request validation schema
const ProcessAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  audioData: z.string(), // Base64 encoded audio
  mimeType: z.string(),
  duration: z.number().optional(), // seconds
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Parse request - handle both JSON and FormData
    const contentType = request.headers.get('content-type') || ''
    let validatedData

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const audioFile = formData.get('audio') as File
      const sessionId = formData.get('sessionId') as string
      const questionId = formData.get('questionId') as string

      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await audioFile.arrayBuffer())
      const base64Audio = buffer.toString('base64')

      validatedData = {
        sessionId,
        questionId,
        audioData: base64Audio,
        mimeType: audioFile.type,
        duration: undefined,
      }
    } else {
      const body = await request.json()
      const validation = ProcessAnswerSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: validation.error.issues,
          },
          { status: 400 }
        )
      }

      validatedData = validation.data
    }

    const { sessionId, questionId, audioData, mimeType, duration } = validatedData

    // Verify session belongs to user
    const supabase = await createServerSupabaseClient()

    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*, interview_qa(*)')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Interview session is not active' },
        { status: 400 }
      )
    }

    // Get current question
    const { data: currentQuestion, error: questionError } = await supabase
      .from('interview_qa')
      .select('*')
      .eq('id', questionId)
      .eq('session_id', sessionId)
      .single()

    if (questionError || !currentQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (currentQuestion.answer_text) {
      return NextResponse.json(
        { error: 'Question already answered' },
        { status: 400 }
      )
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64')

    // Upload answer audio to storage
    const answerAudioPath = `interview-audio/${sessionId}/answer-${currentQuestion.question_number}.mp3`
    const { data: audioUpload, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(answerAudioPath, audioBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Audio upload error:', uploadError)
    }

    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(answerAudioPath)

    // Build interview context
    const previousQA = session.interview_qa
      .filter((qa: any) => qa.answer_text)
      .map((qa: any) => ({
        question: qa.question_text,
        answer: qa.answer_text,
        feedback: qa.feedback,
      }))

    const context: InterviewContext = {
      role: session.role,
      position: session.position,
      difficulty: session.difficulty,
      industry: session.industry,
      previousQuestions: previousQA,
    }

    // Process audio with Gemini
    const analysis = await processAudioAnswer(
      audioBuffer,
      mimeType,
      currentQuestion.question_text,
      context
    )

    // Generate transcription placeholder (Gemini should provide this in analysis)
    const transcription = `[Audio transcription from Gemini analysis - Score: ${analysis.score}/100]`

    // Update question with answer and analysis
    await supabase
      .from('interview_qa')
      .update({
        answer_text: transcription,
        answer_audio_url: urlData.publicUrl,
        answer_duration: duration || null,
        answered_at: new Date().toISOString(),
        score: analysis.score,
        relevance_score: analysis.relevance,
        clarity_score: analysis.clarity,
        confidence_score: analysis.confidence,
        feedback: analysis.feedback,
      })
      .eq('id', questionId)

    // Determine if interview should continue
    const MAX_QUESTIONS = 8
    const shouldContinue = previousQA.length + 1 < MAX_QUESTIONS

    let nextQuestionData = null

    if (shouldContinue && analysis.nextQuestion) {
      // Generate audio for next question
      const cleanedNextQuestion = cleanTextForTTS(analysis.nextQuestion)
      const nextAudioUrl = await generateAndStoreAudio(
        cleanedNextQuestion,
        sessionId,
        currentQuestion.question_number + 1
      )

      // Store next question
      const { data: newQuestion, error: newQuestionError } = await supabase
        .from('interview_qa')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          question_number: currentQuestion.question_number + 1,
          question_text: analysis.nextQuestion,
          question_audio_url: nextAudioUrl,
          asked_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!newQuestionError && newQuestion) {
        nextQuestionData = {
          id: newQuestion.id,
          number: newQuestion.question_number,
          text: analysis.nextQuestion,
          audioUrl: nextAudioUrl,
        }
      }
    }

    // Update session stats
    await supabase
      .from('interview_sessions')
      .update({
        total_questions: currentQuestion.question_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    return NextResponse.json({
      success: true,
      analysis: {
        score: analysis.score,
        relevance: analysis.relevance,
        clarity: analysis.clarity,
        confidence: analysis.confidence,
        technicalAccuracy: analysis.technicalAccuracy,
        starMethodUsage: analysis.starMethodUsage,
        feedback: analysis.feedback,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
      },
      continue: shouldContinue,
      nextQuestion: nextQuestionData,
      progress: {
        completed: currentQuestion.question_number,
        total: MAX_QUESTIONS,
        percentage: Math.round((currentQuestion.question_number / MAX_QUESTIONS) * 100),
      },
    })
  } catch (error: any) {
    console.error('Error processing answer:', error)

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process answer. Please try again.',
      },
      { status: 500 }
    )
  }
}

// Configure larger body size for audio uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
