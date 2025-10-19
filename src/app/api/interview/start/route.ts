import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      candidate_name, 
      candidate_email, 
      position, 
      interview_type = 'technical',
      difficulty = 'medium' 
    } = body

    // Create session ID
    const session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const interview_id = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize Supabase client
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Create interview session in database
    const { data: interviewData, error: interviewError } = await supabase
      .from('interview_sessions')
      .insert({
        id: interview_id,
        session_id: session_id,
        user_email: candidate_email,
        user_name: candidate_name,
        position: position,
        interview_type: interview_type,
        difficulty: difficulty,
        status: 'active',
        started_at: new Date().toISOString(),
        metadata: {
          candidate_name,
          position,
          interview_type,
          difficulty
        }
      })
      .select()
      .single()

    if (interviewError) {
      console.error('Database error:', interviewError)
      // Continue without database if it fails
    }

    // Generate initial question based on position and type
    const initial_question = generateInitialQuestion(position, interview_type)

    return NextResponse.json({
      session_id,
      interview_id,
      initial_question,
      status: 'started',
      message: 'Interview session started successfully'
    })

  } catch (error) {
    console.error('Error starting interview:', error)
    return NextResponse.json(
      { error: 'Failed to start interview session' },
      { status: 500 }
    )
  }
}

function generateInitialQuestion(position: string, interview_type: string) {
  const questions: Record<string, Record<string, string>> = {
    technical: {
      'Software Engineer': 'Thank you for joining us today. To start, could you tell me about your experience with software development and what technologies you\'ve been working with recently?',
      'Frontend Developer': 'Welcome! Let\'s begin by discussing your experience with frontend technologies. What frameworks and tools have you been using in your recent projects?',
      'Backend Developer': 'Hello! I\'d like to start by understanding your backend development experience. Can you describe the architecture of a recent system you\'ve worked on?',
      'Full Stack Developer': 'Great to have you here! Could you walk me through a full-stack application you\'ve built, from the frontend to the backend architecture?',
      'default': 'Thank you for joining us today. Let\'s start with you telling me about your technical background and recent projects you\'ve worked on.'
    },
    behavioral: {
      'default': 'Welcome to the interview! I\'d like to begin by learning more about you. Could you tell me about yourself and what motivated you to apply for this position?'
    },
    default: {
      'default': 'Thank you for joining us today. To start, could you please introduce yourself and tell me about your relevant experience?'
    }
  }

  const typeQuestions = questions[interview_type as keyof typeof questions] || questions.default
  const question = typeQuestions[position] || typeQuestions.default

  return {
    question,
    type: interview_type,
    expected_topics: ['experience', 'skills', 'projects'],
    evaluation_criteria: ['communication', 'relevance', 'technical knowledge']
  }
}
