import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, responses, metrics, config } = body

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Generate comprehensive feedback
    const feedback = await generateFeedback(responses, metrics, config)

    // Update interview with feedback
    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        feedback_summary: feedback
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating interview:', updateError)
    }

    return NextResponse.json({
      success: true,
      feedback
    })

  } catch (error) {
    console.error('Error completing interview:', error)
    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    )
  }
}

async function generateFeedback(responses: any[], metrics: any, config: any) {
  // Calculate scores
  const avgScore = responses.reduce((sum, r) => sum + (r.analysis?.score || 0), 0) / responses.length
  const avgRelevance = responses.reduce((sum, r) => sum + (r.analysis?.relevance || 0), 0) / responses.length
  const avgClarity = responses.reduce((sum, r) => sum + (r.analysis?.clarity || 0), 0) / responses.length
  const avgDepth = responses.reduce((sum, r) => sum + (r.analysis?.depth || 0), 0) / responses.length
  const avgConfidence = responses.reduce((sum, r) => sum + (r.analysis?.confidence || 0), 0) / responses.length

  // Collect all strengths and improvements
  const allStrengths = responses.flatMap(r => r.analysis?.strengths || [])
  const allImprovements = responses.flatMap(r => r.analysis?.improvements || [])

  // AI-powered comprehensive feedback
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
              content: 'You are an expert interview coach providing comprehensive feedback.'
            },
            {
              role: 'user',
              content: `Generate comprehensive interview feedback for:
                Position: ${config.position} at ${config.company}
                Experience Level: ${config.experienceLevel}
                Interview Type: ${config.interviewType}
                
                Performance Metrics:
                - Average Score: ${avgScore.toFixed(1)}/10
                - Relevance: ${avgRelevance.toFixed(1)}/10
                - Clarity: ${avgClarity.toFixed(1)}/10
                - Depth: ${avgDepth.toFixed(1)}/10
                - Confidence: ${avgConfidence.toFixed(1)}/10
                - Questions Answered: ${responses.length}
                
                Provide:
                1. Overall performance assessment
                2. Key strengths (3-5 points)
                3. Areas for improvement (3-5 points)
                4. Detailed analysis paragraph
                5. Specific recommendations (3-5 actionable items)
                6. Next steps for interview preparation
                
                Return as JSON with appropriate scores and feedback.`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 800,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiFeeback = JSON.parse(data.choices[0].message.content)
        
        return {
          overallScore: Math.round(avgScore),
          technicalScore: Math.round(avgDepth),
          communicationScore: Math.round(avgClarity),
          problemSolvingScore: Math.round(avgRelevance),
          cultureFitScore: Math.round(avgConfidence),
          strengths: aiFeeback.strengths || getTopItems(allStrengths, 4),
          areasForImprovement: aiFeeback.improvements || getTopItems(allImprovements, 4),
          detailedAnalysis: aiFeeback.analysis || generateDefaultAnalysis(avgScore, config),
          recommendations: aiFeeback.recommendations || generateDefaultRecommendations(avgScore),
          nextSteps: aiFeeback.nextSteps || generateDefaultNextSteps(avgScore, config)
        }
      }
    } catch (error) {
      console.error('OpenAI feedback error:', error)
    }
  }

  // Fallback feedback generation
  return {
    overallScore: Math.round(avgScore),
    technicalScore: Math.round(avgDepth),
    communicationScore: Math.round(avgClarity),
    problemSolvingScore: Math.round(avgRelevance),
    cultureFitScore: Math.round(avgConfidence),
    strengths: getTopItems(allStrengths, 4),
    areasForImprovement: getTopItems(allImprovements, 4),
    detailedAnalysis: generateDefaultAnalysis(avgScore, config),
    recommendations: generateDefaultRecommendations(avgScore),
    nextSteps: generateDefaultNextSteps(avgScore, config)
  }
}

function getTopItems(items: string[], count: number): string[] {
  const frequency: Record<string, number> = {}
  items.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1
  })
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([item]) => item)
}

function generateDefaultAnalysis(score: number, config: any): string {
  if (score >= 8) {
    return `Your interview performance for the ${config.position} role at ${config.company} was excellent. You demonstrated strong technical knowledge, clear communication skills, and a good understanding of the role requirements. Your responses showed depth and relevance, indicating solid preparation and genuine interest in the position.`
  } else if (score >= 6) {
    return `Your interview performance for the ${config.position} role at ${config.company} was good with room for improvement. You showed competence in key areas and communicated your ideas effectively. With some additional preparation on specific technical topics and more detailed examples, you would strengthen your candidacy significantly.`
  } else {
    return `Your interview for the ${config.position} role at ${config.company} indicates areas that need development. While you showed potential, focusing on providing more specific examples, improving technical depth, and practicing structured responses would greatly enhance your interview performance.`
  }
}

function generateDefaultRecommendations(score: number): string[] {
  if (score >= 8) {
    return [
      'Continue practicing with advanced technical scenarios',
      'Prepare more industry-specific examples',
      'Research company-specific challenges and solutions',
      'Practice discussing system design at scale'
    ]
  } else if (score >= 6) {
    return [
      'Work on providing more specific examples from your experience',
      'Practice the STAR method for behavioral questions',
      'Deepen your technical knowledge in core areas',
      'Prepare questions to ask the interviewer',
      'Practice explaining complex concepts simply'
    ]
  } else {
    return [
      'Focus on fundamental concepts in your field',
      'Practice common interview questions daily',
      'Work on structuring your responses clearly',
      'Build a portfolio of projects to discuss',
      'Seek feedback from mentors or peers'
    ]
  }
}

function generateDefaultNextSteps(score: number, config: any): string[] {
  if (score >= 8) {
    return [
      `Research ${config.company} recent projects and initiatives`,
      'Prepare thoughtful questions about the role and team',
      'Practice whiteboard or live coding if applicable',
      'Review and refine your professional narrative'
    ]
  } else if (score >= 6) {
    return [
      'Schedule mock interviews with peers or mentors',
      `Study ${config.position} specific requirements in depth`,
      'Create a 30-60-90 day plan for the role',
      'Improve examples using the STAR method',
      'Research common challenges in the industry'
    ]
  } else {
    return [
      'Take online courses relevant to the position',
      'Join professional communities in your field',
      'Build projects that demonstrate required skills',
      'Practice interviewing with AI tools regularly',
      'Seek mentorship from industry professionals'
    ]
  }
}
