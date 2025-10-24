/**
 * Google Cloud Text-to-Speech Service
 *
 * Converts AI interviewer responses to natural speech
 */

import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Initialize TTS client
const ttsClient = new TextToSpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: process.env.GOOGLE_CLOUD_TTS_KEY
    ? JSON.parse(process.env.GOOGLE_CLOUD_TTS_KEY)
    : undefined,
})

/**
 * TTS configuration options
 */
export interface TTSOptions {
  languageCode?: string
  voiceName?: string
  speakingRate?: number // 0.25 to 4.0
  pitch?: number // -20.0 to 20.0
  volumeGainDb?: number
}

/**
 * Default voice configuration
 */
const DEFAULT_OPTIONS: TTSOptions = {
  languageCode: 'en-US',
  voiceName: 'en-US-Studio-O', // Professional, natural voice
  speakingRate: 1.0,
  pitch: 0,
  volumeGainDb: 0,
}

/**
 * Convert text to speech and return audio buffer
 */
export async function convertTextToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<Buffer> {
  const config = { ...DEFAULT_OPTIONS, ...options }

  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: {
      languageCode: config.languageCode,
      name: config.voiceName,
      ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL,
    },
    audioConfig: {
      audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      speakingRate: config.speakingRate,
      pitch: config.pitch,
      volumeGainDb: config.volumeGainDb,
      effectsProfileId: ['headphone-class-device'], // Optimize for headphones
    },
  }

  try {
    const [response] = await ttsClient.synthesizeSpeech(request)

    if (!response.audioContent) {
      throw new Error('No audio content returned from TTS')
    }

    return Buffer.from(response.audioContent as Uint8Array)
  } catch (error) {
    console.error('TTS conversion error:', error)
    throw new Error('Failed to convert text to speech')
  }
}

/**
 * Generate audio and upload to Supabase Storage
 * Returns the public URL of the audio file
 */
export async function generateAndStoreAudio(
  text: string,
  sessionId: string,
  questionNumber: number,
  options: TTSOptions = {}
): Promise<string> {
  try {
    // Generate audio
    const audioBuffer = await convertTextToSpeech(text, options)

    // Upload to Supabase Storage
    const cookieStore = await cookies()
    const supabase = await (await import('@/lib/supabase/server')).createClient(cookieStore)

    const fileName = `${sessionId}/question-${questionNumber}.mp3`
    const filePath = `interview-audio/${fileName}`

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error('Failed to upload audio file')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error generating and storing audio:', error)
    throw error
  }
}

/**
 * Get cached audio URL or generate new one
 * Helps reduce TTS API costs by caching frequently used responses
 */
export async function getCachedOrGenerateAudio(
  text: string,
  cacheKey: string,
  sessionId: string,
  questionNumber: number,
  options: TTSOptions = {}
): Promise<string> {
  const cookieStore = await cookies()
  const supabase = await (await import('@/lib/supabase/server')).createClient(cookieStore)

  // Check if cached audio exists
  const { data: cached } = await supabase
    .from('audio_cache')
    .select('audio_url')
    .eq('cache_key', cacheKey)
    .single()

  if (cached?.audio_url) {
    return cached.audio_url
  }

  // Generate new audio
  const audioUrl = await generateAndStoreAudio(text, sessionId, questionNumber, options)

  // Cache the URL
  await supabase.from('audio_cache').insert({
    cache_key: cacheKey,
    text,
    audio_url: audioUrl,
  })

  return audioUrl
}

/**
 * Batch convert multiple texts to speech
 * Useful for pre-generating standard interview questions
 */
export async function batchConvertToSpeech(
  texts: string[],
  options: TTSOptions = {}
): Promise<Buffer[]> {
  const promises = texts.map((text) => convertTextToSpeech(text, options))
  return Promise.all(promises)
}

/**
 * Get available voices for a language
 */
export async function getAvailableVoices(languageCode: string = 'en-US') {
  try {
    const [response] = await ttsClient.listVoices({ languageCode })
    return response.voices || []
  } catch (error) {
    console.error('Error fetching voices:', error)
    return []
  }
}

/**
 * Estimate audio duration in seconds
 * Rough estimate: ~150 words per minute for normal speech
 */
export function estimateAudioDuration(text: string, speakingRate: number = 1.0): number {
  const wordCount = text.split(/\s+/).length
  const baseWPM = 150
  const actualWPM = baseWPM * speakingRate
  const minutes = wordCount / actualWPM
  return Math.ceil(minutes * 60)
}

/**
 * Clean text for better TTS pronunciation
 */
export function cleanTextForTTS(text: string): string {
  return text
    .replace(/\n+/g, '. ') // Replace newlines with periods
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([a-z])([A-Z])/g, '$1. $2') // Add period between camelCase
    .trim()
}
