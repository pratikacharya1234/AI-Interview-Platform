export class VoiceStreamManager {
  private audioContext: AudioContext | null = null
  private audioQueue: AudioBuffer[] = []
  private isPlaying: boolean = false
  private currentSource: AudioBufferSourceNode | null = null

  constructor() {
    // AudioContext will be created on first use after user interaction
    this.audioContext = null
  }

  async initializeAudio(): Promise<void> {
    try {
      // Only create AudioContext when needed and after user gesture
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      console.log('AudioContext initialized successfully:', this.audioContext.state)
    } catch (error) {
      console.warn('AudioContext initialization deferred until user interaction:', error)
    }
  }

  async playTextWithElevenLabs(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<void> {
    try {
      console.log('Generating speech for:', text.substring(0, 50) + '...')
      
      // Initialize audio context if needed (after user interaction)
      await this.initializeAudio()
      
      // Call our ElevenLabs API
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voiceId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('ElevenLabs API error:', errorData)
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      // Get audio data
      const audioData = await response.arrayBuffer()
      
      // Convert to AudioBuffer and play
      await this.playAudioBuffer(audioData)
      
    } catch (error) {
      console.error('Error playing ElevenLabs audio:', error)
      // Fallback to browser TTS
      this.fallbackToWebSpeech(text)
    }
  }

  private async playAudioBuffer(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) return

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
      console.error('Error decoding audio:', error)
      throw error
    }
  }

  private fallbackToWebSpeech(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Try to use a female voice for Sarah
      const voices = speechSynthesis.getVoices()
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('karen')
      )
      
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  async getAIResponse(message: string, conversationHistory: any[] = [], interviewContext: any = {}): Promise<string> {
    try {
      console.log('Getting AI response for:', message.substring(0, 50) + '...')
      
      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: conversationHistory,
          interviewContext: interviewContext
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response

    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback responses
      const fallbacks = [
        "That's interesting. Could you tell me more about your experience with that?",
        "Thank you for sharing. Can you give me a specific example?",
        "I see. How did you handle challenges in that situation?",
        "That's great. What did you learn from that experience?"
      ]
      
      return fallbacks[Math.floor(Math.random() * fallbacks.length)]
    }
  }

  async processVoiceResponse(message: string, conversationHistory: any[] = [], interviewContext: any = {}): Promise<string> {
    try {
      // Get AI response
      const aiResponse = await this.getAIResponse(message, conversationHistory, interviewContext)
      
      // Play the response with ElevenLabs
      await this.playTextWithElevenLabs(aiResponse)
      
      return aiResponse

    } catch (error) {
      console.error('Error processing voice response:', error)
      throw error
    }
  }

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

  isCurrentlyPlaying(): boolean {
    return this.isPlaying
  }

  cleanup(): void {
    this.stopCurrentAudio()
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}