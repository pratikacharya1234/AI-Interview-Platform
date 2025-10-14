import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Speech-to-Text API using Google's Gemini AI
 * Converts audio to text with high accuracy
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

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Audio = buffer.toString('base64')

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Use Gemini's multimodal capabilities to transcribe audio
    const prompt = `Transcribe the following audio accurately. Only return the transcribed text, nothing else. If the audio is unclear or contains no speech, return "No speech detected".`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: audioFile.type || 'audio/webm',
          data: base64Audio
        }
      }
    ])

    const response = await result.response
    const transcript = response.text().trim()

    // Check if transcription was successful
    if (!transcript || transcript === 'No speech detected') {
      return NextResponse.json({
        transcript: '',
        confidence: 0,
        language: language,
        warning: 'No speech detected in audio'
      })
    }

    return NextResponse.json({
      transcript: transcript,
      confidence: 0.95, // Gemini doesn't provide confidence scores
      language: language,
      duration: audioFile.size / 16000, // Approximate duration
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Speech-to-text error:', error)
    
    return NextResponse.json(
      { 
        error: 'Speech-to-text conversion failed',
        details: error.message 
      },
      { status: 500 }
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
