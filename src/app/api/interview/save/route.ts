import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface InterviewMessage {
  id: string
  type: 'interviewer' | 'candidate'
  text: string
  timestamp: string
  duration?: number
}

interface InterviewSession {
  id: string
  startTime: string
  endTime?: string
  duration: number
  messages: InterviewMessage[]
  videoEnabled?: boolean
  recordingUrl?: string
  feedback?: any
  userId?: string
  userEmail?: string
  position?: string
  company?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  metrics?: any
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Try NextAuth session as fallback
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const userEmail = user?.email || (await getServerSession(authOptions))?.user?.email
    const interviewData: InterviewSession = await request.json()
    
    // Validate the interview data
    if (!interviewData.id || !interviewData.messages || !Array.isArray(interviewData.messages)) {
      return NextResponse.json(
        { error: 'Invalid interview data' },
        { status: 400 }
      )
    }

    // Calculate interview metrics
    const metrics = calculateInterviewMetrics(interviewData)
    
    // Generate AI feedback based on responses
    const feedback = await generateInterviewFeedback(interviewData.messages)

    // Generate feedback image
    let feedbackImageUrl = null
    try {
      const imageResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/generate-feedback-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          metrics,
          interviewId: interviewData.id
        })
      })

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        feedbackImageUrl = imageData.imageUrl
      }
    } catch (imageError) {
      console.error('Failed to generate feedback image:', imageError)
      // Continue without image if generation fails
    }

    // Check if tables exist
    const { data: tableCheck } = await supabase
      .from('interview_sessions')
      .select('id')
      .limit(1)
    
    if (!tableCheck && !user) {
      console.error('Database tables not configured')
      return NextResponse.json({
        success: false,
        error: 'Database not properly configured',
        interviewId: interviewData.id,
        metrics,
        feedback,
        message: 'Interview processed but not saved to database'
      })
    }

    // Save to Supabase with proper schema
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([{
        id: interviewData.id,
        user_id: user?.id || null,
        interview_type: 'conversational',
        title: `Interview - ${interviewData.position || 'Software Developer'}`,
        description: `Interview for ${interviewData.company || 'Tech Company'}`,
        status: interviewData.status || 'completed',
        duration_minutes: Math.round(interviewData.duration / 60),
        ai_accuracy_score: feedback.scores.overall,
        communication_score: feedback.scores.communication,
        technical_score: feedback.scores.technicalSkills,
        overall_score: feedback.scores.overall,
        feedback: feedback,
        questions: interviewData.messages.filter(m => m.type === 'interviewer'),
        answers: interviewData.messages.filter(m => m.type === 'candidate'),
        started_at: interviewData.startTime,
        completed_at: interviewData.endTime || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      
      // Return success with warning instead of throwing error
      return NextResponse.json({
        success: true,
        interviewId: interviewData.id,
        metrics,
        feedback,
        feedbackImageUrl,
        warning: `Database save failed: ${error.message}`,
        message: 'Interview processed successfully (database save failed)'
      })
    }

    // Update user scores if user is authenticated
    if (user?.id) {
      await updateUserScores(supabase, user.id, feedback.scores)
      await logSessionCompletion(supabase, user.id, feedback.scores)
    }
    
    console.log(`Interview saved: ${interviewData.id} for user: ${userEmail}`)

    return NextResponse.json({
      success: true,
      interviewId: interviewData.id,
      metrics,
      feedback,
      feedbackImageUrl,
      message: 'Interview session saved successfully'
    })

  } catch (error) {
    console.error('Error saving interview:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Full error details:', errorMessage)
    
    return NextResponse.json(
      { 
        error: 'Failed to save interview session',
        details: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Return empty array for unauthenticated users
      return NextResponse.json({
        success: true,
        interviews: []
      })
    }

    const { searchParams } = new URL(request.url)
    const interviewId = searchParams.get('id')

    if (interviewId) {
      // Get specific interview session from Supabase
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', interviewId)
        .eq('user_id', user.id)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Interview session not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        interview: data
      })
    } else {
      // Get all interviews for the user from Supabase
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch interviews: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        interviews: data || []
      })
    }

  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview sessions' },
      { status: 500 }
    )
  }
}

function calculateInterviewMetrics(interview: InterviewSession) {
  const candidateMessages = interview.messages.filter(msg => msg.type === 'candidate')
  const interviewerMessages = interview.messages.filter(msg => msg.type === 'interviewer')

  const totalWords = candidateMessages.reduce((total, msg) => {
    return total + msg.text.split(' ').length
  }, 0)

  const averageResponseLength = candidateMessages.length > 0 
    ? Math.round(totalWords / candidateMessages.length)
    : 0

  const responseTime = candidateMessages.length > 0 
    ? Math.round(interview.duration / candidateMessages.length)
    : 0

  // Calculate confidence score based on various factors
  const confidenceScore = calculateConfidenceScore(candidateMessages, interview.duration)

  return {
    totalQuestions: interviewerMessages.length,
    totalResponses: candidateMessages.length,
    totalWords,
    averageResponseLength,
    averageResponseTime: responseTime,
    interviewDuration: interview.duration,
    confidenceScore,
    videoEnabled: interview.videoEnabled,
    completionRate: Math.round((candidateMessages.length / interviewerMessages.length) * 100)
  }
}

function calculateConfidenceScore(messages: InterviewMessage[], duration: number): number {
  let score = 75 // Base score

  // Factors that increase confidence
  messages.forEach(message => {
    const words = message.text.split(' ')
    const wordCount = words.length

    // Penalty for very short responses
    if (wordCount < 10) {
      score -= 5
    }

    // Bonus for detailed responses
    if (wordCount > 30) {
      score += 3
    }

    // Check for confidence indicators
    const confidenceWords = ['confident', 'experienced', 'skilled', 'accomplished', 'successful']
    const hesitationWords = ['um', 'uh', 'maybe', 'i think', 'i guess', 'probably']

    confidenceWords.forEach(word => {
      if (message.text.toLowerCase().includes(word)) {
        score += 2
      }
    })

    hesitationWords.forEach(word => {
      if (message.text.toLowerCase().includes(word)) {
        score -= 1
      }
    })
  })

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)))
}

async function generateInterviewFeedback(messages: InterviewMessage[]) {
  const candidateResponses = messages.filter(msg => msg.type === 'candidate')

  // Simple AI feedback generation (replace with actual AI service)
  const feedback = {
    overall: "Great job on your interview! You demonstrated good communication skills and provided thoughtful responses.",
    strengths: [
      "Clear and articulate communication",
      "Good understanding of the role requirements",
      "Professional demeanor throughout the interview"
    ],
    improvements: [
      "Consider providing more specific examples in your responses",
      "Practice answering questions more concisely",
      "Work on reducing filler words during responses"
    ],
    recommendations: [
      "Review common behavioral interview questions",
      "Practice the STAR method for structured responses",
      "Research the company and role more thoroughly"
    ],
    scores: {
      communication: 85,
      technicalSkills: 78,
      problemSolving: 82,
      culturalFit: 88,
      overall: 83
    }
  }

  return feedback
}

// Helper function to update user scores
async function updateUserScores(supabase: any, userId: string, scores: any) {
  try {
    // Get current scores
    const { data: currentScores } = await supabase
      .from('user_scores')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (currentScores) {
      // Update with new average
      const totalInterviews = (currentScores.total_interviews || 0) + 1
      const newScores = {
        ai_accuracy_score: ((currentScores.ai_accuracy_score * currentScores.total_interviews) + scores.overall) / totalInterviews,
        communication_score: ((currentScores.communication_score * currentScores.total_interviews) + scores.communication) / totalInterviews,
        total_interviews: totalInterviews,
        successful_interviews: (currentScores.successful_interviews || 0) + 1,
        last_activity_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await supabase
        .from('user_scores')
        .update(newScores)
        .eq('user_id', userId)
    } else {
      // Create new score record
      await supabase
        .from('user_scores')
        .insert({
          user_id: userId,
          ai_accuracy_score: scores.overall || 0,
          communication_score: scores.communication || 0,
          completion_rate: 100,
          total_interviews: 1,
          successful_interviews: 1,
          last_activity_timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Error updating user scores:', error)
  }
}

// Helper function to log session completion
async function logSessionCompletion(supabase: any, userId: string, scores: any) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    await supabase
      .from('session_logs')
      .upsert({
        user_id: userId,
        session_date: today,
        ai_accuracy_score: scores.overall,
        communication_score: scores.communication,
        completed: true,
        session_count: 1
      })
    
    // Update streak
    await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        last_active_date: today,
        streak_count: 1,
        total_sessions: 1
      })
  } catch (error) {
    console.error('Error logging session:', error)
  }
}