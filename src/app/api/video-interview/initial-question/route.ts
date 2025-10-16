/**
 * API Route: Get Initial Question
 * POST /api/video-interview/initial-question
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { videoInterviewService } from '@/lib/services/video-interview-service'
import { videoAIService } from '@/lib/services/video-ai-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    // Get session details
    const interviewSession = await videoInterviewService.getSession(session_id)
    
    // Get persona
    const { data: persona } = await supabase
      .from('interviewer_personas')
      .select('*')
      .eq('id', interviewSession.persona_id)
      .single()

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    // Generate first question
    const interviewerResponse = await videoAIService.generateInterviewerQuestion(
      persona,
      [],
      interviewSession.job_title,
      interviewSession.interview_type,
      1
    )

    // Save question
    await videoInterviewService.addQuestion(
      session_id,
      interviewerResponse.question,
      interviewerResponse.question_type,
      1,
      'claude-3'
    )

    // Generate TTS
    const voice = videoAIService.selectVoiceForPersona(persona)
    const ttsResult = await videoAIService.generateSpeech(
      interviewerResponse.question,
      voice
    )

    // Save AI transcript
    await videoInterviewService.addTranscript(
      session_id,
      'ai',
      interviewerResponse.question,
      1,
      {
        audio_duration_ms: ttsResult.duration_ms
      }
    )

    return NextResponse.json({
      success: true,
      question: interviewerResponse.question,
      audio_data: ttsResult.audio_data?.toString('base64'),
      duration_ms: ttsResult.duration_ms
    })
  } catch (error: any) {
    console.error('Initial question error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get initial question' },
      { status: 500 }
    )
  }
}
