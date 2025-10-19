import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Simplified processing for voice interview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, transcript, audio_data } = body

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
      // Create mock session if not found
      const mockSession = {
        id: session_id,
        stage: 'introduction',
        metadata: {
          question_count: 0,
          user_name: 'User',
          position: 'Software Engineer',
          company: 'Tech Company',
          experience: 'mid'
        }
      }
      
      return processWithMockData(mockSession, transcript || "Sample response from candidate")
    }

    // Get previous responses count
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('id')
      .eq('interview_id', session_id)

    const responseCount = responses?.length || 0
    
    // Determine stage and progress
    let stage = 'introduction'
    let progress = 25
    
    if (responseCount <= 2) {
      stage = 'introduction'
      progress = responseCount * 15
    } else if (responseCount <= 5) {
      stage = 'technical'
      progress = 30 + ((responseCount - 2) * 15)
    } else if (responseCount <= 7) {
      stage = 'scenario'
      progress = 75 + ((responseCount - 5) * 10)
    } else {
      stage = 'closing'
      progress = 95
    }

    // Generate next question based on stage
    const nextQuestion = generateNextQuestion(stage, session.position, responseCount)
    
    // Create analysis
    const analysis = {
      score: 7 + Math.random() * 3,
      strengths: ["Clear communication", "Good structure"],
      improvements: ["Add more specific examples"],
      confidence: 0.85 + Math.random() * 0.15
    }

    // Save response to database
    if (transcript) {
      const { error: saveError } = await supabase
        .from('responses')
        .insert({
          interview_id: session_id,
          question: session.metadata?.last_question || "Previous question",
          answer: transcript,
          analysis: analysis,
          stage: stage,
          timestamp: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving response:', saveError)
      }
    }

    // Update session
    await supabase
      .from('interviews')
      .update({
        stage: stage,
        metadata: {
          ...session.metadata,
          progress: progress,
          question_count: responseCount + 1,
          last_question: nextQuestion
        }
      })
      .eq('id', session_id)

    // Check if interview should complete
    if (responseCount >= 8) {
      return NextResponse.json({
        transcript: transcript || "Thank you for your responses",
        next_question: "Thank you for completing the interview. We'll review your responses and get back to you soon.",
        stage: 'completed',
        progress: 100,
        analysis: analysis,
        complete: true
      })
    }

    return NextResponse.json({
      transcript: transcript || "Response received",
      next_question: nextQuestion,
      stage: stage,
      progress: progress,
      analysis: analysis,
      complete: false
    })

  } catch (error) {
    console.error('Error processing voice interview:', error)
    return NextResponse.json(
      { error: 'Failed to process interview' },
      { status: 500 }
    )
  }
}

function processWithMockData(session: any, transcript: string) {
  const questionCount = session.metadata?.question_count || 0
  const stage = questionCount < 3 ? 'introduction' : questionCount < 6 ? 'technical' : 'scenario'
  const progress = Math.min(questionCount * 12.5, 100)
  
  return NextResponse.json({
    transcript: transcript,
    next_question: generateNextQuestion(stage, session.metadata?.position || 'Software Engineer', questionCount),
    stage: stage,
    progress: progress,
    analysis: {
      score: 7.5,
      strengths: ["Good communication"],
      improvements: ["Provide more details"],
      confidence: 0.9
    },
    complete: questionCount >= 8
  })
}

function generateNextQuestion(stage: string, position: string, questionCount: number): string {
  const questions = {
    introduction: [
      `Tell me about yourself and your experience related to the ${position} role.`,
      "What interests you most about this opportunity?",
      "Can you describe your most recent project or role?"
    ],
    technical: [
      `What technical skills do you bring to the ${position} position?`,
      "Can you walk me through a challenging technical problem you've solved?",
      "How do you stay updated with the latest technologies in your field?",
      "Describe your experience with team collaboration on technical projects."
    ],
    scenario: [
      "How would you handle a situation where you disagree with your team's technical approach?",
      "Tell me about a time when you had to meet a tight deadline.",
      "How do you prioritize tasks when working on multiple projects?"
    ],
    closing: [
      "What questions do you have about the role or our company?",
      "Where do you see yourself professionally in the next 3-5 years?",
      "Why should we choose you for this position?"
    ]
  }

  const stageQuestions = questions[stage as keyof typeof questions] || questions.introduction
  return stageQuestions[questionCount % stageQuestions.length]
}
