import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const session_id = formData.get('session_id') as string

    if (!audioFile || !session_id) {
      return NextResponse.json(
        { error: 'Audio file and session ID are required' },
        { status: 400 }
      )
    }

    // Convert audio to base64 for processing
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Call Google Speech-to-Text or Whisper API
    const transcript = await transcribeAudio(base64Audio)

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      )
    }

    // Process the transcript
    return processTranscriptResponse(session_id, transcript)

  } catch (error) {
    console.error('Error processing audio:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}

async function transcribeAudio(base64Audio: string): Promise<string> {
  // Try OpenAI Whisper first
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: createWhisperFormData(base64Audio)
      })

      if (response.ok) {
        const data = await response.json()
        return data.text
      }
    } catch (error) {
      console.error('Whisper API error:', error)
    }
  }

  // Fallback to Google Speech-to-Text
  if (process.env.GOOGLE_CLOUD_API_KEY) {
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              languageCode: 'en-US',
              enableAutomaticPunctuation: true,
              model: 'latest_long'
            },
            audio: {
              content: base64Audio
            }
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results[0]) {
          return data.results[0].alternatives[0].transcript
        }
      }
    } catch (error) {
      console.error('Google STT error:', error)
    }
  }

  // Mock transcription for testing
  return "This is a sample response from the candidate discussing their experience and qualifications for the position."
}

function createWhisperFormData(base64Audio: string): FormData {
  const audioBlob = new Blob([Buffer.from(base64Audio, 'base64')], { type: 'audio/webm' })
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', 'en')
  return formData
}

async function processTranscriptResponse(session_id: string, transcript: string) {
  // Get session data
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: session, error: sessionError } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', session_id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  // Get previous responses
  const { data: previousResponses } = await supabase
    .from('responses')
    .select('*')
    .eq('interview_id', session_id)
    .order('timestamp', { ascending: true })

  // Generate AI response using Claude or OpenAI
  const aiResponse = await generateAIResponse(
    session,
    transcript,
    previousResponses || []
  )

  // Save response to database
  const { data: responseData, error: responseError } = await supabase
    .from('responses')
    .insert({
      interview_id: session_id,
      question: aiResponse.current_question || '',
      answer: transcript,
      analysis: aiResponse.analysis,
      timestamp: new Date().toISOString(),
      stage: aiResponse.stage
    })
    .select()
    .single()

  // Update session stage and progress
  await supabase
    .from('interviews')
    .update({
      stage: aiResponse.stage,
      metadata: {
        ...session.metadata,
        progress: aiResponse.progress,
        question_count: (previousResponses?.length || 0) + 1
      }
    })
    .eq('id', session_id)

  return NextResponse.json({
    response_id: responseData?.id,
    transcript,
    analysis: aiResponse.analysis,
    next_question: aiResponse.next_question,
    stage: aiResponse.stage,
    progress: aiResponse.progress
  })
}

async function generateAIResponse(session: any, transcript: string, previousResponses: any[]) {
  const { user_name, position, company, experience, system_prompt } = session.metadata || {}
  
  // Determine current stage and progress
  const responseCount = previousResponses.length + 1
  let stage = 'introduction'
  let progress = 25

  if (responseCount <= 2) {
    stage = 'introduction'
    progress = responseCount * 12.5
  } else if (responseCount <= 5) {
    stage = 'technical'
    progress = 25 + ((responseCount - 2) * 12.5)
  } else if (responseCount <= 7) {
    stage = 'scenario'
    progress = 62.5 + ((responseCount - 5) * 12.5)
  } else if (responseCount <= 8) {
    stage = 'closing'
    progress = 87.5 + ((responseCount - 7) * 12.5)
  } else {
    stage = 'completed'
    progress = 100
  }

  // Build conversation history
  const conversationHistory = previousResponses.map(r => ({
    question: r.question,
    answer: r.answer
  }))

  // Call AI API (Claude or OpenAI)
  let aiResponse = null

  if (process.env.ANTHROPIC_API_KEY) {
    aiResponse = await callClaudeAPI(
      system_prompt,
      transcript,
      conversationHistory,
      stage,
      experience
    )
  } else if (process.env.OPENAI_API_KEY) {
    aiResponse = await callOpenAIAPI(
      system_prompt,
      transcript,
      conversationHistory,
      stage,
      experience
    )
  } else {
    // Fallback response
    aiResponse = generateFallbackResponse(stage, experience, responseCount)
  }

  return {
    ...aiResponse,
    stage,
    progress,
    current_question: previousResponses[previousResponses.length - 1]?.question
  }
}

async function callClaudeAPI(systemPrompt: string, transcript: string, history: any[], stage: string, experience: string) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Current stage: ${stage}
Experience level: ${experience}
Conversation history: ${JSON.stringify(history)}
Latest response: "${transcript}"

Generate the next interview question and analysis. Return JSON with:
- next_question: The next question to ask
- analysis: Brief analysis of the response (2-3 sentences)
- strengths: Array of 1-2 key strengths identified
- areas_to_probe: Array of 1-2 areas to explore further`
          }
        ]
      })
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.content[0].text
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Claude API error:', error)
  }

  return null
}

async function callOpenAIAPI(systemPrompt: string, transcript: string, history: any[], stage: string, experience: string) {
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
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Current stage: ${stage}
Experience level: ${experience}
Conversation history: ${JSON.stringify(history)}
Latest response: "${transcript}"

Generate the next interview question and analysis. Return JSON with:
- next_question: The next question to ask
- analysis: Brief analysis of the response (2-3 sentences)
- strengths: Array of 1-2 key strengths identified
- areas_to_probe: Array of 1-2 areas to explore further`
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
  }

  return null
}

function generateFallbackResponse(stage: string, experience: string, responseCount: number) {
  const questions = {
    introduction: [
      "Can you tell me more about your educational background?",
      "What are your key strengths that make you suitable for this role?"
    ],
    technical: [
      "Can you describe a challenging technical problem you've solved?",
      "What technologies are you most proficient in?",
      "How do you stay updated with industry trends?"
    ],
    scenario: [
      "How would you handle a situation where you disagree with your team's approach?",
      "Describe a time when you had to meet a tight deadline."
    ],
    closing: [
      "What questions do you have about the role or company?",
      "Where do you see yourself in five years?"
    ]
  }

  const stageQuestions = questions[stage as keyof typeof questions] || questions.introduction
  const next_question = stageQuestions[responseCount % stageQuestions.length]

  return {
    next_question,
    analysis: {
      summary: "The candidate provided a comprehensive response demonstrating good understanding.",
      strengths: ["Clear communication", "Relevant experience"],
      areas_to_probe: ["Technical depth", "Specific examples"]
    }
  }
}
