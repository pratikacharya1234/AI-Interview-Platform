import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// This endpoint specifically handles completed text interviews
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Parse interview data
    const interviewData = await request.json()
    console.log('Received interview data:', {
      id: interviewData.id,
      hasMessages: !!interviewData.messages,
      messageCount: interviewData.messages?.length,
      hasFeedback: !!interviewData.feedback
    })
    
    // Validate required fields
    if (!interviewData.id || !interviewData.messages || !Array.isArray(interviewData.messages)) {
      return NextResponse.json(
        { error: 'Invalid interview data: missing id or messages' },
        { status: 400 }
      )
    }
    
    // Extract questions and answers from messages
    const questions = interviewData.messages
      .filter((m: any) => m.type === 'interviewer')
      .map((m: any) => ({
        id: m.id,
        question: m.text,
        timestamp: m.timestamp
      }))
    
    const answers = interviewData.messages
      .filter((m: any) => m.type === 'candidate')
      .map((m: any) => ({
        id: m.id,
        answer: m.text,
        timestamp: m.timestamp
      }))
    
    // Calculate scores from feedback or use defaults
    const scores = interviewData.feedback?.scores || {
      communication: interviewData.metrics?.averageScore * 10 || 75,
      technicalSkills: interviewData.metrics?.averageScore * 10 || 75,
      problemSolving: interviewData.metrics?.averageScore * 10 || 75,
      culturalFit: interviewData.metrics?.averageScore * 10 || 75,
      overall: interviewData.metrics?.averageScore * 10 || 75
    }
    
    // Generate proper feedback if not provided
    const feedback = interviewData.feedback || await generateDetailedFeedback(questions, answers, interviewData)
    
    // Prepare database record
    const dbRecord = {
      id: interviewData.id,
      user_id: user?.id || null,
      interview_type: 'text',
      title: `${interviewData.position || 'Software Developer'} Interview`,
      description: `Text-based interview for ${interviewData.company || 'Company'}`,
      status: 'completed',
      duration_minutes: Math.round((interviewData.duration || 0) / 60),
      ai_accuracy_score: scores.overall || 0,
      communication_score: scores.communication || 0,
      technical_score: scores.technicalSkills || 0,
      overall_score: scores.overall || 0,
      feedback: feedback,
      questions: questions,
      answers: answers,
      started_at: interviewData.startTime || new Date().toISOString(),
      completed_at: interviewData.endTime || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Saving to database:', {
      id: dbRecord.id,
      user_id: dbRecord.user_id,
      questionCount: dbRecord.questions.length,
      answerCount: dbRecord.answers.length,
      overall_score: dbRecord.overall_score
    })
    
    // Save to database
    const { data, error } = await supabase
      .from('interview_sessions')
      .upsert([dbRecord], { onConflict: 'id' })
      .select()
      .single()
    
    if (error) {
      console.error('Database save error:', error)
      
      // Still return success but with warning
      return NextResponse.json({
        success: true,
        interviewId: interviewData.id,
        warning: 'Interview completed but database save failed',
        error: error.message,
        feedback: interviewData.feedback,
        scores: scores
      })
    }
    
    console.log('Interview saved successfully:', data.id)
    
    // Update user statistics if authenticated
    if (user?.id && data) {
      try {
        // Update or create user scores
        const { data: existingScores } = await supabase
          .from('user_scores')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (existingScores) {
          // Update existing scores with new average
          const totalInterviews = (existingScores.total_interviews || 0) + 1
          const newScores = {
            ai_accuracy_score: ((existingScores.ai_accuracy_score * existingScores.total_interviews) + scores.overall) / totalInterviews,
            communication_score: ((existingScores.communication_score * existingScores.total_interviews) + scores.communication) / totalInterviews,
            total_interviews: totalInterviews,
            successful_interviews: (existingScores.successful_interviews || 0) + 1,
            last_activity_timestamp: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          await supabase
            .from('user_scores')
            .update(newScores)
            .eq('user_id', user.id)
        } else {
          // Create new score record
          await supabase
            .from('user_scores')
            .insert({
              user_id: user.id,
              ai_accuracy_score: scores.overall,
              communication_score: scores.communication,
              completion_rate: 100,
              total_interviews: 1,
              successful_interviews: 1,
              last_activity_timestamp: new Date().toISOString()
            })
        }
        
        // Log session for streak tracking
        const today = new Date().toISOString().split('T')[0]
        await supabase
          .from('session_logs')
          .upsert({
            user_id: user.id,
            session_date: today,
            ai_accuracy_score: scores.overall,
            communication_score: scores.communication,
            completed: true,
            session_count: 1
          })
        
        console.log('User statistics updated')
      } catch (statsError) {
        console.error('Failed to update user statistics:', statsError)
        // Don't fail the request if stats update fails
      }
    }
    
    return NextResponse.json({
      success: true,
      interviewId: data.id,
      message: 'Interview saved successfully',
      feedback: data.feedback,
      scores: {
        overall: data.overall_score,
        communication: data.communication_score,
        technical: data.technical_score,
        ai_accuracy: data.ai_accuracy_score
      },
      savedAt: data.created_at
    })
    
  } catch (error) {
    console.error('Error in interview complete endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete interview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to generate detailed feedback
async function generateDetailedFeedback(questions: any[], answers: any[], interviewData: any) {
  // Calculate average score from metrics if available
  const avgScore = interviewData.metrics?.averageScore || 7.5
  
  // Generate dynamic feedback based on performance
  const strengths = []
  const improvements = []
  const recommendations = []
  
  if (avgScore >= 8) {
    strengths.push(
      'Excellent communication and articulation of ideas',
      'Strong technical knowledge demonstrated',
      'Professional and confident responses',
      'Good use of specific examples and experiences'
    )
    improvements.push(
      'Consider adding more depth to system design discussions',
      'Could elaborate more on team collaboration experiences'
    )
  } else if (avgScore >= 6) {
    strengths.push(
      'Good understanding of core concepts',
      'Clear communication style',
      'Showed enthusiasm for the role'
    )
    improvements.push(
      'Provide more specific examples from past experiences',
      'Expand on technical problem-solving approaches',
      'Work on structuring responses more clearly'
    )
  } else {
    strengths.push(
      'Showed willingness to learn',
      'Maintained professional demeanor'
    )
    improvements.push(
      'Need to strengthen technical fundamentals',
      'Practice articulating thoughts more clearly',
      'Prepare more concrete examples from past work',
      'Research the company and role more thoroughly'
    )
  }
  
  // Add recommendations based on performance
  if (avgScore < 7) {
    recommendations.push(
      'Practice common interview questions using the STAR method',
      'Review technical concepts relevant to the position',
      'Prepare 3-5 specific examples of past achievements'
    )
  }
  recommendations.push(
    'Continue practicing with mock interviews',
    'Research the company culture and values',
    'Prepare thoughtful questions for the interviewer'
  )
  
  const overallFeedback = avgScore >= 8 
    ? `Excellent performance! You demonstrated strong technical skills and communicated your ideas effectively. Your responses were well-structured and showed deep understanding of the concepts discussed. Keep up the great work!`
    : avgScore >= 6
    ? `Good job on your interview! You showed solid understanding of the fundamentals and communicated clearly. With some practice on providing more specific examples and deeper technical discussions, you'll be even stronger in future interviews.`
    : `Thank you for completing the interview. While there are areas for improvement, you showed potential and willingness to learn. Focus on strengthening your technical knowledge and practicing your communication skills to improve your performance.`
  
  return {
    overall: overallFeedback,
    scores: {
      communication: Math.round(avgScore * 10 + (Math.random() * 10 - 5)),
      technicalSkills: Math.round(avgScore * 10 + (Math.random() * 10 - 5)),
      problemSolving: Math.round(avgScore * 10 + (Math.random() * 10 - 5)),
      culturalFit: Math.round(avgScore * 10 + (Math.random() * 10 - 5)),
      overall: Math.round(avgScore * 10)
    },
    strengths: strengths,
    improvements: improvements,
    recommendations: recommendations
  }
}
