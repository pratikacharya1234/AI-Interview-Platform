import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      session_id,
      audio_chunk,
      timestamp,
      chunk_index 
    } = body

    if (!session_id || !audio_chunk) {
      return NextResponse.json(
        { error: 'Session ID and audio chunk are required' },
        { status: 400 }
      )
    }

    // Process audio chunk (mock transcription for now)
    const transcript = await processAudioChunk(audio_chunk, chunk_index)

    // Generate AI response if we have enough transcript
    let aiResponse = null
    if (transcript && transcript.length > 10) {
      aiResponse = await generateAIResponse(transcript, session_id)
    }

    // Store in database
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Store transcript
    if (transcript) {
      const { error } = await supabase
        .from('interview_transcripts')
        .insert({
          session_id,
          chunk_index,
          transcript,
          timestamp: new Date(timestamp).toISOString(),
          confidence: 0.95
        })

      if (error) {
        console.error('Error storing transcript:', error)
      }
    }

    return NextResponse.json({
      success: true,
      transcript,
      ai_response: aiResponse,
      chunk_index,
      timestamp
    })

  } catch (error) {
    console.error('Error processing audio:', error)
    return NextResponse.json(
      { error: 'Failed to process audio chunk' },
      { status: 500 }
    )
  }
}

async function processAudioChunk(audioData: string, chunkIndex: number): Promise<string> {
  // In production, this would use a real speech-to-text service
  // For now, return mock transcripts based on chunk index
  const mockTranscripts = [
    "I have five years of experience in software development",
    "My main expertise is in React and Node.js",
    "I've worked on several large-scale applications",
    "I'm passionate about clean code and best practices",
    "I enjoy solving complex technical challenges"
  ]

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return mockTranscripts[chunkIndex % mockTranscripts.length] || "..."
}

async function generateAIResponse(transcript: string, session_id: string): Promise<any> {
  // In production, this would use Claude/GPT-4
  // For now, return contextual responses
  
  const responses: { [key: string]: any } = {
    "experience": {
      assistant_reply: "That's great experience! Can you tell me more about the specific technologies you used in your recent projects?",
      evaluation_json: {
        technical_accuracy: 7,
        communication_clarity: 8,
        depth_of_knowledge: 7,
        problem_solving: 6,
        relevance: 9,
        strengths: ["Clear communication", "Relevant experience"],
        areas_for_improvement: ["Could provide more specific examples"],
        overall_score: 74,
        confidence_level: "medium"
      }
    },
    "React": {
      assistant_reply: "Excellent! React is crucial for our frontend. How do you handle state management in large React applications?",
      evaluation_json: {
        technical_accuracy: 8,
        communication_clarity: 8,
        depth_of_knowledge: 8,
        problem_solving: 7,
        relevance: 9,
        strengths: ["Strong React knowledge", "Modern tech stack"],
        areas_for_improvement: ["Discuss architecture patterns"],
        overall_score: 80,
        confidence_level: "high"
      }
    },
    "default": {
      assistant_reply: "Interesting! Can you elaborate on that and provide a specific example?",
      evaluation_json: {
        technical_accuracy: 6,
        communication_clarity: 7,
        depth_of_knowledge: 6,
        problem_solving: 6,
        relevance: 7,
        strengths: ["Attempting to answer"],
        areas_for_improvement: ["More detail needed"],
        overall_score: 64,
        confidence_level: "low"
      }
    }
  }

  // Find matching response based on transcript content
  for (const [keyword, response] of Object.entries(responses)) {
    if (transcript.toLowerCase().includes(keyword.toLowerCase())) {
      return response
    }
  }

  return responses.default
}
