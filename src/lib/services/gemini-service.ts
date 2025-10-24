/**
 * Gemini API Service
 *
 * Handles all interactions with Google's Gemini AI for voice interview processing
 * Supports direct audio input and contextual question generation
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Models for different use cases
const MODELS = {
  FLASH: 'gemini-2.0-flash-exp', // For real-time audio processing
  PRO: 'gemini-1.5-pro', // For comprehensive feedback
}

/**
 * Interview context type
 */
export interface InterviewContext {
  role: string
  position: string
  difficulty: 'easy' | 'medium' | 'hard'
  industry?: string
  previousQuestions: Array<{
    question: string
    answer: string
    feedback?: string
  }>
}

/**
 * Answer analysis result
 */
export interface AnswerAnalysis {
  score: number // 0-100
  relevance: number // 0-100
  clarity: number // 0-100
  confidence: number // 0-100
  technicalAccuracy?: number // 0-100 (for technical roles)
  starMethodUsage?: boolean
  feedback: string
  strengths: string[]
  improvements: string[]
  nextQuestion?: string
}

/**
 * Comprehensive feedback result
 */
export interface ComprehensiveFeedback {
  overallScore: number // 0-100
  communicationScore: number
  technicalScore: number
  confidenceScore: number
  strengths: string[]
  weaknesses: string[]
  detailedFeedback: string
  improvementPlan: string[]
  comparisonWithIndustryStandards: string
  recommendedResources?: string[]
}

/**
 * Generate initial interview question based on context
 */
export async function generateInitialQuestion(
  context: Omit<InterviewContext, 'previousQuestions'>
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODELS.FLASH })

  const prompt = `You are an expert interviewer conducting a ${context.difficulty} difficulty interview for a ${context.position} role in the ${context.industry || 'technology'} industry.

Generate an engaging opening question that:
1. Is appropriate for a ${context.role} interview
2. Matches the ${context.difficulty} difficulty level
3. Encourages the candidate to provide a structured answer
4. If appropriate, prompts for STAR method (Situation, Task, Action, Result)

Keep the question clear, professional, and focused. Return ONLY the question text, no additional formatting.`

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text().trim()
}

/**
 * Process audio answer using Gemini
 * Sends audio directly to Gemini for analysis
 */
export async function processAudioAnswer(
  audioData: Buffer | Uint8Array,
  mimeType: string,
  currentQuestion: string,
  context: InterviewContext
): Promise<AnswerAnalysis> {
  const model = genAI.getGenerativeModel({ model: MODELS.FLASH })

  const prompt = `You are analyzing a candidate's voice response to an interview question.

QUESTION: "${currentQuestion}"

CONTEXT:
- Role: ${context.position}
- Difficulty: ${context.difficulty}
- Previous questions asked: ${context.previousQuestions.length}

Please analyze the audio response and provide:
1. Overall score (0-100) for answer quality
2. Relevance to the question (0-100)
3. Clarity of communication (0-100)
4. Perceived confidence level (0-100)
${context.role.toLowerCase().includes('technical') || context.role.toLowerCase().includes('engineer') ? '5. Technical accuracy (0-100)' : ''}
6. Whether STAR method was used (for behavioral questions)
7. Brief encouraging feedback (2-3 sentences)
8. Top 2-3 strengths demonstrated
9. Top 2-3 areas for improvement
10. A contextual follow-up question or next interview question

Return response as JSON with this structure:
{
  "score": number,
  "relevance": number,
  "clarity": number,
  "confidence": number,
  "technicalAccuracy": number or null,
  "starMethodUsage": boolean,
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "nextQuestion": "string"
}`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: Buffer.from(audioData).toString('base64'),
      },
    },
    { text: prompt },
  ])

  const response = result.response
  const text = response.text()

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse Gemini response as JSON')
  }

  const analysis: AnswerAnalysis = JSON.parse(jsonMatch[0])
  return analysis
}

/**
 * Generate next question based on interview progression
 */
export async function generateNextQuestion(
  context: InterviewContext
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODELS.FLASH })

  const previousQuestionsText = context.previousQuestions
    .map((qa, index) => `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer}`)
    .join('\n\n')

  const prompt = `You are conducting an interview for a ${context.position} role (${context.difficulty} difficulty).

INTERVIEW HISTORY:
${previousQuestionsText}

Based on the candidate's previous responses, generate the next interview question that:
1. Builds naturally on the conversation
2. Explores different competencies than already covered
3. Matches the ${context.difficulty} difficulty level
4. Is relevant to the ${context.position} role
5. Helps assess the candidate comprehensively

Ensure you cover a mix of:
- Behavioral questions (past experiences)
- Situational questions (hypothetical scenarios)
${context.role.toLowerCase().includes('technical') ? '- Technical questions (problem-solving, system design)' : ''}

Return ONLY the question text.`

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text().trim()
}

/**
 * Generate comprehensive feedback for completed interview
 */
export async function generateComprehensiveFeedback(
  context: InterviewContext,
  sessionDuration: number
): Promise<ComprehensiveFeedback> {
  const model = genAI.getGenerativeModel({ model: MODELS.PRO })

  const transcript = context.previousQuestions
    .map((qa, index) => `
QUESTION ${index + 1}: ${qa.question}
ANSWER ${index + 1}: ${qa.answer}
${qa.feedback ? `IMMEDIATE FEEDBACK: ${qa.feedback}` : ''}
`)
    .join('\n')

  const prompt = `You are providing comprehensive feedback for a completed ${context.position} interview (${context.difficulty} difficulty).

FULL INTERVIEW TRANSCRIPT:
${transcript}

SESSION DURATION: ${Math.floor(sessionDuration / 60)} minutes

Provide detailed feedback covering:

1. OVERALL PERFORMANCE SCORE (0-100)
2. COMMUNICATION SKILLS SCORE (0-100)
3. TECHNICAL SKILLS SCORE (0-100) ${context.role.toLowerCase().includes('technical') ? '(critical for this role)' : '(adaptability and problem-solving)'}
4. CONFIDENCE LEVEL SCORE (0-100)
5. TOP 3-5 STRENGTHS with specific examples from the interview
6. TOP 3-5 WEAKNESSES with specific examples
7. DETAILED FEEDBACK (3-4 paragraphs analyzing overall performance)
8. ACTIONABLE IMPROVEMENT PLAN (5-7 specific steps)
9. COMPARISON WITH INDUSTRY STANDARDS for ${context.position} roles
10. RECOMMENDED RESOURCES for skill development

Return as JSON:
{
  "overallScore": number,
  "communicationScore": number,
  "technicalScore": number,
  "confidenceScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "detailedFeedback": "string",
  "improvementPlan": ["string"],
  "comparisonWithIndustryStandards": "string",
  "recommendedResources": ["string"]
}`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse comprehensive feedback as JSON')
  }

  const feedback: ComprehensiveFeedback = JSON.parse(jsonMatch[0])
  return feedback
}

/**
 * Get contextual encouragement/feedback during interview
 */
export async function getEncouragingFeedback(
  answer: string,
  score: number
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODELS.FLASH })

  const prompt = `You are an encouraging interviewer. The candidate just answered with a score of ${score}/100.

Provide brief, professional encouragement (1-2 sentences) that:
- Acknowledges their response
- ${score >= 70 ? 'Highlights what they did well' : 'Gently encourages them for the next question'}
- Maintains professional interview tone
- Keeps them motivated

Return ONLY the encouraging message.`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
