import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const systemPrompt = `You are an experienced professional interviewer conducting an audio-only interview. 
Your role is to:
- Ask clear, relevant interview questions
- Listen carefully to verbal responses
- Provide constructive feedback on communication skills
- Create a professional yet comfortable atmosphere
- Ask follow-up questions based on the candidate's answers
- Focus on verbal communication, clarity, and articulation
- Cover topics like experience, skills, problem-solving, and cultural fit

Since this is audio-only, be extra clear in your questions and responses. Keep your responses concise and professional. Ask one question at a time.`

    // For now, return a simple response
    // In production, you would integrate with an AI service like OpenAI or Google Gemini
    const lastMessage = messages[messages.length - 1]
    
    let responseContent = ""
    
    if (lastMessage.parts[0].text.includes("Start the interview")) {
      responseContent = "Hello! Welcome to this audio interview. I'm your AI interviewer today. Since this is an audio-only session, please speak clearly and take your time with your responses. Let's start with a brief introduction. Could you tell me about your background and what motivated you to apply for this position?"
    } else if (lastMessage.parts[0].text.includes("[Audio Response")) {
      responseContent = "Thank you for sharing that. Your communication is clear and well-structured. Now, I'd like to understand your problem-solving approach. Can you walk me through a time when you had to overcome a significant challenge in your work?"
    } else {
      responseContent = "That's a great example. I appreciate the detail in your response. Let me ask you about teamwork. How do you typically collaborate with team members, especially in remote or distributed settings?"
    }

    return NextResponse.json({
      content: responseContent,
      role: 'assistant'
    })
  } catch (error) {
    console.error('Error in audio interview API:', error)
    return NextResponse.json(
      { error: 'Failed to process interview' },
      { status: 500 }
    )
  }
}
