/**
 * Enhanced Voice Stream Manager
 * Production-ready voice interview system with real API integration
 * - Uses ElevenLabs for natural TTS
 * - Uses Gemini for speech-to-text
 * - Uses Gemini for intelligent AI responses
 */

export class EnhancedVoiceStreamManager {
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private isPlaying: boolean = false
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private recordingStream: MediaStream | null = null

  constructor() {
    this.audioContext = null
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async initializeAudio(): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      console.log('✅ AudioContext initialized:', this.audioContext.state)
    } catch (error) {
      console.error('❌ AudioContext initialization failed:', error)
      throw error
    }
  }

  /**
   * Start recording user audio for speech-to-text
   */
  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.recordingStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 }
        }
      })

      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      this.mediaRecorder = new MediaRecorder(this.recordingStream, {
        mimeType,
        audioBitsPerSecond: 128000
      })

      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(100) // Collect data every 100ms
      console.log('🎤 Recording started')

    } catch (error) {
      console.error('❌ Failed to start recording:', error)
      throw error
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
        
        // Stop all tracks
        if (this.recordingStream) {
          this.recordingStream.getTracks().forEach(track => track.stop())
          this.recordingStream = null
        }

        console.log('🎤 Recording stopped, blob size:', audioBlob.size)
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
      this.mediaRecorder = null
    })
  }

  /**
   * Convert audio to text using Gemini API
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('🎯 Transcribing audio with Gemini...')

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', 'en-US')

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.warning) {
        console.warn('⚠️', data.warning)
      }

      console.log('✅ Transcription:', data.transcript)
      return data.transcript || ''

    } catch (error) {
      console.error('❌ Transcription error:', error)
      throw error
    }
  }

  /**
   * Get AI response using Gemini
   */
  async getAIResponse(
    message: string,
    conversationHistory: any[] = [],
    interviewContext: any = {}
  ): Promise<string> {
    try {
      console.log('🧠 Getting AI response from Gemini...')

      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          interviewContext
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ AI response received')
      return data.response

    } catch (error) {
      console.error('❌ AI response error:', error)
      throw error
    }
  }

  /**
   * Speak text using ElevenLabs TTS
   */
  async speakText(text: string, voiceId: string = 'Rachel'): Promise<void> {
    try {
      console.log('🔊 Generating speech with ElevenLabs...')

      // Initialize audio context if needed
      await this.initializeAudio()

      // Call ElevenLabs API
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voiceId
        })
      })

      if (!response.ok) {
        console.warn('⚠️ ElevenLabs failed, using fallback')
        this.fallbackToWebSpeech(text)
        return
      }

      // Get audio data
      const audioData = await response.arrayBuffer()
      
      // Play audio
      await this.playAudioBuffer(audioData)
      console.log('✅ Speech playback complete')

    } catch (error) {
      console.error('❌ Speech generation error:', error)
      // Fallback to browser TTS
      this.fallbackToWebSpeech(text)
    }
  }

  /**
   * Play audio buffer
   */
  private async playAudioBuffer(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData)
      
      // Stop current audio if playing
      if (this.currentSource) {
        this.currentSource.stop()
        this.currentSource.disconnect()
      }

      // Create and play new audio
      this.currentSource = this.audioContext.createBufferSource()
      this.currentSource.buffer = audioBuffer
      this.currentSource.connect(this.audioContext.destination)
      
      return new Promise((resolve) => {
        if (this.currentSource) {
          this.currentSource.onended = () => {
            this.isPlaying = false
            resolve()
          }
          this.currentSource.start()
          this.isPlaying = true
        } else {
          resolve()
        }
      })
      
    } catch (error) {
      console.error('❌ Error decoding audio:', error)
      throw error
    }
  }

  /**
   * Fallback to browser's Web Speech API
   */
  private fallbackToWebSpeech(text: string): void {
    if ('speechSynthesis' in window) {
      console.log('🔄 Using browser TTS as fallback')
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Try to use a professional voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('female')
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  /**
   * Complete voice interaction: record, transcribe, get AI response, speak
   */
  async processVoiceInteraction(
    conversationHistory: any[] = [],
    interviewContext: any = {}
  ): Promise<{ transcript: string; aiResponse: string }> {
    try {
      // 1. Start recording
      await this.startRecording()
      
      // 2. Wait for user to finish speaking (you'll need to implement pause detection)
      // For now, we'll record for a fixed duration or until manually stopped
      
      // 3. Stop recording and get audio
      const audioBlob = await this.stopRecording()
      
      // 4. Transcribe audio
      const transcript = await this.transcribeAudio(audioBlob)
      
      if (!transcript) {
        throw new Error('No speech detected')
      }
      
      // 5. Get AI response
      const aiResponse = await this.getAIResponse(
        transcript,
        conversationHistory,
        interviewContext
      )
      
      // 6. Speak AI response
      await this.speakText(aiResponse)
      
      return { transcript, aiResponse }
      
    } catch (error) {
      console.error('❌ Voice interaction error:', error)
      throw error
    }
  }

  /**
   * Stop current audio playback
   */
  stopCurrentAudio(): void {
    if (this.currentSource) {
      this.currentSource.stop()
      this.currentSource.disconnect()
      this.currentSource = null
    }
    this.isPlaying = false
    
    // Also stop web speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }

  /**
   * Check if audio is currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopCurrentAudio()
    
    // Stop recording if active
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    
    // Stop recording stream
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach(track => track.stop())
      this.recordingStream = null
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}

// Export singleton instance
export const voiceStreamManager = new EnhancedVoiceStreamManager()
