import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
  videoEnabled: boolean
  recordingUrl?: string
  feedback?: any
  userId?: string
  userEmail?: string
  createdAt?: string
  updatedAt?: string
  metrics?: any
}

// In-memory storage for demo (replace with database in production)
const interviewSessions: Map<string, InterviewSession> = new Map()

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

    // Add user ID to the interview data
    const sessionWithUser = {
      ...interviewData,
      userEmail: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store interview session (replace with database operation)
    interviewSessions.set(interviewData.id, sessionWithUser)

    // Calculate interview metrics
    const metrics = calculateInterviewMetrics(interviewData)
    
    // Generate AI feedback based on responses
    const feedback = await generateInterviewFeedback(interviewData.messages)

    // Update session with metrics and feedback
    const updatedSession = {
      ...sessionWithUser,
      metrics,
      feedback,
      updatedAt: new Date().toISOString()
    }

    interviewSessions.set(interviewData.id, updatedSession)

    console.log(`Interview saved: ${interviewData.id} for user: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      interviewId: interviewData.id,
      metrics,
      feedback,
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

    const { searchParams } = new URL(request.url)
    const interviewId = searchParams.get('id')

    if (interviewId) {
      // Get specific interview session
      const interviewSession = interviewSessions.get(interviewId)
      
      if (!interviewSession) {
        return NextResponse.json(
          { error: 'Interview session not found' },
          { status: 404 }
        )
      }

      // Check if user owns this interview
      if (interviewSession.userEmail !== session.user.email) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        interview: interviewSession
      })
    } else {
      // Get all interviews for the user
      const userInterviews = Array.from(interviewSessions.values())
        .filter(interviewSession => interviewSession.userEmail === session.user?.email)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bTime - aTime
        })

      return NextResponse.json({
        success: true,
        interviews: userInterviews
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