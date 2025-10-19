import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, transcript, stage, previous_question } = body

    if (!session_id || !transcript) {
      return NextResponse.json(
        { error: 'Session ID and transcript are required' },
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

    // Get previous responses for context
    const { data: previousResponses } = await supabase
      .from('responses')
      .select('*')
      .eq('interview_id', session_id)
      .order('timestamp', { ascending: true })

    // Analyze the response and generate next question
    const aiResponse = await processWithAI({
      session,
      transcript,
      previous_question,
      previous_responses: previousResponses || [],
      current_stage: stage
    })

    // Save the response
    const { data: savedResponse, error: saveError } = await supabase
      .from('responses')
      .insert({
        interview_id: session_id,
        question: previous_question || session.metadata?.last_question || '',
        answer: transcript,
        analysis: aiResponse.analysis,
        stage: stage,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving response:', saveError)
    }

    // Update session metadata
    const updatedMetadata = {
      ...session.metadata,
      last_question: aiResponse.next_question,
      question_count: (session.metadata?.question_count || 0) + 1,
      current_stage: aiResponse.next_stage
    }

    await supabase
      .from('interviews')
      .update({
        stage: aiResponse.next_stage,
        metadata: updatedMetadata
      })
      .eq('id', session_id)

    // Calculate progress
    const totalQuestions = session.metadata?.total_questions || 10
    const currentQuestion = updatedMetadata.question_count
    const progress = Math.min((currentQuestion / totalQuestions) * 100, 100)

    return NextResponse.json({
      response_id: savedResponse?.id,
      transcript,
      next_question: aiResponse.next_question,
      stage: aiResponse.next_stage,
      progress,
      analysis: aiResponse.analysis,
      should_complete: aiResponse.should_complete || progress >= 100,
      response_time: aiResponse.response_time
    })

  } catch (error) {
    console.error('Error processing voice interview:', error)
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
}

async function processWithAI(context: any) {
  const { session, transcript, previous_question, previous_responses, current_stage } = context
  const { job_description, position, company, experience, interview_type, system_prompt } = session.metadata || {}

  // Build conversation history
  const conversationHistory = previous_responses.map((r: any) => ({
    question: r.question,
    answer: r.answer,
    analysis: r.analysis
  }))

  // Determine next stage
  const questionCount = session.metadata?.question_count || 0
  let next_stage = current_stage

  if (interview_type === 'mixed') {
    if (questionCount < 2) next_stage = 'introduction'
    else if (questionCount < 5) next_stage = 'technical'
    else if (questionCount < 7) next_stage = 'behavioral'
    else if (questionCount < 9) next_stage = 'situational'
    else next_stage = 'closing'
  } else if (interview_type === 'technical') {
    if (questionCount < 2) next_stage = 'introduction'
    else if (questionCount < 8) next_stage = 'technical'
    else next_stage = 'closing'
  } else {
    if (questionCount < 2) next_stage = 'introduction'
    else if (questionCount < 8) next_stage = 'behavioral'
    else next_stage = 'closing'
  }

  // Generate AI response
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
              content: system_prompt || `You are conducting a professional ${interview_type} interview for ${position} at ${company}.`
            },
            {
              role: 'user',
              content: `Interview Context:
                Position: ${position} at ${company}
                Experience Level: ${experience}
                Job Description: ${job_description}
                Current Stage: ${next_stage}
                Question Count: ${questionCount + 1}
                
                Previous Question: "${previous_question}"
                Candidate's Response: "${transcript}"
                
                Conversation History:
                ${JSON.stringify(conversationHistory.slice(-3))}
                
                Based on the candidate's response, generate:
                1. A detailed analysis of their answer (relevance, clarity, depth, technical accuracy)
                2. Identify key strengths and areas for improvement
                3. Generate a contextual follow-up question that builds on their response
                4. The follow-up should be appropriate for the ${next_stage} stage
                5. Keep questions concise and natural for voice interaction
                
                Return as JSON with structure:
                {
                  "analysis": {
                    "relevance": 0-10,
                    "clarity": 0-10,
                    "depth": 0-10,
                    "confidence": 0-10,
                    "keywords_mentioned": [],
                    "follow_up_needed": boolean,
                    "strengths": [],
                    "improvements": []
                  },
                  "next_question": "...",
                  "reasoning": "..."
                }`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiResult = JSON.parse(data.choices[0].message.content)
        
        return {
          analysis: aiResult.analysis,
          next_question: aiResult.next_question,
          next_stage,
          should_complete: next_stage === 'closing' && questionCount >= 9,
          response_time: Date.now()
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
    }
  }

  // Fallback response
  return {
    analysis: {
      relevance: 7,
      clarity: 7,
      depth: 6,
      confidence: 7,
      keywords_mentioned: extractKeywords(transcript),
      follow_up_needed: true,
      strengths: ["Clear communication", "Relevant experience"],
      improvements: ["Could provide more specific examples"]
    },
    next_question: generateFallbackQuestion(next_stage, position, questionCount),
    next_stage,
    should_complete: questionCount >= 9,
    response_time: Date.now()
  }
}

function extractKeywords(text: string): string[] {
  const techKeywords = [
    'javascript', 'typescript', 'react', 'node', 'python', 'java', 'database',
    'api', 'cloud', 'aws', 'docker', 'kubernetes', 'agile', 'scrum',
    'testing', 'deployment', 'architecture', 'design', 'performance'
  ]
  
  const lowerText = text.toLowerCase()
  return techKeywords.filter(keyword => lowerText.includes(keyword))
}

function generateFallbackQuestion(stage: string, position: string, questionCount: number): string {
  const questions = {
    introduction: [
      `Can you elaborate on your experience with the technologies mentioned in the ${position} role?`,
      "What motivated you to apply for this position?",
      "How does this role align with your career goals?"
    ],
    technical: [
      "Can you describe a technical challenge you've overcome recently?",
      "How do you approach debugging complex issues?",
      "What's your experience with system design and architecture?",
      "How do you ensure code quality in your projects?",
      "Can you explain a time when you had to learn a new technology quickly?"
    ],
    behavioral: [
      "Tell me about a time you had to work with a difficult team member.",
      "How do you handle tight deadlines and pressure?",
      "Describe a situation where you had to make a difficult decision.",
      "How do you prioritize tasks when everything seems urgent?",
      "Can you share an example of when you went above and beyond?"
    ],
    situational: [
      "How would you handle a situation where you disagree with your manager's technical approach?",
      "What would you do if you discovered a critical bug just before a release?",
      "How would you onboard a new team member to a complex project?"
    ],
    closing: [
      "What questions do you have about the role or our company?",
      "What are your salary expectations for this position?",
      "When would you be available to start?",
      "Is there anything else you'd like to share that we haven't covered?"
    ]
  }

  const stageQuestions = questions[stage as keyof typeof questions] || questions.technical
  return stageQuestions[questionCount % stageQuestions.length]
}
