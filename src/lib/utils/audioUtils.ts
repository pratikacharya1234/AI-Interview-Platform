/**
 * Audio Utilities
 *
 * Helper functions for audio recording, conversion, and processing
 */

/**
 * Check if browser supports audio recording
 */
export function isAudioRecordingSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    window.MediaRecorder
  )
}

/**
 * Get supported audio MIME types
 */
export function getSupportedMimeTypes(): string[] {
  const types = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg',
  ]

  return types.filter(type => MediaRecorder.isTypeSupported(type))
}

/**
 * Get best supported audio MIME type
 */
export function getBestMimeType(): string {
  const supported = getSupportedMimeTypes()
  return supported[0] || 'audio/webm'
}

/**
 * Request microphone permission
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Stop the stream immediately, we just needed permission
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}

/**
 * Get audio duration from blob
 */
export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
    audio.addEventListener('error', reject)
    audio.src = URL.createObjectURL(blob)
  })
}

/**
 * Convert audio blob to base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Convert base64 to blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Compress audio blob (reduce quality/bitrate)
 */
export async function compressAudio(
  blob: Blob,
  targetSizeKB: number = 500
): Promise<Blob> {
  // If already small enough, return as is
  if (blob.size / 1024 <= targetSizeKB) {
    return blob
  }

  // For now, return the original blob
  // Full implementation would involve re-encoding with lower bitrate
  // This requires Web Audio API and is complex
  console.warn('Audio compression not yet implemented')
  return blob
}

/**
 * Validate audio file
 */
export function validateAudioFile(
  blob: Blob,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg']
): { valid: boolean; error?: string } {
  // Check size
  const sizeMB = blob.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum (${maxSizeMB}MB)`,
    }
  }

  // Check type
  if (!allowedTypes.includes(blob.type)) {
    return {
      valid: false,
      error: `File type ${blob.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Create audio context
 */
export function createAudioContext(): AudioContext {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  return new AudioContextClass()
}

/**
 * Analyze audio volume/level
 */
export function createAudioAnalyser(stream: MediaStream): {
  audioContext: AudioContext
  analyser: AnalyserNode
  dataArray: Uint8Array
} {
  const audioContext = createAudioContext()
  const source = audioContext.createMediaStreamSource(stream)
  const analyser = audioContext.createAnalyser()

  analyser.fftSize = 256
  source.connect(analyser)

  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  return { audioContext, analyser, dataArray }
}

/**
 * Get current audio level (0-100)
 */
export function getAudioLevel(analyser: AnalyserNode, dataArray: Uint8Array<ArrayBuffer>): number {
  analyser.getByteFrequencyData(dataArray)

  const average = dataArray.reduce((a, b) => a + b) / dataArray.length
  return Math.round((average / 255) * 100)
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Download audio blob as file
 */
export function downloadAudio(blob: Blob, filename: string = 'recording.webm'): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Play audio blob
 */
export function playAudio(blob: Blob): HTMLAudioElement {
  const audio = new Audio(URL.createObjectURL(blob))
  audio.play().catch(error => {
    console.error('Error playing audio:', error)
  })
  return audio
}

/**
 * Stop all audio playback
 */
export function stopAllAudio(): void {
  const audios = document.querySelectorAll('audio')
  audios.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
}

/**
 * Check if audio is playing
 */
export function isAudioPlaying(audio: HTMLAudioElement): boolean {
  return !audio.paused && !audio.ended && audio.currentTime > 0
}

/**
 * Convert audio blob to WAV format (if needed for compatibility)
 * Note: This is a simplified version, full implementation requires Web Audio API
 */
export async function convertToWAV(blob: Blob): Promise<Blob> {
  // For now, return the original blob
  // Full implementation would decode audio and re-encode as WAV
  console.warn('WAV conversion not yet implemented')
  return blob
}

/**
 * Merge multiple audio blobs into one
 */
export async function mergeAudioBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 0) {
    throw new Error('No audio blobs to merge')
  }

  if (blobs.length === 1) {
    return blobs[0]
  }

  // Simple concatenation (may not work perfectly for all formats)
  return new Blob(blobs, { type: blobs[0].type })
}

/**
 * Estimate file size for duration
 * Assumes 128kbps bitrate for audio
 */
export function estimateAudioFileSize(durationSeconds: number, bitrate: number = 128): number {
  // bitrate is in kbps
  const bytesPerSecond = (bitrate * 1000) / 8
  return Math.ceil(durationSeconds * bytesPerSecond)
}

/**
 * Check if device has microphone
 */
export async function hasMicrophone(): Promise<boolean> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some(device => device.kind === 'audioinput')
  } catch (error) {
    console.error('Error checking for microphone:', error)
    return false
  }
}

/**
 * Get available audio input devices
 */
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(device => device.kind === 'audioinput')
  } catch (error) {
    console.error('Error getting audio devices:', error)
    return []
  }
}
