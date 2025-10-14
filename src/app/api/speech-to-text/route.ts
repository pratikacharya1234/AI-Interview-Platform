import { NextRequest, NextResponse } from 'next/server'

/**
 * Speech-to-Text API Fallback
 * Note: This endpoint is a fallback. The primary transcription happens
 * client-side using Web Speech API for better reliability and speed.
 * 
 * This endpoint returns a helpful message directing to use Web Speech API.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'en-US'

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    console.log('⚠️ Server-side transcription called. Web Speech API should be used instead.')

    // Return a message indicating Web Speech API should be used
    // This is a fallback that shouldn't normally be reached
    return NextResponse.json({
      transcript: '',
      confidence: 0,
      language: language,
      warning: 'Server-side transcription not available. Please use Web Speech API on the client.',
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
