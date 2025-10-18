import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const systemPrompt = `You are an experienced professional interviewer conducting a video interview. 
Your role is to:
- Ask relevant, thoughtful interview questions
- Listen carefully to responses
- Provide constructive feedback
- Create a professional yet comfortable atmosphere
- Ask follow-up questions based on the candidate's answers
- Cover topics like experience, skills, problem-solving, and cultural fit

Keep your responses concise and professional. Ask one question at a time.`

    // For now, return a simple response
    // In production, you would integrate with an AI service like OpenAI or Google Gemini
    const lastMessage = messages[messages.length - 1]
    
    let responseContent = ""
    
    if (lastMessage.parts[0].text.includes("Start the interview")) {
      responseContent = "Hello! I'm your AI interviewer today. Thank you for joining this video interview session. I can see you clearly, and everything looks good on my end. Let's begin with a simple introduction. Could you please tell me about yourself and what interests you about this position?"
    } else if (lastMessage.parts[0].text.includes("[Audio Response")) {
      responseContent = "Thank you for your response. That's very interesting. Now, let me ask you about your technical experience. Can you describe a challenging project you've worked on recently and how you approached solving the problems you encountered?"
    } else {
      responseContent = "I appreciate your answer. Let me follow up on that. How do you typically handle situations where you need to learn new technologies or skills quickly for a project?"
    }

    return NextResponse.json({
      content: responseContent,
      role: 'assistant'
    })
  } catch (error) {
    console.error('Error in video interview API:', error)
    return NextResponse.json(
      { error: 'Failed to process interview' },
      { status: 500 }
    )
  }
}
