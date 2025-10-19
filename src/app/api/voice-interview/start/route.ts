import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const SYSTEM_PROMPT = `You are an AI interviewer conducting a professional voice-based job interview. 
The candidate's name is {{name}}, applying for {{position}} at {{company}}, with {{experience}} experience. 
Ask one question at a time, adapting to the user's previous answer and experience level. 
Keep tone natural and professional. Follow the stages introduction, technical, scenario, and closing. 
Generate contextually relevant follow-up questions. 
Return structured JSON output containing the next question, short analysis of the last response, and stage label.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, user_name, company, position, experience } = body

    // Create session ID
    const session_id = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize Supabase client
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Create interview session in database
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
          system_prompt: SYSTEM_PROMPT
            .replace('{{name}}', user_name)
            .replace('{{position}}', position)
            .replace('{{company}}', company)
            .replace('{{experience}}', experience)
        }
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Database error:', sessionError)
    }

    // Generate first question based on experience level
    const first_question = generateFirstQuestion(user_name, position, company, experience)

    return NextResponse.json({
      session: sessionData || {
        id: session_id,
        user_id,
        company,
        position,
        experience,
        status: 'active',
        stage: 'introduction',
        started_at: new Date().toISOString()
      },
      first_question
    })

  } catch (error) {
    console.error('Error starting voice interview:', error)
    return NextResponse.json(
      { error: 'Failed to start interview' },
      { status: 500 }
    )
  }
}

function generateFirstQuestion(name: string, position: string, company: string, experience: string): string {
  const greetings = {
    entry: `Hello ${name}! Welcome to your interview for the ${position} position at ${company}. I'm excited to learn about your background and aspirations. To start, could you tell me what attracted you to this role and ${company}?`,
    mid: `Good to meet you, ${name}. Thank you for your interest in the ${position} role at ${company}. With your experience level, I'm curious to hear about your career journey. Could you walk me through your relevant experience and what brings you to this opportunity?`,
    senior: `Welcome ${name}. I appreciate you taking the time to discuss the ${position} position at ${company}. Given your senior-level experience, I'd like to start by understanding your leadership philosophy and how you've applied it in your recent roles.`,
    lead: `Hello ${name}, thank you for considering the ${position} role at ${company}. As someone with extensive experience, I'm interested in your strategic vision. Could you share how you've driven organizational change and innovation in your previous positions?`
  }

  return greetings[experience as keyof typeof greetings] || greetings.entry
}
