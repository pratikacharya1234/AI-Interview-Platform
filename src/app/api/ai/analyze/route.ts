import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { prompt, question, transcription } = await request.json()

    if (!prompt || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and question' },
        { status: 400 }
      )
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      // Fallback to rule-based analysis if no API key
      const fallbackAnalysis = generateFallbackAnalysis(question, transcription)
      return NextResponse.json(fallbackAnalysis)
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const enhancedPrompt = `
        ${prompt}
        
        IMPORTANT: Respond ONLY with valid JSON in this exact format:
        {
          "score": <number between 0-100>,
          "feedback": "<detailed constructive feedback string>",
          "strengths": ["<strength1>", "<strength2>", "<strength3>"],
          "areas_for_improvement": ["<improvement1>", "<improvement2>", "<improvement3>"]
        }
        
        Do not include any other text, explanations, or formatting outside of the JSON.
      `

      const result = await model.generateContent(enhancedPrompt)
      const response = await result.response
      const text = response.text()

      // Clean the response to extract JSON
      let cleanedText = text.trim()
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Find JSON object in the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response')
      }

      const aiAnalysis = JSON.parse(jsonMatch[0])

      // Validate and sanitize the response
      const validatedAnalysis = {
        score: Math.max(0, Math.min(100, parseInt(aiAnalysis.score) || 70)),
        feedback: typeof aiAnalysis.feedback === 'string' ? aiAnalysis.feedback : 'Good response. Keep practicing.',
        strengths: Array.isArray(aiAnalysis.strengths) ? aiAnalysis.strengths.slice(0, 5) : ['Clear communication'],
        areas_for_improvement: Array.isArray(aiAnalysis.areas_for_improvement) ? aiAnalysis.areas_for_improvement.slice(0, 5) : ['Provide more examples']
      }

      return NextResponse.json(validatedAnalysis)

    } catch (aiError) {
      console.error('Gemini API error:', aiError)
      // Fallback to rule-based analysis
      const fallbackAnalysis = generateFallbackAnalysis(question, transcription)
      return NextResponse.json(fallbackAnalysis)
    }

  } catch (error) {
    console.error('AI Analysis API error:', error)
    
    // Return a basic analysis as fallback
    return NextResponse.json({
      score: 70,
      feedback: 'Your response has been recorded. Continue practicing to improve your interview skills.',
      strengths: ['Active participation', 'Question engagement'],
      areas_for_improvement: ['Practice more examples', 'Structure responses clearly']
    })
  }
}

function generateFallbackAnalysis(question: string, transcription?: string) {
  // Rule-based analysis when AI is not available
  const responseLength = transcription?.length || 0
  const wordCount = transcription ? transcription.split(' ').length : 0
  
  let score = 60 // Base score
  let feedback = 'Your response has been analyzed using basic metrics. '
  const strengths: string[] = []
  const improvements: string[] = []

  // Scoring based on response length and structure
  if (wordCount > 50) {
    score += 15
    strengths.push('Provided detailed response')
    feedback += 'You gave a comprehensive answer. '
  } else if (wordCount > 20) {
    score += 10
    strengths.push('Clear and concise response')
    feedback += 'Your response was well-structured. '
  } else if (wordCount > 0) {
    score += 5
    improvements.push('Provide more detailed explanations')
    feedback += 'Consider expanding your answers with more detail. '
  }

  // Check for key phrases that indicate structure
  if (transcription && (
    transcription.includes('first') || 
    transcription.includes('second') || 
    transcription.includes('example') ||
    transcription.includes('because') ||
    transcription.includes('therefore')
  )) {
    score += 10
    strengths.push('Used structured approach')
    feedback += 'Good use of structured communication. '
  } else {
    improvements.push('Use structured approach (first, second, for example)')
  }

  // Ensure we have some content in arrays
  if (strengths.length === 0) {
    strengths.push('Engaged with the question', 'Provided a response')
  }
  if (improvements.length === 0) {
    improvements.push('Practice more examples', 'Focus on clear communication')
  }

  // Cap the score at 85 for rule-based analysis
  score = Math.min(85, score)

  feedback += 'Keep practicing to improve your interview performance.'

  return {
    score,
    feedback,
    strengths: strengths.slice(0, 3),
    areas_for_improvement: improvements.slice(0, 3)
  }
}