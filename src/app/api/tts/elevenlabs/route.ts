import { NextRequest, NextResponse } from 'next/server'
import { ApplicationError, ErrorType, Logger, Validator, withRetry } from '@/lib/utils/error-handling'

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'Rachel', model = 'eleven_monolingual_v1' } = await request.json()

    // Validate input
    Validator.validateRequired(text, 'Text')
    Validator.validateStringLength(text, 'Text', 1, 2500)

    if (!process.env.ELEVENLABS_API_KEY) {
      // Return a message indicating browser TTS should be used
      console.log('ElevenLabs API key not configured, using browser TTS fallback')
      return NextResponse.json(
        { 
          message: 'Using browser text-to-speech',
          fallback: 'browser_tts',
          text: text
        },
        { status: 200 }
      )
    }

    // Get available voices and select appropriate one
    const voiceId = await getVoiceId(voice)

    // Generate speech with retry mechanism
    const audioBuffer = await withRetry(async () => {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new ApplicationError(
          ErrorType.AI_SERVICE,
          `ElevenLabs API error: ${response.status} - ${error.detail || error.error || 'Unknown error'}`,
          { status: response.status, error }
        )
      }

      return await response.arrayBuffer()
    }, 3, 1000, ErrorType.AI_SERVICE)

    Logger.info('TTS generation successful', { 
      textLength: text.length, 
      voice, 
      audioSize: audioBuffer.byteLength 
    })

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    Logger.error(error as ApplicationError)
    
    if (error instanceof ApplicationError) {
      return NextResponse.json(
        { error: error.message, type: error.type },
        { status: error.type === ErrorType.VALIDATION ? 400 : 500 }
      )
    }

    return NextResponse.json(
      { error: 'Text-to-speech generation failed', type: ErrorType.AI_SERVICE },
      { status: 500 }
    )
  }
}

// Cache for voice IDs to avoid repeated API calls
const voiceCache = new Map<string, string>()

async function getVoiceId(voiceName: string): Promise<string> {
  // Check cache first
  if (voiceCache.has(voiceName)) {
    return voiceCache.get(voiceName)!
  }

  // Default voice IDs for common voices
  const defaultVoices: Record<string, string> = {
    'Rachel': '21m00Tcm4TlvDq8ikWAM', // Professional female voice
    'Adam': 'pNInz6obpgDQGcFmaJgB',   // Professional male voice
    'Domi': 'AZnzlk1XvdvUeBnXmlld',   // Friendly female voice
    'Elli': 'MF3mGyEYCl7XYWbV9V6O',   // Young female voice
    'Josh': 'TxGEqnHWrfWFTfGW9XjX',   // Young male voice
    'Arnold': 'VR6AewLTigWG4xSOukaG', // Mature male voice
    'Sam': 'yoZ06aMxZJJ28mfd3POQ'     // Mature male voice
  }

  if (defaultVoices[voiceName]) {
    voiceCache.set(voiceName, defaultVoices[voiceName])
    return defaultVoices[voiceName]
  }

  try {
    // Fetch available voices from ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      }
    })

    if (response.ok) {
      const data = await response.json()
      const voice = data.voices?.find((v: any) => 
        v.name.toLowerCase() === voiceName.toLowerCase()
      )
      
      if (voice) {
        voiceCache.set(voiceName, voice.voice_id)
        return voice.voice_id
      }
    }
  } catch (error) {
    Logger.warn('Failed to fetch voice list, using default', { voiceName, error })
  }

  // Fallback to Rachel if voice not found
  const fallbackVoiceId = defaultVoices['Rachel']
  voiceCache.set(voiceName, fallbackVoiceId)
  return fallbackVoiceId
}