import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userId, userName, config, systemPrompt } = body

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Store session in database
    const { data: sessionData, error: sessionError } = await supabase
      .from('interviews')
      .insert({
        id: sessionId,
        user_id: userId,
        company: config.company,
        position: config.position,
        experience: config.experienceLevel,
        status: 'active',
        stage: 'intro',
        started_at: new Date().toISOString(),
        metadata: {
          userName,
          department: config.department,
          jobDescription: config.jobDescription,
          requirements: config.requirements,
          interviewType: config.interviewType,
          interviewFocus: config.interviewFocus,
          duration: config.duration,
          difficulty: config.difficulty,
          systemPrompt,
          totalQuestions: Math.ceil(config.duration / 3)
        }
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Database error:', sessionError)
      // Don't fail the request, continue with the interview
      // The session will be created on the next successful DB operation
    }

    // Generate first question based on config
    const firstQuestion = await generateFirstQuestion(config, userName)

    return NextResponse.json({
      success: true,
      sessionId,
      firstQuestion,
      session: sessionData
    })

  } catch (error) {
    console.error('Error initializing interview:', error)
    
    // Return a more detailed error for debugging in production
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize interview',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

async function generateFirstQuestion(config: any, userName: string) {
  const { position, company, experienceLevel, interviewType, jobDescription } = config

  // AI-powered question generation if API key available
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
              content: `Generate an opening interview question for a ${interviewType} interview.`
            },
            {
              role: 'user',
              content: `Create a warm, professional opening question for:
                - Candidate: ${userName}
                - Position: ${position} at ${company}
                - Experience: ${experienceLevel}
                - Job Description: ${jobDescription}
                
                The question should be welcoming and allow the candidate to introduce themselves naturally.`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        const questionText = data.choices[0].message.content

        return {
          id: `q_${Date.now()}`,
          text: questionText,
          type: 'opening',
          difficulty: 1,
          stage: 'intro',
          expectedDuration: 120,
          keywords: extractKeywords(jobDescription),
          evaluationCriteria: ['clarity', 'relevance', 'enthusiasm', 'experience']
        }
      }
    } catch (error) {
      console.error('OpenAI error:', error)
    }
  }

  // Fallback questions
  const openingQuestions = {
    intern: `Welcome ${userName}! I'm excited to learn about you. Could you start by telling me about your educational background and what interests you about the ${position} role at ${company}?`,
    entry: `Hello ${userName}! Thank you for joining us today. I'd love to hear about your background and what attracted you to the ${position} opportunity at ${company}.`,
    mid: `Good to meet you, ${userName}. Let's begin with you walking me through your professional journey and what brings you to apply for the ${position} role at ${company}.`,
    senior: `Welcome ${userName}. I appreciate you taking the time to speak with us. Could you share your professional background and what excites you about the ${position} position at ${company}?`,
    lead: `Hello ${userName}, thank you for your interest in ${company}. I'd like to start by learning about your leadership experience and what draws you to the ${position} role.`,
    executive: `Welcome ${userName}. Thank you for considering this opportunity with ${company}. Please share your executive experience and vision for the ${position} role.`
  }

  return {
    id: `q_${Date.now()}`,
    text: openingQuestions[experienceLevel as keyof typeof openingQuestions] || openingQuestions.mid,
    type: 'opening',
    difficulty: 1,
    stage: 'intro',
    expectedDuration: 120,
    keywords: extractKeywords(jobDescription),
    evaluationCriteria: ['clarity', 'relevance', 'enthusiasm', 'experience']
  }
}

function extractKeywords(text: string): string[] {
  const commonTechWords = [
    'javascript', 'typescript', 'react', 'node', 'python', 'java', 'aws', 'cloud',
    'docker', 'kubernetes', 'agile', 'scrum', 'api', 'database', 'sql', 'nosql',
    'microservices', 'architecture', 'design', 'testing', 'ci/cd', 'devops'
  ]
  
  const lowerText = text.toLowerCase()
  return commonTechWords.filter(word => lowerText.includes(word))
}
