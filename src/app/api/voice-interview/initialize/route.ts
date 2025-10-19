import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      user_name,
      company,
      position,
      job_description,
      experience,
      interview_type,
      duration,
      system_prompt
    } = body

    // Create session ID
    const session_id = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize Supabase client
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Store interview session
    const { data: sessionData, error: sessionError } = await supabase
      .from('interviews')
      .insert({
        id: session_id,
        user_id: user_id,
        company: company,
        position: position,
        experience: experience,
        status: 'active',
        stage: 'introduction',
        started_at: new Date().toISOString(),
        metadata: {
          user_name,
          job_description,
          interview_type,
          duration,
          system_prompt,
          question_count: 0,
          total_questions: Math.floor(duration / 3) // Approximately 3 minutes per question
        }
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Database error:', sessionError)
    }

    // Generate contextual first question
    const first_question = await generateFirstQuestion({
      user_name,
      position,
      company,
      experience,
      interview_type,
      job_description
    })

    return NextResponse.json({
      session_id,
      first_question,
      total_questions: Math.floor(duration / 3),
      session: sessionData
    })

  } catch (error) {
    console.error('Error initializing interview:', error)
    return NextResponse.json(
      { error: 'Failed to initialize interview' },
      { status: 500 }
    )
  }
}

async function generateFirstQuestion(context: any): Promise<string> {
  const { user_name, position, company, experience, interview_type, job_description } = context

  // Generate AI-powered contextual question
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
              content: `You are an expert interviewer. Generate the first question for a ${interview_type} interview.`
            },
            {
              role: 'user',
              content: `Generate an appropriate opening question for:
                - Candidate: ${user_name}
                - Position: ${position} at ${company}
                - Experience: ${experience} level
                - Job Description: ${job_description}
                
                The question should be welcoming, professional, and relevant to the position.
                Keep it concise and natural for voice interaction.`
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
    }
  }

  // Fallback questions based on interview type and experience
  const fallbackQuestions = {
    technical: {
      entry: `Hello ${user_name}! Thank you for your interest in the ${position} role at ${company}. To start, could you tell me about your educational background and any projects or internships that have prepared you for this position?`,
      mid: `Welcome ${user_name}! I'm excited to discuss the ${position} opportunity at ${company} with you. Let's begin by having you walk me through your most significant technical achievement in your current or recent role.`,
      senior: `Good to meet you, ${user_name}. Thank you for considering the ${position} position at ${company}. I'd like to start by understanding your experience with system design and architecture. Can you describe a complex system you've designed or significantly contributed to?`,
      lead: `Hello ${user_name}, thank you for your interest in the ${position} role at ${company}. As a senior professional, I'd like to begin by discussing your leadership experience. How have you balanced technical excellence with team leadership in your recent roles?`
    },
    behavioral: {
      entry: `Hi ${user_name}! Welcome to your interview for the ${position} role at ${company}. Let's start with you telling me what attracted you to this opportunity and how it aligns with your career goals.`,
      mid: `Hello ${user_name}! Thank you for interviewing for the ${position} position at ${company}. I'd like to begin by understanding how you approach collaboration. Can you share an example of how you've worked effectively with cross-functional teams?`,
      senior: `Welcome ${user_name}. I appreciate your interest in the ${position} role at ${company}. Let's start by discussing your approach to mentorship and knowledge sharing. How have you contributed to the growth of your team members?`,
      lead: `Good to speak with you, ${user_name}. Thank you for considering the ${position} opportunity at ${company}. I'd like to understand your strategic thinking. Can you share how you've influenced technical or product strategy in your organization?`
    },
    mixed: {
      entry: `Hello ${user_name}! I'm excited to discuss the ${position} role at ${company} with you. To get started, could you give me a brief overview of your background and what specifically interests you about this opportunity?`,
      mid: `Welcome ${user_name}! Thank you for your interest in the ${position} position at ${company}. Let's begin with you sharing a recent project you're proud of and the impact it had on your organization.`,
      senior: `Hi ${user_name}, thank you for considering the ${position} role at ${company}. I'd like to start by understanding your approach to technical challenges. Can you walk me through how you've solved a particularly complex problem recently?`,
      lead: `Hello ${user_name}. I appreciate your interest in the ${position} position at ${company}. Let's begin by discussing your vision for this role. How do you see yourself contributing to and shaping our technical direction?`
    }
  }

  const typeQuestions = fallbackQuestions[interview_type as keyof typeof fallbackQuestions] || fallbackQuestions.mixed
  return typeQuestions[experience as keyof typeof typeQuestions] || typeQuestions.entry
}
