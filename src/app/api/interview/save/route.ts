import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Initialize Supabase client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase not configured')
      return NextResponse.json({
        success: false,
        error: 'Database connection not configured',
        interviewId: interviewData.id,
        metrics,
        feedback,
        message: 'Interview processed but not saved to database'
      })
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([{
        id: interviewData.id,
        user_email: session.user.email,
        start_time: interviewData.startTime,
        end_time: interviewData.endTime,
        duration: interviewData.duration,
        messages: interviewData.messages,
        video_enabled: interviewData.videoEnabled || false,
        recording_url: interviewData.recordingUrl,
        position: interviewData.position || 'Software Developer',
        company: interviewData.company || 'Tech Company',
        status: interviewData.status || 'completed',
        metrics: metrics,
        feedback: feedback,
        feedback_image_url: feedbackImageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to save to database: ${error.message}`)
    }

    console.log(`Interview saved: ${interviewData.id} for user: ${session.user.email}`)

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
    return NextResponse.json(
      { error: 'Failed to save interview session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not configured',
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
        .eq('user_email', session.user.email)
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
        .eq('user_email', session.user.email)
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