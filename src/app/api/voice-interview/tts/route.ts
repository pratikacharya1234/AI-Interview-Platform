import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Try ElevenLabs first
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const response = await fetch(
          'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Rachel voice
          {
            method: 'POST',
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            })
          }
        )

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer()
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg'
            }
          })
        }
      } catch (error) {
        console.error('ElevenLabs TTS error:', error)
      }
    }

    // Try Google Text-to-Speech
    if (process.env.GOOGLE_CLOUD_API_KEY) {
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text },
              voice: {
                languageCode: 'en-US',
                name: 'en-US-Neural2-F',
                ssmlGender: 'FEMALE'
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          const audioBuffer = Buffer.from(data.audioContent, 'base64')
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg'
            }
          })
        }
      } catch (error) {
        console.error('Google TTS error:', error)
      }
    }

    // Fallback: Return empty audio or error
    return NextResponse.json(
      { error: 'TTS service not available. Please use browser TTS.' },
      { status: 503 }
    )

  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
