/**
 * Video AI Service
 * Handles STT (Whisper), LLM (GPT-4/Claude), and TTS integrations
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { Readable } from 'stream'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!
})

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptionResult {
  text: string
  language: string
  duration: number
  confidence?: number
}

export interface VoiceMetrics {
  speech_pace: number // words per minute
  pause_count: number
  filler_word_count: number
  filler_words: string[]
  volume_level: number
  clarity_score: number
}

export interface InterviewerResponse {
  question: string
  context: string
  follow_up: boolean
  question_type: 'technical' | 'behavioral' | 'follow-up' | 'clarification'
}

export interface EvaluationResult {
  technical_score: number
  clarity_score: number
  confidence_score: number
  behavioral_score: number
  technical_feedback: string
  clarity_feedback: string
  confidence_feedback: string
  behavioral_feedback: string
  has_situation: boolean
  has_task: boolean
  has_action: boolean
  has_result: boolean
  overall_score: number
  feedback_summary: string
  improvement_suggestions: string[]
}

export interface TTSResult {
  audio_url: string
  audio_data?: Buffer
  duration_ms: number
  format: string
}

// ============================================================================
// VIDEO AI SERVICE
// ============================================================================

export class VideoAIService {

  /**
   * Transcribe audio using Whisper API
   */
  async transcribeAudio(audioBuffer: Buffer, format: string = 'webm'): Promise<TranscriptionResult> {
    try {
      // Convert Buffer to Uint8Array for File constructor
      const uint8Array = new Uint8Array(audioBuffer)
      const file = new File([uint8Array], `audio.${format}`, { type: `audio/${format}` })
      
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json'
      })

      return {
        text: transcription.text,
        language: transcription.language || 'en',
        duration: transcription.duration || 0,
        confidence: 0.95 // Whisper doesn't provide confidence, using default
      }
    } catch (error: any) {
      console.error('Whisper transcription error:', error)
      throw new Error(`Transcription failed: ${error.message}`)
    }
  }

  /**
   * Analyze voice metrics from transcript
   */
  analyzeVoiceMetrics(text: string, durationMs: number): VoiceMetrics {
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const durationMinutes = durationMs / 60000
    const speechPace = durationMinutes > 0 ? wordCount / durationMinutes : 0

    // Detect filler words
    const fillerWordPatterns = [
      'um', 'uh', 'like', 'you know', 'actually', 'basically',
      'literally', 'so', 'well', 'i mean', 'kind of', 'sort of'
    ]
    
    const fillerWords: string[] = []
    let fillerWordCount = 0
    
    const lowerText = text.toLowerCase()
    fillerWordPatterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) {
        fillerWordCount += matches.length
        fillerWords.push(...matches)
      }
    })

    // Detect pauses (multiple spaces or punctuation patterns)
    const pauseCount = (text.match(/[.!?]+\s+/g) || []).length

    // Calculate clarity score (inverse of filler word ratio)
    const fillerRatio = wordCount > 0 ? fillerWordCount / wordCount : 0
    const clarityScore = Math.max(0, Math.min(10, 10 - (fillerRatio * 50)))

    return {
      speech_pace: Math.round(speechPace),
      pause_count: pauseCount,
      filler_word_count: fillerWordCount,
      filler_words: fillerWords,
      volume_level: 0.75, // Would need actual audio analysis
      clarity_score: Number(clarityScore.toFixed(1))
    }
  }

  /**
   * Generate interviewer question using LLM
   */
  async generateInterviewerQuestion(
    persona: any,
    conversationHistory: Array<{ role: string; content: string }>,
    jobTitle: string,
    interviewType: string,
    questionNumber: number,
    userResponse?: string
  ): Promise<InterviewerResponse> {
    try {
      const systemPrompt = this.buildInterviewerSystemPrompt(persona, jobTitle, interviewType)
      
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ]

      // Add conversation history
      messages.push(...conversationHistory)

      // Add instruction for next question
      if (userResponse) {
        messages.push({
          role: 'user',
          content: `The candidate just answered: "${userResponse}". Generate a relevant follow-up question or move to the next topic.`
        })
      } else {
        messages.push({
          role: 'user',
          content: `This is question #${questionNumber}. Generate an appropriate ${interviewType} interview question for a ${jobTitle} position.`
        })
      }

      // Use Claude for more natural conversation
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: messages.map(m => ({
          role: m.role === 'system' ? 'user' : m.role as 'user' | 'assistant',
          content: m.role === 'system' ? `System instructions: ${m.content}` : m.content
        }))
      })

      const questionText = response.content[0].type === 'text' ? response.content[0].text : ''

      return {
        question: questionText,
        context: `Question ${questionNumber} for ${jobTitle}`,
        follow_up: !!userResponse,
        question_type: userResponse ? 'follow-up' : this.determineQuestionType(questionText, interviewType)
      }
    } catch (error: any) {
      console.error('Question generation error:', error)
      
      // Fallback to GPT-4
      return this.generateQuestionWithGPT4(persona, conversationHistory, jobTitle, interviewType, questionNumber, userResponse)
    }
  }

  /**
   * Fallback question generation with GPT-4
   */
  private async generateQuestionWithGPT4(
    persona: any,
    conversationHistory: Array<{ role: string; content: string }>,
    jobTitle: string,
    interviewType: string,
    questionNumber: number,
    userResponse?: string
  ): Promise<InterviewerResponse> {
    const systemPrompt = this.buildInterviewerSystemPrompt(persona, jobTitle, interviewType)
    
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ]

    if (userResponse) {
      messages.push({
        role: 'user',
        content: `Generate a follow-up question based on: "${userResponse}"`
      })
    } else {
      messages.push({
        role: 'user',
        content: `Generate question #${questionNumber} for ${interviewType} interview`
      })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7
    })

    const questionText = response.choices[0].message.content || 'Tell me about yourself.'

    return {
      question: questionText,
      context: `Question ${questionNumber}`,
      follow_up: !!userResponse,
      question_type: this.determineQuestionType(questionText, interviewType)
    }
  }

  /**
   * Build system prompt for interviewer
   */
  private buildInterviewerSystemPrompt(persona: any, jobTitle: string, interviewType: string): string {
    return `You are ${persona.name}, an experienced ${persona.role} conducting a ${interviewType} interview for a ${jobTitle} position.

Your personality: ${persona.personality_traits?.join(', ')}
Interview style: ${persona.interview_style}
Focus areas: ${persona.focus_areas?.join(', ')}

Guidelines:
- Ask one clear, focused question at a time
- Keep questions concise and professional
- Adapt follow-ups based on candidate responses
- Maintain a ${persona.tone || 'professional'} tone
- For technical questions, focus on problem-solving and depth
- For behavioral questions, encourage STAR method responses
- Be encouraging but thorough

Generate your next interview question.`
  }

  /**
   * Determine question type from content
   */
  private determineQuestionType(
    question: string,
    interviewType: string
  ): 'technical' | 'behavioral' | 'follow-up' | 'clarification' {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('tell me about a time') || lowerQuestion.includes('describe a situation')) {
      return 'behavioral'
    }
    
    if (lowerQuestion.includes('how would you') || lowerQuestion.includes('what is') || 
        lowerQuestion.includes('explain') || lowerQuestion.includes('implement')) {
      return 'technical'
    }
    
    if (lowerQuestion.includes('can you clarify') || lowerQuestion.includes('what do you mean')) {
      return 'clarification'
    }
    
    return interviewType === 'behavioral' ? 'behavioral' : 'technical'
  }

  /**
   * Evaluate user response
   */
  async evaluateResponse(
    userResponse: string,
    question: string,
    interviewType: string,
    voiceMetrics: VoiceMetrics
  ): Promise<EvaluationResult> {
    try {
      const evaluationPrompt = this.buildEvaluationPrompt(userResponse, question, interviewType, voiceMetrics)

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview evaluator. Provide structured, objective feedback with scores from 0-10.'
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })

      const evaluation = JSON.parse(response.choices[0].message.content || '{}')

      // Ensure all required fields
      return {
        technical_score: evaluation.technical_score || 5,
        clarity_score: evaluation.clarity_score || voiceMetrics.clarity_score,
        confidence_score: this.calculateConfidenceScore(voiceMetrics),
        behavioral_score: evaluation.behavioral_score || 5,
        technical_feedback: evaluation.technical_feedback || 'Response noted.',
        clarity_feedback: evaluation.clarity_feedback || 'Clear communication.',
        confidence_feedback: this.generateConfidenceFeedback(voiceMetrics),
        behavioral_feedback: evaluation.behavioral_feedback || 'Good structure.',
        has_situation: evaluation.has_situation || false,
        has_task: evaluation.has_task || false,
        has_action: evaluation.has_action || false,
        has_result: evaluation.has_result || false,
        overall_score: evaluation.overall_score || 5,
        feedback_summary: evaluation.feedback_summary || 'Good response.',
        improvement_suggestions: evaluation.improvement_suggestions || []
      }
    } catch (error: any) {
      console.error('Evaluation error:', error)
      
      // Return basic evaluation
      return this.generateBasicEvaluation(userResponse, voiceMetrics)
    }
  }

  /**
   * Build evaluation prompt
   */
  private buildEvaluationPrompt(
    userResponse: string,
    question: string,
    interviewType: string,
    voiceMetrics: VoiceMetrics
  ): string {
    return `Evaluate this interview response:

Question: ${question}
Interview Type: ${interviewType}
Candidate Response: ${userResponse}

Voice Metrics:
- Speech pace: ${voiceMetrics.speech_pace} words/min (optimal: 120-150)
- Filler words: ${voiceMetrics.filler_word_count}
- Pauses: ${voiceMetrics.pause_count}

Provide evaluation in JSON format:
{
  "technical_score": <0-10>,
  "clarity_score": <0-10>,
  "behavioral_score": <0-10>,
  "technical_feedback": "<one sentence>",
  "clarity_feedback": "<one sentence>",
  "behavioral_feedback": "<one sentence>",
  "has_situation": <boolean>,
  "has_task": <boolean>,
  "has_action": <boolean>,
  "has_result": <boolean>,
  "overall_score": <0-10>,
  "feedback_summary": "<brief summary>",
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>"]
}

Scoring criteria:
- Technical: Accuracy, depth, problem-solving approach
- Clarity: Clear explanation, logical flow, conciseness
- Behavioral: STAR method completeness, relevance, impact
- Overall: Average of all scores

Be constructive and specific.`
  }

  /**
   * Calculate confidence score from voice metrics
   */
  private calculateConfidenceScore(voiceMetrics: VoiceMetrics): number {
    let score = 7.0 // baseline

    // Penalize excessive filler words
    const fillerRatio = voiceMetrics.filler_word_count / Math.max(1, voiceMetrics.speech_pace / 2)
    score -= Math.min(3, fillerRatio * 10)

    // Optimal speech pace bonus
    if (voiceMetrics.speech_pace >= 120 && voiceMetrics.speech_pace <= 150) {
      score += 1.5
    } else if (voiceMetrics.speech_pace < 100 || voiceMetrics.speech_pace > 180) {
      score -= 1.0
    }

    // Clarity bonus
    score += (voiceMetrics.clarity_score - 5) * 0.3

    return Math.max(0, Math.min(10, Number(score.toFixed(1))))
  }

  /**
   * Generate confidence feedback
   */
  private generateConfidenceFeedback(voiceMetrics: VoiceMetrics): string {
    const feedbacks: string[] = []

    if (voiceMetrics.filler_word_count > 5) {
      feedbacks.push(`Reduce filler words (detected ${voiceMetrics.filler_word_count})`)
    }

    if (voiceMetrics.speech_pace < 100) {
      feedbacks.push('Speak slightly faster for better engagement')
    } else if (voiceMetrics.speech_pace > 180) {
      feedbacks.push('Slow down slightly for clarity')
    } else {
      feedbacks.push('Good speech pace')
    }

    return feedbacks.join('. ')
  }

  /**
   * Generate basic evaluation (fallback)
   */
  private generateBasicEvaluation(userResponse: string, voiceMetrics: VoiceMetrics): EvaluationResult {
    const wordCount = userResponse.split(/\s+/).length
    const hasSTAR = {
      situation: /situation|context|background/i.test(userResponse),
      task: /task|goal|objective|challenge/i.test(userResponse),
      action: /action|did|implemented|developed/i.test(userResponse),
      result: /result|outcome|impact|achieved/i.test(userResponse)
    }

    return {
      technical_score: wordCount > 50 ? 6.5 : 5.0,
      clarity_score: voiceMetrics.clarity_score,
      confidence_score: this.calculateConfidenceScore(voiceMetrics),
      behavioral_score: Object.values(hasSTAR).filter(Boolean).length * 2,
      technical_feedback: 'Response covers key points.',
      clarity_feedback: 'Communication is clear.',
      confidence_feedback: this.generateConfidenceFeedback(voiceMetrics),
      behavioral_feedback: 'Consider using STAR method for structure.',
      has_situation: hasSTAR.situation,
      has_task: hasSTAR.task,
      has_action: hasSTAR.action,
      has_result: hasSTAR.result,
      overall_score: 6.0,
      feedback_summary: 'Solid response with room for improvement.',
      improvement_suggestions: [
        'Provide more specific examples',
        'Quantify your impact where possible'
      ]
    }
  }

  /**
   * Generate speech using TTS
   */
  async generateSpeech(text: string, voice: string = 'alloy'): Promise<TTSResult> {
    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice as any,
        input: text,
        speed: 1.0
      })

      const buffer = Buffer.from(await mp3.arrayBuffer())

      // Estimate duration (rough approximation: ~150 words per minute)
      const wordCount = text.split(/\s+/).length
      const durationMs = (wordCount / 150) * 60 * 1000

      return {
        audio_url: '', // Will be set by caller after upload
        audio_data: buffer,
        duration_ms: Math.round(durationMs),
        format: 'mp3'
      }
    } catch (error: any) {
      console.error('TTS generation error:', error)
      throw new Error(`TTS failed: ${error.message}`)
    }
  }

  /**
   * Get available TTS voices
   */
  getAvailableVoices(): string[] {
    return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
  }

  /**
   * Select voice based on persona
   */
  selectVoiceForPersona(persona: any): string {
    const voiceMap: Record<string, string> = {
      'professional': 'alloy',
      'friendly': 'nova',
      'authoritative': 'onyx',
      'warm': 'shimmer',
      'energetic': 'echo',
      'calm': 'fable'
    }

    const tone = persona.tone?.toLowerCase() || 'professional'
    return voiceMap[tone] || 'alloy'
  }
}

export const videoAIService = new VideoAIService()
