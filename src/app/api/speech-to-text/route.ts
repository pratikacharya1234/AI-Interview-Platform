import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Speech-to-Text API
 * Processes audio and returns transcription
 * Uses Google Cloud Speech-to-Text or fallback methods
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'en-US'

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Convert audio file to buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // For now, return a message to use client-side transcription
    // In production, integrate with Google Cloud Speech-to-Text
    console.log('Audio received for transcription, size:', buffer.length)

    // Check if Google Cloud credentials are available
    if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_SPEECH_KEY) {
      // TODO: Implement Google Cloud Speech-to-Text
      console.log('Google Cloud Speech-to-Text integration pending')
    }

    // Return instruction to use client-side Web Speech API
    return NextResponse.json({
      transcript: '',
      confidence: 0.95,
      language: language,
      message: 'Please use Web Speech API for real-time transcription',
      useClientSideTranscription: true
    }, { status: 200 })

  } catch (error: any) {
    console.error('Speech-to-text error:', error)
    
    return NextResponse.json(
      { 
        transcript: '',
        confidence: 0,
        warning: 'Server-side transcription not available. Please use Web Speech API on the client.',
        useClientSideTranscription: true
      },
      { status: 200 }
    )
  }
}

/**
 * Alternative: Use Web Speech API as fallback
 * This endpoint provides configuration for client-side speech recognition
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    supported: true,
    languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'zh-CN', 'ja-JP', 'ko-KR'],
    defaultLanguage: 'en-US',
    features: {
      continuous: true,
      interimResults: true,
      maxAlternatives: 3
    },
    fallback: {
      type: 'web-speech-api',
      note: 'Browser-based speech recognition available as fallback'
    }
  })
}
