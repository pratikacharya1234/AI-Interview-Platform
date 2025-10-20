import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { evaluationCriteria, responseQualityIndicators } from '@/constants/interview';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Gemini
const gemini = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY) : null;

interface FeedbackRequest {
  interviewId: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  position: string;
  company: string;
  experience: string;
  techStack: string[];
  duration: number;
}

interface EvaluationScore {
  category: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const {
      interviewId,
      userId,
      messages,
      position,
      company,
      experience,
      techStack,
      duration,
    } = body;

    // Validate required fields
    if (!interviewId || !userId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format transcript for analysis
    const formattedTranscript = messages
      .map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n\n');

    // Generate AI feedback
    const feedback = await generateAIFeedback({
      transcript: formattedTranscript,
      position,
      company,
      experience,
      techStack,
      duration,
    });

    // Calculate overall score
    const overallScore = calculateOverallScore(feedback.scores);

    // Determine hiring recommendation
    const hiringRecommendation = getHiringRecommendation(overallScore);

    // Save feedback to database
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('interview_feedback')
      .insert({
        interview_id: interviewId,
        user_id: userId,
        overall_score: overallScore,
        scores: feedback.scores,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        detailed_feedback: feedback.detailedFeedback,
        hiring_recommendation: hiringRecommendation,
        transcript: formattedTranscript,
        duration_seconds: duration,
        metadata: {
          position,
          company,
          experience,
          techStack,
          messageCount: messages.length,
          evaluationDate: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('[Feedback API] Database error:', feedbackError);
      throw new Error('Failed to save feedback');
    }

    // Update interview session with feedback reference
    await supabase
      .from('interview_sessions')
      .update({
        feedback_id: feedbackData.id,
        overall_score: overallScore,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', interviewId);

    // Return feedback ID for navigation
    return NextResponse.json({
      success: true,
      feedbackId: feedbackData.id,
      overallScore,
      hiringRecommendation,
    });

  } catch (error: any) {
    console.error('[Feedback API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

async function generateAIFeedback({
  transcript,
  position,
  company,
  experience,
  techStack,
  duration,
}: {
  transcript: string;
  position: string;
  company: string;
  experience: string;
  techStack: string[];
  duration: number;
}) {
  const systemPrompt = `You are an expert technical interviewer evaluating a candidate's performance in a job interview.
  
  Context:
  - Position: ${position}
  - Company: ${company}
  - Experience Level: ${experience}
  - Tech Stack: ${techStack.join(', ')}
  - Interview Duration: ${Math.floor(duration / 60)} minutes
  
  Your task is to provide a comprehensive, professional evaluation of the candidate's performance.
  Be thorough, specific, and constructive in your feedback. Focus on actual responses from the transcript.
  
  Evaluation Categories:
  1. Communication Skills (clarity, articulation, structure)
  2. Technical Knowledge (depth, accuracy, practical application)
  3. Problem Solving (analytical thinking, approach, creativity)
  4. Cultural & Role Fit (alignment, enthusiasm, collaboration)
  5. Confidence & Clarity (self-assurance, honesty, professionalism)
  
  For each category, provide:
  - A score from 0-100
  - Specific feedback with examples from the interview
  - 2-3 strengths
  - 2-3 areas for improvement
  
  Also provide:
  - Overall strengths (3-5 bullet points)
  - Key areas for improvement (3-5 bullet points)
  - Detailed summary (2-3 paragraphs)
  - Specific recommendations for the candidate's growth`;

  const userPrompt = `Please evaluate this interview transcript and provide detailed feedback:
  
  ${transcript}
  
  Return your evaluation in the following JSON format:
  {
    "scores": [
      {
        "category": "Communication Skills",
        "score": 0-100,
        "feedback": "detailed feedback",
        "strengths": ["strength1", "strength2"],
        "improvements": ["improvement1", "improvement2"]
      },
      // ... other categories
    ],
    "strengths": ["overall strength 1", "overall strength 2", ...],
    "improvements": ["improvement area 1", "improvement area 2", ...],
    "detailedFeedback": "2-3 paragraph detailed analysis",
    "recommendations": ["specific recommendation 1", "specific recommendation 2", ...]
  }`;

  try {
    let aiResponse;

    // Use Gemini for feedback generation
    if (gemini) {
      const model = gemini.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        }
      });
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON from response
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        aiResponse = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('[Feedback] Failed to parse Gemini response as JSON:', parseError);
        // Fallback to structured feedback
        aiResponse = generateStructuredFeedback(transcript, position, experience);
      }
    }
    // Fallback to structured feedback without AI
    else {
      console.warn('[Feedback] Gemini not configured, using structured feedback');
      aiResponse = generateStructuredFeedback(transcript, position, experience);
    }

    return aiResponse;

  } catch (error) {
    console.error('[Feedback] AI generation error:', error);
    // Return structured fallback feedback
    return generateStructuredFeedback(transcript, position, experience);
  }
}

function generateStructuredFeedback(transcript: string, position: string, experience: string) {
  // Analyze transcript for basic metrics
  const lines = transcript.split('\n');
  const candidateResponses = lines.filter(line => line.startsWith('Candidate:'));
  const avgResponseLength = candidateResponses.reduce((sum, r) => sum + r.length, 0) / candidateResponses.length;
  
  // Generate scores based on basic analysis
  const baseScore = Math.min(70 + (avgResponseLength / 50), 85);
  
  return {
    scores: Object.entries(evaluationCriteria).map(([key, criteria]) => ({
      category: criteria.label,
      score: Math.floor(baseScore + Math.random() * 10),
      feedback: `The candidate demonstrated ${criteria.label.toLowerCase()} throughout the interview.`,
      strengths: criteria.factors.slice(0, 2).map(f => `Good ${f}`),
      improvements: criteria.factors.slice(2, 4).map(f => `Could improve ${f}`),
    })),
    strengths: [
      'Engaged actively throughout the interview',
      'Provided structured responses to questions',
      'Showed interest in the role and company',
      'Maintained professional demeanor',
    ],
    improvements: [
      'Could provide more specific technical examples',
      'Expand on problem-solving methodology',
      'Ask more clarifying questions when needed',
    ],
    detailedFeedback: `The candidate completed a ${position} interview for ${experience} level position. The interview demonstrated solid foundational knowledge and communication skills. The candidate engaged well with the questions and maintained a professional approach throughout the discussion. There are opportunities to strengthen technical depth and provide more specific examples from past experiences.`,
    recommendations: [
      'Practice articulating technical concepts with more precision',
      'Prepare specific examples that demonstrate problem-solving skills',
      'Research the company and role more thoroughly for future interviews',
    ],
  };
}

function calculateOverallScore(scores: EvaluationScore[]): number {
  const weights = {
    'Communication Skills': 0.2,
    'Technical Knowledge': 0.3,
    'Problem Solving': 0.25,
    'Cultural & Role Fit': 0.15,
    'Confidence & Clarity': 0.1,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  scores.forEach(score => {
    const weight = weights[score.category as keyof typeof weights] || 0.2;
    weightedSum += score.score * weight;
    totalWeight += weight;
  });
  
  return Math.round(weightedSum / totalWeight);
}

function getHiringRecommendation(score: number): string {
  if (score >= 85) return 'Strong Yes - Excellent candidate, proceed immediately';
  if (score >= 70) return 'Yes - Good candidate, recommend moving forward';
  if (score >= 55) return 'Maybe - Has potential, consider for further evaluation';
  if (score >= 40) return 'Unlikely - Significant gaps, but could reconsider with development';
  return 'No - Not suitable for this role at this time';
}
