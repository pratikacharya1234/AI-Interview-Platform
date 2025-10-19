import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, questionId, transcript, questionText, stage, responseNumber } = body

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get session data
    const { data: session } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Analyze the response
    const analysis = await analyzeResponse(transcript, questionText, session.metadata)

    // Save response to database
    const { data: savedResponse } = await supabase
      .from('responses')
      .insert({
        interview_id: sessionId,
        question: questionText,
        answer: transcript,
        analysis,
        stage,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    // Determine next stage
    const nextStage = getNextStage(stage, responseNumber, session.metadata.totalQuestions)

    // Check if interview should complete
    const isComplete = responseNumber >= session.metadata.totalQuestions

    if (isComplete) {
      // Update interview status
      await supabase
        .from('interviews')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      return NextResponse.json({
        responseId: savedResponse?.id,
        analysis,
        isComplete: true
      })
    }

    // Generate next question
    const nextQuestion = await generateNextQuestion(
      session.metadata,
      transcript,
      analysis,
      nextStage,
      responseNumber
    )

    return NextResponse.json({
      responseId: savedResponse?.id,
      analysis,
      nextQuestion,
      nextStage,
      isComplete: false
    })

  } catch (error) {
    console.error('Error processing response:', error)
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
}

async function analyzeResponse(transcript: string, questionText: string, metadata: any) {
  // AI-powered analysis if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interview evaluator. Analyze the candidate response and provide detailed feedback.'
            },
            {
              role: 'user',
              content: `Analyze this interview response:
                Question: "${questionText}"
                Answer: "${transcript}"
                
                Evaluate on a scale of 1-10 for:
                - Relevance to the question
                - Clarity of communication
                - Depth of response
                - Confidence level
                
                Also identify:
                - Key technical/professional keywords mentioned
                - Main strengths in the response
                - Areas that could be improved
                - Overall sentiment (positive/neutral/negative)
                
                Return as JSON.`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
          temperature: 0.3
        })
      })

      if (response.ok) {
        const data = await response.json()
        return JSON.parse(data.choices[0].message.content)
      }
    } catch (error) {
      console.error('OpenAI analysis error:', error)
    }
  }

  // Fallback analysis
  const wordCount = transcript.split(' ').length
  const hasKeywords = metadata.keywords?.some((kw: string) => 
    transcript.toLowerCase().includes(kw.toLowerCase())
  )

  return {
    score: Math.min(10, 5 + Math.floor(wordCount / 30) + (hasKeywords ? 2 : 0)),
    relevance: 7 + Math.random() * 2,
    clarity: 6 + Math.random() * 3,
    depth: 5 + Math.random() * 3,
    confidence: 6 + Math.random() * 3,
    keywords: extractMentionedKeywords(transcript, metadata.keywords || []),
    strengths: [
      'Clear communication',
      'Relevant experience mentioned',
      'Good structure in response'
    ],
    improvements: [
      'Could provide more specific examples',
      'Consider elaborating on technical details'
    ],
    sentiment: wordCount > 50 ? 'positive' : 'neutral'
  }
}

async function generateNextQuestion(
  metadata: any,
  previousAnswer: string,
  analysis: any,
  stage: string,
  questionNumber: number
) {
  const { position, company, experienceLevel, interviewType, jobDescription } = metadata

  // AI-powered question generation
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: metadata.systemPrompt
            },
            {
              role: 'user',
              content: `Generate the next interview question.
                Current stage: ${stage}
                Question number: ${questionNumber}
                Previous answer: "${previousAnswer}"
                Analysis: ${JSON.stringify(analysis)}
                
                Generate a follow-up question that:
                1. Builds on the previous response
                2. Explores ${stage === 'core' ? 'technical depth' : 'behavioral aspects'}
                3. Is appropriate for ${experienceLevel} level
                4. Relates to ${position} at ${company}
                
                Keep the question concise and clear.`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          id: `q_${Date.now()}`,
          text: data.choices[0].message.content,
          type: stage === 'core' ? 'technical' : 'behavioral',
          difficulty: Math.min(10, 3 + questionNumber),
          stage,
          expectedDuration: 90,
          keywords: metadata.keywords || [],
          evaluationCriteria: ['relevance', 'depth', 'clarity', 'technical accuracy']
        }
      }
    } catch (error) {
      console.error('OpenAI question generation error:', error)
    }
  }

  // Fallback questions
  return getFallbackQuestion(stage, questionNumber, position, experienceLevel)
}

function getNextStage(currentStage: string, responseNumber: number, totalQuestions: number) {
  const progress = responseNumber / totalQuestions
  
  if (progress < 0.2) return 'intro'
  if (progress < 0.4) return 'warmup'
  if (progress < 0.7) return 'core'
  if (progress < 0.9) return 'deep'
  return 'closing'
}

function extractMentionedKeywords(text: string, keywords: string[]): string[] {
  const lowerText = text.toLowerCase()
  return keywords.filter(kw => lowerText.includes(kw.toLowerCase()))
}

function getFallbackQuestion(stage: string, number: number, position: string, level: string) {
  const questions = {
    warmup: [
      `What interests you most about working in ${position}?`,
      'Describe a recent project you worked on.',
      'How do you stay updated with industry trends?'
    ],
    core: [
      `What technical challenges have you faced in ${position} roles?`,
      'How do you approach problem-solving?',
      'Describe your experience with team collaboration.'
    ],
    deep: [
      'Tell me about a time you had to learn something quickly.',
      'How do you handle conflicting priorities?',
      'What would you do differently in your last role?'
    ],
    closing: [
      'What questions do you have about our company?',
      'Where do you see yourself in 5 years?',
      'What makes you the right fit for this role?'
    ]
  }

  const stageQuestions = questions[stage as keyof typeof questions] || questions.core
  const questionText = stageQuestions[number % stageQuestions.length]

  return {
    id: `q_${Date.now()}`,
    text: questionText,
    type: stage === 'core' ? 'technical' : 'behavioral',
    difficulty: Math.min(10, 3 + number),
    stage,
    expectedDuration: 90,
    keywords: [],
    evaluationCriteria: ['relevance', 'depth', 'clarity']
  }
}
