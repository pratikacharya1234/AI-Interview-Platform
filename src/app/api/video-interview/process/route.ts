/**
 * API Route: Process Audio Chunk
 * POST /api/video-interview/process
 * Handles STT, LLM response generation, and TTS
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

    const formData = await request.formData()
    const sessionId = formData.get('session_id') as string
    const audioBlob = formData.get('audio') as Blob
    const sequenceNumber = parseInt(formData.get('sequence_number') as string)

    if (!sessionId || !audioBlob) {
      return NextResponse.json(
        { error: 'Missing session_id or audio' },
        { status: 400 }
      )
    }

    // Get session details
    const interviewSession = await videoInterviewService.getSession(sessionId)
    
    // Get persona
    const { data: persona } = await supabase
      .from('interviewer_personas')
      .select('*')
      .eq('id', interviewSession.persona_id)
      .single()

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    // Convert blob to buffer
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer())

    // Step 1: Transcribe audio using Whisper
    const transcription = await videoAIService.transcribeAudio(audioBuffer, 'webm')

    // Step 2: Analyze voice metrics
    const voiceMetrics = videoAIService.analyzeVoiceMetrics(
      transcription.text,
      transcription.duration * 1000
    )

    // Step 3: Save user transcript
    const userTranscript = await videoInterviewService.addTranscript(
      sessionId,
      'user',
      transcription.text,
      sequenceNumber,
      {
        audio_duration_ms: transcription.duration * 1000,
        speech_pace: voiceMetrics.speech_pace,
        pause_count: voiceMetrics.pause_count,
        filler_word_count: voiceMetrics.filler_word_count,
        volume_level: voiceMetrics.volume_level,
        confidence_score: transcription.confidence
      }
    )

    // Step 4: Get conversation history
    const transcripts = await videoInterviewService.getTranscripts(sessionId)
    const conversationHistory = transcripts.map(t => ({
      role: t.speaker === 'ai' ? 'assistant' : 'user',
      content: t.text
    }))

    // Step 5: Get last question for evaluation
    const { data: lastQuestion } = await supabase
      .from('video_interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single()

    // Step 6: Evaluate user response
    const evaluation = await videoAIService.evaluateResponse(
      transcription.text,
      lastQuestion?.question_text || 'Introduction',
      interviewSession.interview_type,
      voiceMetrics
    )

    // Step 7: Save feedback
    await videoInterviewService.addFeedback({
      session_id: sessionId,
      transcript_id: userTranscript.id,
      technical_score: evaluation.technical_score,
      clarity_score: evaluation.clarity_score,
      confidence_score: evaluation.confidence_score,
      behavioral_score: evaluation.behavioral_score,
      technical_feedback: evaluation.technical_feedback,
      clarity_feedback: evaluation.clarity_feedback,
      confidence_feedback: evaluation.confidence_feedback,
      behavioral_feedback: evaluation.behavioral_feedback,
      has_situation: evaluation.has_situation,
      has_task: evaluation.has_task,
      has_action: evaluation.has_action,
      has_result: evaluation.has_result,
      speech_quality_score: voiceMetrics.clarity_score,
      filler_words_detected: voiceMetrics.filler_words,
      overall_score: evaluation.overall_score,
      feedback_summary: evaluation.feedback_summary,
      improvement_suggestions: evaluation.improvement_suggestions,
      evaluator_model: 'gpt-4'
    })

    // Step 8: Generate next question
    const nextQuestionNumber = sequenceNumber + 1
    const interviewerResponse = await videoAIService.generateInterviewerQuestion(
      persona,
      conversationHistory,
      interviewSession.job_title,
      interviewSession.interview_type,
      nextQuestionNumber,
      transcription.text
    )

    // Step 9: Save AI question
    await videoInterviewService.addQuestion(
      sessionId,
      interviewerResponse.question,
      interviewerResponse.question_type,
      nextQuestionNumber,
      'claude-3',
      userTranscript.id
    )

    // Step 10: Generate TTS for AI response
    const voice = videoAIService.selectVoiceForPersona(persona)
    const ttsResult = await videoAIService.generateSpeech(
      interviewerResponse.question,
      voice
    )

    // Step 11: Save AI transcript
    await videoInterviewService.addTranscript(
      sessionId,
      'ai',
      interviewerResponse.question,
      nextQuestionNumber,
      {
        audio_duration_ms: ttsResult.duration_ms
      }
    )

    // Step 12: Get updated live metrics
    const liveMetrics = await videoInterviewService.getLiveMetrics(sessionId)

    // Return response
    return NextResponse.json({
      success: true,
      transcription: {
        text: transcription.text,
        confidence: transcription.confidence
      },
      voice_metrics: voiceMetrics,
      evaluation: {
        technical_score: evaluation.technical_score,
        clarity_score: evaluation.clarity_score,
        confidence_score: evaluation.confidence_score,
        behavioral_score: evaluation.behavioral_score,
        overall_score: evaluation.overall_score,
        feedback_summary: evaluation.feedback_summary
      },
      interviewer_response: {
        question: interviewerResponse.question,
        audio_data: ttsResult.audio_data?.toString('base64'),
        duration_ms: ttsResult.duration_ms
      },
      live_metrics: liveMetrics
    })
  } catch (error: any) {
    console.error('Process audio error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process audio' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}
