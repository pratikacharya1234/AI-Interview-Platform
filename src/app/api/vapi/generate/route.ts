import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { difficultyLevels, questionTypes } from '@/constants/interview';

// Initialize Gemini AI client
const gemini = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY) : null;

interface GenerateQuestionsRequest {
  role: string;
  level: string;
  techStack: string[];
  type: 'technical' | 'behavioral' | 'mixed';
  amount: number;
  company?: string;
  jobDescription?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json();
    const {
      role,
      level,
      techStack,
      type,
      amount,
      company,
      jobDescription,
    } = body;

    // Validate inputs
    if (!role || !level || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: role, level, or amount' },
        { status: 400 }
      );
    }

    // Generate questions using available AI service
    const questions = await generateInterviewQuestions({
      role,
      level,
      techStack: techStack || [],
      type,
      amount: Math.min(amount, 30), // Cap at 30 questions
      company,
      jobDescription,
    });

    // Validate and format questions
    const formattedQuestions = questions
      .filter(q => q && q.length > 10) // Filter out empty or too short questions
      .map(q => q.replace(/[*\/\\]/g, '')) // Remove special characters that might break voice
      .slice(0, amount); // Ensure we don't exceed requested amount

    if (formattedQuestions.length === 0) {
      throw new Error('Failed to generate valid questions');
    }

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      metadata: {
        role,
        level,
        type,
        count: formattedQuestions.length,
        techStack,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('[Generate Questions API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

async function generateInterviewQuestions({
  role,
  level,
  techStack,
  type,
  amount,
  company,
  jobDescription,
}: GenerateQuestionsRequest): Promise<string[]> {
  
  // Get difficulty configuration
  const difficulty = difficultyLevels[level.toUpperCase() as keyof typeof difficultyLevels] || difficultyLevels.MID;
  
  // Build context for question generation
  const context = {
    role,
    level: difficulty.label,
    techStack: techStack.join(', '),
    company: company || 'the company',
    jobDescription: jobDescription || '',
    questionComplexity: difficulty.questionComplexity,
    technicalDepth: difficulty.technicalDepth,
  };

  // Create the prompt
  const prompt = buildQuestionGenerationPrompt(context, type, amount);

  try {
    let questions: string[] = [];

    // Use Gemini for question generation
    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text) {
          questions = parseQuestionsFromResponse(text);
        }
      } catch (error) {
        console.error('[Generate] Gemini error:', error);
      }
    }

    // Fallback to predefined questions if AI fails
    if (!questions.length) {
      questions = getFallbackQuestions(role, level, type, amount);
    }

    return questions;

  } catch (error) {
    console.error('[Generate] Question generation error:', error);
    // Return fallback questions
    return getFallbackQuestions(role, level, type, amount);
  }
}

function buildQuestionGenerationPrompt(
  context: any,
  type: string,
  amount: number
): string {
  const techStackSection = context.techStack ? 
    `The tech stack used in the job is: ${context.techStack}.` : '';
  
  const jobDescSection = context.jobDescription ? 
    `Job Description: ${context.jobDescription}` : '';

  return `Generate ${amount} interview questions for a ${context.role} position at ${context.level} level.

${techStackSection}
${jobDescSection}

Requirements:
1. Questions should be ${context.questionComplexity} in complexity
2. Technical depth should be ${context.technicalDepth}
3. Focus: ${type === 'technical' ? 'Technical skills and knowledge' : 
           type === 'behavioral' ? 'Behavioral and situational scenarios' : 
           'Mix of technical and behavioral'}
4. Questions must be clear and suitable for voice conversation
5. Avoid using special characters like /, *, or \\ that might break text-to-speech
6. Each question should be answerable in 2-3 minutes
7. Questions should progressively build on each other when relevant

Please return ONLY the questions as a JSON array, like this:
["Question 1 here", "Question 2 here", "Question 3 here"]

Do not include any additional text, explanations, or formatting.`;
}

function parseQuestionsFromResponse(response: string): string[] {
  try {
    // Try to parse as JSON array first
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // If not valid JSON, try other parsing methods
  }

  // Try to extract array from response
  const arrayMatch = response.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue to line parsing
    }
  }

  // Parse line by line (fallback)
  const lines = response.split('\n');
  const questions: string[] = [];
  
  lines.forEach(line => {
    // Remove common prefixes and clean up
    const cleaned = line
      .replace(/^\d+[\.\)]\s*/, '') // Remove numbering
      .replace(/^[-•]\s*/, '') // Remove bullets
      .replace(/^Question\s*\d*:?\s*/i, '') // Remove "Question X:"
      .replace(/["\[\]]/g, '') // Remove quotes and brackets
      .trim();
    
    // Add if it looks like a question
    if (cleaned.length > 10 && 
        (cleaned.includes('?') || 
         cleaned.match(/^(what|how|why|when|where|who|which|can|could|would|should|do|does|is|are|have|has|tell|describe|explain)/i))) {
      questions.push(cleaned);
    }
  });

  return questions;
}

function getFallbackQuestions(
  role: string,
  level: string,
  type: string,
  amount: number
): string[] {
  const questions: string[] = [];
  
  // Technical questions
  const technicalQuestions = [
    `Can you describe your experience with the technologies relevant to the ${role} position?`,
    `What approach would you take to design a scalable system for our product?`,
    `How do you ensure code quality and maintainability in your projects?`,
    `Can you walk me through a challenging technical problem you solved recently?`,
    `What are your thoughts on current best practices in ${role} development?`,
    `How do you stay updated with new technologies and industry trends?`,
    `Describe your experience with testing and debugging complex systems.`,
    `What tools and methodologies do you use for project management and collaboration?`,
    `How would you optimize the performance of a slow application?`,
    `Can you explain your understanding of security best practices?`,
  ];

  // Behavioral questions
  const behavioralQuestions = [
    `Tell me about yourself and why you're interested in this ${role} position.`,
    `Describe a time when you had to work under pressure to meet a deadline.`,
    `How do you handle disagreements with team members or stakeholders?`,
    `Can you give an example of when you had to learn a new technology quickly?`,
    `What motivates you in your work, and how do you stay productive?`,
    `Describe a project you're particularly proud of and your role in it.`,
    `How do you prioritize tasks when working on multiple projects?`,
    `Tell me about a time you failed and what you learned from it.`,
    `How do you approach giving and receiving feedback?`,
    `Where do you see yourself professionally in the next 3-5 years?`,
  ];

  // Level-specific adjustments
  const levelAdjustments: Record<string, string[]> = {
    ENTRY: [
      `What interests you most about starting a career in ${role}?`,
      `How have your studies or projects prepared you for this role?`,
      `What areas would you like to develop further in this position?`,
    ],
    SENIOR: [
      `How would you mentor junior developers on the team?`,
      `Describe your experience with architectural decisions and trade-offs.`,
      `How do you balance technical excellence with business requirements?`,
    ],
    LEAD: [
      `How do you approach building and scaling engineering teams?`,
      `What's your strategy for technical debt management?`,
      `How do you drive technical innovation while maintaining stability?`,
    ],
  };

  // Build question list based on type
  if (type === 'technical') {
    questions.push(...technicalQuestions);
  } else if (type === 'behavioral') {
    questions.push(...behavioralQuestions);
  } else {
    // Mixed - alternate between technical and behavioral
    for (let i = 0; i < Math.min(technicalQuestions.length, behavioralQuestions.length); i++) {
      questions.push(technicalQuestions[i]);
      questions.push(behavioralQuestions[i]);
    }
  }

  // Add level-specific questions
  const levelKey = level.toUpperCase();
  if (levelAdjustments[levelKey]) {
    questions.push(...levelAdjustments[levelKey]);
  }

  // Return requested amount
  return questions.slice(0, amount);
}
