import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface VoiceAnalysisResult {
  id?: string
  session_id: string
  response_index: number
  audio_url?: string
  transcript: string
  tone_analysis: ToneAnalysis
  confidence_score: number
  speech_pace: number
  filler_words_count: number
  clarity_score: number
  emotion_detected: string
  volume_consistency: number
  pronunciation_score: number
  recommendations: string[]
}

export interface ToneAnalysis {
  primary_tone: string
  tone_confidence: number
  emotional_valence: number
  energy_level: number
  formality_score: number
  enthusiasm_score: number
  nervousness_indicators: string[]
  positive_indicators: string[]
}

export interface SpeechMetrics {
  words_per_minute: number
  pause_frequency: number
  average_pause_duration: number
  sentence_complexity: number
  vocabulary_richness: number
}

class VoiceAnalysisService {
  private readonly FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally',
    'sort of', 'kind of', 'i mean', 'right', 'okay', 'so', 'well'
  ]

  private readonly CONFIDENCE_KEYWORDS = {
    high: ['definitely', 'certainly', 'confident', 'sure', 'absolutely', 'clearly', 'obviously'],
    low: ['maybe', 'perhaps', 'i think', 'i guess', 'probably', 'might', 'could be', 'not sure']
  }

  async analyzeVoiceResponse(
    sessionId: string,
    responseIndex: number,
    audioUrl: string,
    transcript: string
  ): Promise<VoiceAnalysisResult> {
    const toneAnalysis = await this.analyzeTone(transcript)
    const confidenceScore = this.calculateConfidenceScore(transcript, toneAnalysis)
    const speechMetrics = this.analyzeSpeechMetrics(transcript)
    const fillerWordsCount = this.countFillerWords(transcript)
    const clarityScore = this.calculateClarityScore(transcript, speechMetrics)
    const emotion = this.detectEmotion(toneAnalysis)
    const volumeConsistency = this.estimateVolumeConsistency(transcript)
    const pronunciationScore = this.estimatePronunciationScore(transcript)
    const recommendations = this.generateRecommendations({
      toneAnalysis,
      confidenceScore,
      speechMetrics,
      fillerWordsCount,
      clarityScore
    })

    const result: VoiceAnalysisResult = {
      session_id: sessionId,
      response_index: responseIndex,
      audio_url: audioUrl,
      transcript,
      tone_analysis: toneAnalysis,
      confidence_score: confidenceScore,
      speech_pace: speechMetrics.words_per_minute,
      filler_words_count: fillerWordsCount,
      clarity_score: clarityScore,
      emotion_detected: emotion,
      volume_consistency: volumeConsistency,
      pronunciation_score: pronunciationScore,
      recommendations
    }

    const { data, error } = await supabase
      .from('voice_analysis')
      .insert([result])
      .select()
      .single()

    if (error) throw new Error(`Failed to save voice analysis: ${error.message}`)
    return data
  }

  private async analyzeTone(transcript: string): Promise<ToneAnalysis> {
    const words = transcript.toLowerCase().split(/\s+/)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)

    const positiveWords = ['excellent', 'great', 'good', 'effective', 'successful', 'achieved', 'improved', 'optimized']
    const negativeWords = ['difficult', 'challenging', 'problem', 'issue', 'failed', 'struggled']
    const enthusiasticWords = ['excited', 'passionate', 'love', 'amazing', 'fantastic', 'incredible']
    const nervousIndicators = ['um', 'uh', 'sorry', 'i mean', 'actually', 'just']

    const positiveCount = words.filter(w => positiveWords.includes(w)).length
    const negativeCount = words.filter(w => negativeWords.includes(w)).length
    const enthusiasticCount = words.filter(w => enthusiasticWords.includes(w)).length
    const nervousCount = words.filter(w => nervousIndicators.includes(w)).length

    const emotionalValence = ((positiveCount - negativeCount) / words.length) * 100
    const energyLevel = Math.min(100, (enthusiasticCount / sentences.length) * 100 + 50)
    const formalityScore = this.calculateFormalityScore(transcript)
    const enthusiasmScore = Math.min(100, (enthusiasticCount / words.length) * 1000)

    let primaryTone = 'neutral'
    if (emotionalValence > 10) primaryTone = 'positive'
    else if (emotionalValence < -10) primaryTone = 'negative'
    if (enthusiasmScore > 60) primaryTone = 'enthusiastic'
    if (nervousCount > words.length * 0.05) primaryTone = 'nervous'

    return {
      primary_tone: primaryTone,
      tone_confidence: Math.min(100, Math.abs(emotionalValence) * 2 + 50),
      emotional_valence: Math.max(0, Math.min(100, emotionalValence + 50)),
      energy_level: energyLevel,
      formality_score: formalityScore,
      enthusiasm_score: enthusiasmScore,
      nervousness_indicators: nervousIndicators.filter(w => words.includes(w)),
      positive_indicators: positiveWords.filter(w => words.includes(w))
    }
  }

  private calculateConfidenceScore(transcript: string, toneAnalysis: ToneAnalysis): number {
    const words = transcript.toLowerCase().split(/\s+/)
    
    const highConfidenceCount = words.filter(w => 
      this.CONFIDENCE_KEYWORDS.high.some(kw => w.includes(kw))
    ).length
    
    const lowConfidenceCount = words.filter(w =>
      this.CONFIDENCE_KEYWORDS.low.some(kw => w.includes(kw))
    ).length

    const fillerRatio = this.countFillerWords(transcript) / words.length
    const sentenceLength = transcript.split(/[.!?]+/).filter(s => s.trim()).length
    const avgWordsPerSentence = words.length / sentenceLength

    let score = 70

    score += (highConfidenceCount * 5)
    score -= (lowConfidenceCount * 5)
    score -= (fillerRatio * 100)
    
    if (avgWordsPerSentence > 15 && avgWordsPerSentence < 25) score += 10
    if (toneAnalysis.primary_tone === 'positive' || toneAnalysis.primary_tone === 'enthusiastic') score += 10
    if (toneAnalysis.primary_tone === 'nervous') score -= 15

    return Math.max(0, Math.min(100, score))
  }

  private analyzeSpeechMetrics(transcript: string): SpeechMetrics {
    const words = transcript.split(/\s+/).filter(w => w.length > 0)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    const estimatedDurationMinutes = words.length / 150
    const wordsPerMinute = words.length / Math.max(estimatedDurationMinutes, 0.5)
    
    const pauseIndicators = transcript.match(/[,;]|\.{2,}|\s{2,}/g) || []
    const pauseFrequency = pauseIndicators.length / sentences.length
    
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    const vocabularyRichness = (uniqueWords.size / words.length) * 100
    
    const avgWordsPerSentence = words.length / sentences.length
    const sentenceComplexity = Math.min(100, (avgWordsPerSentence / 20) * 100)

    return {
      words_per_minute: Math.round(wordsPerMinute),
      pause_frequency: pauseFrequency,
      average_pause_duration: 1.5,
      sentence_complexity: sentenceComplexity,
      vocabulary_richness: vocabularyRichness
    }
  }

  private countFillerWords(transcript: string): number {
    const text = transcript.toLowerCase()
    return this.FILLER_WORDS.reduce((count, filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi')
      const matches = text.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private calculateClarityScore(transcript: string, metrics: SpeechMetrics): number {
    let score = 70

    if (metrics.words_per_minute >= 120 && metrics.words_per_minute <= 160) {
      score += 15
    } else if (metrics.words_per_minute < 100 || metrics.words_per_minute > 180) {
      score -= 10
    }

    score += Math.min(15, metrics.vocabulary_richness / 2)

    if (metrics.sentence_complexity > 30 && metrics.sentence_complexity < 70) {
      score += 10
    }

    const fillerRatio = this.countFillerWords(transcript) / transcript.split(/\s+/).length
    score -= (fillerRatio * 100)

    return Math.max(0, Math.min(100, score))
  }

  private calculateFormalityScore(transcript: string): number {
    const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'moreover', 'nevertheless']
    const informalWords = ['gonna', 'wanna', 'yeah', 'yep', 'nope', 'stuff', 'things', 'guys']
    const contractions = transcript.match(/\w+'\w+/g) || []

    const words = transcript.toLowerCase().split(/\s+/)
    const formalCount = words.filter(w => formalWords.includes(w)).length
    const informalCount = words.filter(w => informalWords.includes(w)).length

    let score = 50
    score += (formalCount * 10)
    score -= (informalCount * 10)
    score -= (contractions.length * 2)

    return Math.max(0, Math.min(100, score))
  }

  private detectEmotion(toneAnalysis: ToneAnalysis): string {
    if (toneAnalysis.enthusiasm_score > 70) return 'enthusiastic'
    if (toneAnalysis.nervousness_indicators.length > 5) return 'nervous'
    if (toneAnalysis.emotional_valence > 60) return 'confident'
    if (toneAnalysis.emotional_valence < 40) return 'uncertain'
    if (toneAnalysis.energy_level > 70) return 'energetic'
    return 'calm'
  }

  private estimateVolumeConsistency(transcript: string): number {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const lengthVariance = this.calculateVariance(sentences.map(s => s.length))
    const consistencyScore = Math.max(0, 100 - (lengthVariance / 10))
    return Math.round(consistencyScore)
  }

  private estimatePronunciationScore(transcript: string): number {
    const words = transcript.split(/\s+/)
    const complexWords = words.filter(w => w.length > 8).length
    const totalWords = words.length
    
    let score = 85
    
    if (complexWords / totalWords > 0.2) score += 10
    
    const properNouns = transcript.match(/[A-Z][a-z]+/g) || []
    if (properNouns.length > 0) score += 5

    return Math.min(100, score)
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
  }

  private generateRecommendations(analysis: {
    toneAnalysis: ToneAnalysis
    confidenceScore: number
    speechMetrics: SpeechMetrics
    fillerWordsCount: number
    clarityScore: number
  }): string[] {
    const recommendations: string[] = []

    if (analysis.confidenceScore < 60) {
      recommendations.push('Practice speaking with more assertive language. Replace phrases like "I think" with "I believe" or "I\'m confident that".')
    }

    if (analysis.fillerWordsCount > 5) {
      recommendations.push(`Reduce filler words (found ${analysis.fillerWordsCount}). Pause briefly instead of using "um" or "like".`)
    }

    if (analysis.speechMetrics.words_per_minute < 120) {
      recommendations.push('Increase your speaking pace slightly. Aim for 130-150 words per minute for better engagement.')
    } else if (analysis.speechMetrics.words_per_minute > 170) {
      recommendations.push('Slow down your speaking pace. Take brief pauses between key points for emphasis.')
    }

    if (analysis.toneAnalysis.nervousness_indicators.length > 5) {
      recommendations.push('Practice deep breathing before responses. Your tone shows some nervousness indicators.')
    }

    if (analysis.toneAnalysis.enthusiasm_score < 40) {
      recommendations.push('Show more enthusiasm in your responses. Vary your tone to emphasize key achievements.')
    }

    if (analysis.clarityScore < 70) {
      recommendations.push('Improve clarity by organizing thoughts before speaking. Use the STAR method for structured responses.')
    }

    if (analysis.speechMetrics.vocabulary_richness < 40) {
      recommendations.push('Expand your vocabulary usage. Use more varied and precise technical terms.')
    }

    if (analysis.toneAnalysis.formality_score < 50) {
      recommendations.push('Maintain professional language. Avoid contractions and informal expressions in interviews.')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent voice delivery! Maintain this level of confidence and clarity.')
    }

    return recommendations
  }

  async getSessionVoiceAnalytics(sessionId: string): Promise<{
    analyses: VoiceAnalysisResult[]
    summary: {
      average_confidence: number
      average_clarity: number
      total_filler_words: number
      average_speech_pace: number
      dominant_emotion: string
      overall_improvement: string
    }
  }> {
    const { data: analyses, error } = await supabase
      .from('voice_analysis')
      .select('*')
      .eq('session_id', sessionId)
      .order('response_index')

    if (error) throw new Error(`Failed to fetch voice analytics: ${error.message}`)
    if (!analyses || analyses.length === 0) {
      return {
        analyses: [],
        summary: {
          average_confidence: 0,
          average_clarity: 0,
          total_filler_words: 0,
          average_speech_pace: 0,
          dominant_emotion: 'unknown',
          overall_improvement: 'No data available'
        }
      }
    }

    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence_score, 0) / analyses.length
    const avgClarity = analyses.reduce((sum, a) => sum + a.clarity_score, 0) / analyses.length
    const totalFillers = analyses.reduce((sum, a) => sum + a.filler_words_count, 0)
    const avgPace = analyses.reduce((sum, a) => sum + a.speech_pace, 0) / analyses.length

    const emotions = analyses.map(a => a.emotion_detected)
    const dominantEmotion = this.getMostFrequent(emotions)

    const firstHalf = analyses.slice(0, Math.ceil(analyses.length / 2))
    const secondHalf = analyses.slice(Math.ceil(analyses.length / 2))
    
    const firstHalfAvg = firstHalf.reduce((sum, a) => sum + a.confidence_score, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, a) => sum + a.confidence_score, 0) / secondHalf.length
    
    let improvement = 'Consistent performance throughout'
    if (secondHalfAvg > firstHalfAvg + 10) improvement = 'Strong improvement as interview progressed'
    else if (secondHalfAvg < firstHalfAvg - 10) improvement = 'Performance declined in later responses'

    return {
      analyses,
      summary: {
        average_confidence: Math.round(avgConfidence),
        average_clarity: Math.round(avgClarity),
        total_filler_words: totalFillers,
        average_speech_pace: Math.round(avgPace),
        dominant_emotion: dominantEmotion,
        overall_improvement: improvement
      }
    }
  }

  private getMostFrequent(arr: string[]): string {
    const frequency: Record<string, number> = {}
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1
    })
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b)
  }

  async compareVoicePerformance(userId: string, sessionId: string): Promise<{
    current_session: any
    historical_average: any
    improvement_percentage: number
    areas_improved: string[]
    areas_declined: string[]
  }> {
    const currentSession = await this.getSessionVoiceAnalytics(sessionId)

    const { data: userSessions } = await supabase
      .from('interview_sessions')
      .select('id')
      .eq('user_id', userId)
      .neq('id', sessionId)
      .eq('status', 'completed')
      .limit(10)

    if (!userSessions || userSessions.length === 0) {
      return {
        current_session: currentSession.summary,
        historical_average: null,
        improvement_percentage: 0,
        areas_improved: [],
        areas_declined: []
      }
    }

    const historicalAnalyses = await Promise.all(
      userSessions.map(s => this.getSessionVoiceAnalytics(s.id))
    )

    const historicalAvg = {
      confidence: historicalAnalyses.reduce((sum, a) => sum + a.summary.average_confidence, 0) / historicalAnalyses.length,
      clarity: historicalAnalyses.reduce((sum, a) => sum + a.summary.average_clarity, 0) / historicalAnalyses.length,
      pace: historicalAnalyses.reduce((sum, a) => sum + a.summary.average_speech_pace, 0) / historicalAnalyses.length
    }

    const current = currentSession.summary
    const improvementPct = ((current.average_confidence - historicalAvg.confidence) / historicalAvg.confidence) * 100

    const areasImproved: string[] = []
    const areasDeclined: string[] = []

    if (current.average_confidence > historicalAvg.confidence + 5) areasImproved.push('Confidence')
    else if (current.average_confidence < historicalAvg.confidence - 5) areasDeclined.push('Confidence')

    if (current.average_clarity > historicalAvg.clarity + 5) areasImproved.push('Clarity')
    else if (current.average_clarity < historicalAvg.clarity - 5) areasDeclined.push('Clarity')

    if (Math.abs(current.average_speech_pace - 140) < Math.abs(historicalAvg.pace - 140)) {
      areasImproved.push('Speech Pace')
    } else if (Math.abs(current.average_speech_pace - 140) > Math.abs(historicalAvg.pace - 140) + 10) {
      areasDeclined.push('Speech Pace')
    }

    return {
      current_session: current,
      historical_average: historicalAvg,
      improvement_percentage: Math.round(improvementPct),
      areas_improved: areasImproved,
      areas_declined: areasDeclined
    }
  }
}

export const voiceAnalysisService = new VoiceAnalysisService()
