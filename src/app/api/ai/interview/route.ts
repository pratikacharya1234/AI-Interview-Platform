import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], interviewContext = {} } = await request.json()
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' }, 
        { status: 500 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      )
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Create interview context
    const systemPrompt = `You are Sarah, an experienced AI interviewer conducting a professional video interview. 

ROLE: You are a senior technical recruiter and interviewer with expertise in evaluating candidates across various roles.

PERSONALITY:
- Professional but warm and encouraging
- Clear and direct communication
- Supportive and constructive
- Ask follow-up questions to dive deeper
- Show genuine interest in the candidate's responses

INTERVIEW CONTEXT:
- Position: ${interviewContext.position || 'Software Developer'}
- Company: ${interviewContext.company || 'Tech Company'}
- Interview Duration: 15-20 minutes
- Current Question: ${interviewContext.currentQuestion || 1}

GUIDELINES:
1. Keep responses concise and conversational (2-3 sentences max)
2. Ask natural follow-up questions based on candidate responses
3. Provide encouragement and positive reinforcement
4. If the candidate seems nervous, be more supportive
5. Ask behavioral, technical, and situational questions appropriate to the role
6. Maintain professional interview flow

CONVERSATION FLOW:
- Start with easy questions to build confidence
- Progress to more challenging technical/behavioral questions
- End with questions about career goals and company fit

Remember: This is a real-time voice conversation, so keep responses natural and conversational.`

    // Build conversation history for context
    const conversationText = conversationHistory.map((msg: any) => 
      `${msg.type === 'interviewer' ? 'Sarah' : 'Candidate'}: ${msg.text}`
    ).join('\n')

    const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationText}

CANDIDATE'S LATEST RESPONSE: ${message}

Please respond as Sarah, the AI interviewer. Keep it natural, conversational, and appropriate for a professional video interview.`

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const responseText = response.text()

    // Clean up the response to remove any unwanted formatting
    const cleanResponse = responseText
      .replace(/^\*\*Sarah:\*\*\s*/i, '')
      .replace(/^\*Sarah:\*\s*/i, '')
      .replace(/^Sarah:\s*/i, '')
      .trim()

    return NextResponse.json({
      response: cleanResponse,
      timestamp: new Date().toISOString(),
      model: 'gemini-1.5-flash'
    })

  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Fallback response for errors
    const fallbackResponses = [
      "I apologize, but I'm having some technical difficulties. Could you please repeat your response?",
      "That's interesting. Could you tell me more about your experience with that?",
      "Thank you for sharing. Let's move on to the next question.",
      "I see. Can you elaborate on that a bit more?"
    ]
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    
    return NextResponse.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true,
      error: 'Gemini API temporarily unavailable'
    })
  }
}