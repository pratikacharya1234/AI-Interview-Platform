import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, responses } = body

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get all responses from database
    const { data: allResponses } = await supabase
      .from('responses')
      .select('*')
      .eq('interview_id', session_id)
      .order('timestamp', { ascending: true })

    // Generate comprehensive feedback
    const feedback = await generateFeedback(session, allResponses || responses || [])

    // Update interview with feedback
    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        feedback_summary: feedback
      })
      .eq('id', session_id)

    if (updateError) {
      console.error('Error updating interview:', updateError)
    }

    return NextResponse.json({
      feedback,
      session_id
    })

  } catch (error) {
    console.error('Error completing interview:', error)
    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    )
  }
}

async function generateFeedback(session: any, responses: any[]) {
  const { position, experience } = session

  // Call AI to generate comprehensive feedback
  let aiFeedback = null

  if (process.env.ANTHROPIC_API_KEY) {
    aiFeedback = await generateClaudeFeedback(session, responses)
  } else if (process.env.OPENAI_API_KEY) {
    aiFeedback = await generateOpenAIFeedback(session, responses)
  }

  // Fallback or enhance AI feedback
  const feedback = aiFeedback || generateDefaultFeedback(responses)

  // Calculate scores
  const scores = calculateScores(responses, feedback)

  return {
    ...feedback,
    ...scores,
    total_questions: responses.length,
    interview_duration: calculateDuration(session),
    position,
    experience
  }
}

async function generateClaudeFeedback(session: any, responses: any[]) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: `You are an expert interview evaluator. Analyze the interview responses and provide comprehensive feedback.`,
        messages: [
          {
            role: 'user',
            content: `Interview for: ${session.position} at ${session.company}
Experience level: ${session.experience}
Responses: ${JSON.stringify(responses.map(r => ({
  question: r.question,
  answer: r.answer
})))}

Provide detailed feedback with:
1. Communication clarity (1-10)
2. Confidence level (1-10)
3. Technical understanding (1-10)
4. Problem-solving ability (1-10)
5. Overall score (1-10)
6. Key strengths (array of 3-5 points)
7. Areas for improvement (array of 3-5 points)
8. Detailed summary (2-3 paragraphs)
9. Hiring recommendation (strong yes/yes/maybe/no)

Return as JSON.`
          }
        ]
      })
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.content[0].text
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Claude feedback error:', error)
  }

  return null
}

async function generateOpenAIFeedback(session: any, responses: any[]) {
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
            content: 'You are an expert interview evaluator. Analyze the interview responses and provide comprehensive feedback.'
          },
          {
            role: 'user',
            content: `Interview for: ${session.position} at ${session.company}
Experience level: ${session.experience}
Responses: ${JSON.stringify(responses.map(r => ({
  question: r.question,
  answer: r.answer
})))}

Provide detailed feedback with:
1. Communication clarity (1-10)
2. Confidence level (1-10)
3. Technical understanding (1-10)
4. Problem-solving ability (1-10)
5. Overall score (1-10)
6. Key strengths (array of 3-5 points)
7. Areas for improvement (array of 3-5 points)
8. Detailed summary (2-3 paragraphs)
9. Hiring recommendation (strong yes/yes/maybe/no)

Return as JSON.`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    }
  } catch (error) {
    console.error('OpenAI feedback error:', error)
  }

  return null
}

function generateDefaultFeedback(responses: any[]) {
  // Analyze responses to generate feedback
  const hasDetailedAnswers = responses.some(r => r.answer && r.answer.length > 100)
  const avgResponseLength = responses.reduce((acc, r) => acc + (r.answer?.length || 0), 0) / responses.length

  return {
    communication_clarity: hasDetailedAnswers ? 7 : 6,
    confidence: avgResponseLength > 150 ? 8 : 6,
    technical_understanding: 7,
    problem_solving: 7,
    overall_score: 7,
    strengths: [
      "Good communication skills",
      "Relevant experience mentioned",
      "Professional demeanor",
      "Clear articulation of thoughts"
    ],
    improvements: [
      "Provide more specific examples",
      "Demonstrate deeper technical knowledge",
      "Show more enthusiasm for the role"
    ],
    summary: `The candidate demonstrated solid communication skills and relevant experience for the position. 
    Their responses showed a good understanding of the role requirements and company culture. 
    With some additional preparation on technical topics and more specific examples from past experience, 
    they would be a strong candidate for this position.`,
    recommendation: "yes"
  }
}

function calculateScores(responses: any[], feedback: any) {
  // Calculate additional metrics
  const avgAnalysisScore = responses.reduce((acc, r) => {
    const analysis = r.analysis || {}
    const score = analysis.score || 7
    return acc + score
  }, 0) / responses.length

  return {
    communication_clarity: feedback.communication_clarity || Math.round(avgAnalysisScore),
    confidence: feedback.confidence || Math.round(avgAnalysisScore * 0.9),
    technical_understanding: feedback.technical_understanding || Math.round(avgAnalysisScore * 0.95),
    problem_solving: feedback.problem_solving || Math.round(avgAnalysisScore * 0.85),
    overall_score: feedback.overall_score || Math.round(avgAnalysisScore)
  }
}

function calculateDuration(session: any): number {
  if (session.started_at && session.ended_at) {
    const start = new Date(session.started_at).getTime()
    const end = new Date(session.ended_at).getTime()
    return Math.floor((end - start) / 1000 / 60) // Duration in minutes
  }
  return 0
}
