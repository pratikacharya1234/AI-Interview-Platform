import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenera  /**
   * Analyze interview response and provide feedback
   */
  async analyzeResponse(
    question: InterviewQuestion,
    userResponse: string,
    context?: { position: string; company: string }
  ): Promise<InterviewResponse> {.env.GEMINI_API_KEY!)

// Interview question types
export type QuestionType = 'technical' | 'behavioral' | 'system-design' | 'coding' | 'general'

export interface InterviewQuestion {
  id: string
  type: QuestionType
  question: string
  followUp?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  expectedDuration: number // in minutes
}

export interface InterviewResponse {
  questionId: string
  question: string // Add the original question text for history display
  userResponse: string
  score: number // 1-10
  feedback: string
  strengths: string[]
  improvements: string[]
  nextQuestionSuggestion?: QuestionType
}

export interface InterviewSession {
  sessionId: string
  candidateName: string
  position: string
  company: string
  questions: InterviewQuestion[]
  responses: InterviewResponse[]
  overallScore: number
  startTime: Date
  endTime?: Date
  feedback: string
  summaryImage?: string
  overallPerformance?: {
    averageScore: number
    level: string
    questionsAnswered: number
    totalQuestions: number
    completionRate: number
  }
}

class GeminiInterviewService {
  private model: any

  constructor() {
    // Try different model names - Gemini-1.5-flash is more widely available
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  /**
   * Generate interview questions based on job role and difficulty
   */
  async generateQuestions(
    position: string,
    company: string,
    questionTypes: QuestionType[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 5
  ): Promise<InterviewQuestion[]> {
    const prompt = `
Generate ${count} professional interview questions for a ${position} position at ${company}.

Requirements:
- Question types: ${questionTypes.join(', ')}
- Difficulty level: ${difficulty}
- Include a mix of technical and behavioral questions
- Each question should be realistic and relevant to the role
- Provide brief follow-up questions for each main question

Format your response as a JSON array with the following structure:
{
  "questions": [
    {
      "type": "technical|behavioral|system-design|coding|general",
      "question": "Main interview question",
      "followUp": ["Follow-up question 1", "Follow-up question 2"],
      "difficulty": "easy|medium|hard",
      "category": "specific skill or topic",
      "expectedDuration": 5
    }
  ]
}

Focus on real-world scenarios and practical problem-solving skills.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
      
      return parsed.questions.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        ...q
      }))
    } catch (error) {
      console.error('Error generating questions:', error)
      // Fallback questions
      return this.getFallbackQuestions(position, questionTypes[0], count)
    }
  }

  /**
   * Analyze interview response and provide feedback
   */
  async analyzeResponse(
    question: InterviewQuestion,
    userResponse: string,
    context?: { position: string; company: string }
  ): Promise<InterviewResponse> {
    
    // For hackathon: If AI fails, use smart fallback analysis
    const fallbackAnalysis = this.generateFallbackAnalysis(question, userResponse, context)
    
    // Try AI first, but fall back gracefully
    try {
    const prompt = `
You are an expert technical interviewer. Analyze this interview response:

Question: "${question.question}"
Category: ${question.category}
Type: ${question.type}
Difficulty: ${question.difficulty}

Candidate's Response: "${userResponse}"

${context ? `Context: ${context.position} position at ${context.company}` : ''}

Please provide a comprehensive analysis in the following JSON format:
{
  "score": 7,
  "feedback": "Detailed constructive feedback about the response",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Area for improvement 1", "Area for improvement 2"],
  "nextQuestionSuggestion": "technical|behavioral|system-design|coding|general"
}

Scoring criteria (1-10):
- 1-3: Poor response, major gaps
- 4-5: Below average, some understanding
- 6-7: Average, meets basic requirements
- 8-9: Good response, shows expertise
- 10: Exceptional, demonstrates mastery

Be constructive, specific, and encouraging in your feedback.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
      
      return {
        questionId: question.id,
        question: question.question,
        userResponse,
        ...parsed
      }
    } catch (error) {
      console.error('Error analyzing response:', error)
      
      // Provide more helpful fallback analysis based on response length and content
      const responseLength = userResponse.trim().length
      let score = 5
      let feedback = "AI analysis temporarily unavailable. Based on response characteristics: "
      let strengths = ["Response provided"]
      let improvements = ["AI analysis not available"]
      
      if (responseLength < 20) {
        score = 3
        feedback += "Response appears brief - consider providing more detailed explanations and examples."
        improvements = ["Provide more detailed responses", "Include specific examples", "Explain your reasoning"]
      } else if (responseLength < 100) {
        score = 6
        feedback += "Good response length - shows understanding of the question."
        strengths = ["Appropriate response length", "Addresses the question"]
        improvements = ["Consider adding more technical details", "Include real-world examples"]
      } else {
        score = 7
        feedback += "Comprehensive response showing good understanding."
        strengths = ["Detailed response", "Good communication", "Thorough explanation"]
        improvements = ["Continue providing detailed responses", "Keep demonstrating expertise"]
      }
      
      return {
        questionId: question.id,
        question: question.question,
        userResponse,
        score,
        feedback,
        strengths,
        improvements,
        nextQuestionSuggestion: 'technical' as QuestionType
      }
    }
  }

  /**
   * Generate overall interview feedback
   */
  async generateOverallFeedback(session: InterviewSession): Promise<string> {
    const prompt = `
Generate comprehensive interview feedback for a candidate:

Position: ${session.position}
Company: ${session.company}
Overall Score: ${session.overallScore}/10

Questions and Responses:
${session.responses.map((r, i) => `
Q${i + 1}: ${session.questions[i]?.question}
Response Score: ${r.score}/10
Candidate Answer: ${r.userResponse}
`).join('\n')}

Please provide:
1. Overall performance summary
2. Key strengths demonstrated
3. Areas for improvement
4. Specific recommendations for growth
5. Next steps or additional preparation areas

Make the feedback constructive, professional, and actionable.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating overall feedback:', error)
      return "Interview completed. Please review individual question feedback for detailed insights."
    }
  }

  /**
   * Suggest next question based on previous responses
   */
  async suggestNextQuestion(
    responses: InterviewResponse[],
    position: string,
    remainingTypes: QuestionType[]
  ): Promise<QuestionType> {
    if (remainingTypes.length === 0) {
      return 'general'
    }

    const avgScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length
    
    // Adaptive questioning based on performance
    if (avgScore >= 8) {
      // High performer - challenge with harder questions
      return remainingTypes.includes('system-design') ? 'system-design' : 
             remainingTypes.includes('coding') ? 'coding' : remainingTypes[0]
    } else if (avgScore >= 6) {
      // Average performer - mix of technical and behavioral
      return remainingTypes.includes('technical') ? 'technical' : 
             remainingTypes.includes('behavioral') ? 'behavioral' : remainingTypes[0]
    } else {
      // Lower performer - focus on behavioral and general questions
      return remainingTypes.includes('behavioral') ? 'behavioral' : 
             remainingTypes.includes('general') ? 'general' : remainingTypes[0]
    }
  }

  /**
   * Fallback questions when API fails
   */
  private getFallbackQuestions(position: string, type: QuestionType, count: number): InterviewQuestion[] {
    const fallbacks: Record<QuestionType, InterviewQuestion[]> = {
      technical: [
        {
          id: 'fallback_tech_1',
          type: 'technical',
          question: 'Describe your experience with the main technologies required for this role.',
          followUp: ['Which technology do you find most challenging?', 'How do you stay updated with new technologies?'],
          difficulty: 'medium',
          category: 'Technical Skills',
          expectedDuration: 5
        },
        {
          id: 'fallback_tech_2',
          type: 'technical',
          question: 'How do you approach debugging a complex technical issue in your code?',
          followUp: ['What tools do you use for debugging?', 'How do you prevent similar issues?'],
          difficulty: 'medium',
          category: 'Problem Solving',
          expectedDuration: 5
        },
        {
          id: 'fallback_tech_3',
          type: 'technical',
          question: 'Explain a recent technical project you worked on and the challenges you faced.',
          followUp: ['What technologies did you use?', 'How did you ensure code quality?'],
          difficulty: 'medium',
          category: 'Project Experience',
          expectedDuration: 5
        }
      ],
      behavioral: [
        {
          id: 'fallback_beh_1',
          type: 'behavioral',
          question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
          followUp: ['What would you do differently?', 'How did you communicate with stakeholders?'],
          difficulty: 'medium',
          category: 'Problem Solving',
          expectedDuration: 5
        },
        {
          id: 'fallback_beh_2',
          type: 'behavioral',
          question: 'Describe a time when you had to work with a difficult team member. How did you handle it?',
          followUp: ['What was the outcome?', 'What did you learn from this experience?'],
          difficulty: 'medium',
          category: 'Teamwork',
          expectedDuration: 5
        },
        {
          id: 'fallback_beh_3',
          type: 'behavioral',
          question: 'Tell me about a time when you had to learn something new quickly for a project.',
          followUp: ['What resources did you use?', 'How do you typically approach learning?'],
          difficulty: 'medium',
          category: 'Learning & Adaptability',
          expectedDuration: 5
        }
      ],
      'system-design': [
        {
          id: 'fallback_sys_1',
          type: 'system-design',
          question: 'How would you design a scalable web application for this type of business?',
          followUp: ['What about database design?', 'How would you handle high traffic?'],
          difficulty: 'medium',
          category: 'System Architecture',
          expectedDuration: 10
        },
        {
          id: 'fallback_sys_2',
          type: 'system-design',
          question: 'Design a caching strategy for a high-traffic web application.',
          followUp: ['What caching layers would you implement?', 'How would you handle cache invalidation?'],
          difficulty: 'medium',
          category: 'Performance Optimization',
          expectedDuration: 10
        },
        {
          id: 'fallback_sys_3',
          type: 'system-design',
          question: 'How would you ensure data consistency in a distributed system?',
          followUp: ['What about eventual consistency?', 'How would you handle failures?'],
          difficulty: 'hard',
          category: 'Distributed Systems',
          expectedDuration: 10
        }
      ],
      coding: [
        {
          id: 'fallback_code_1',
          type: 'coding',
          question: 'Write a function to solve a common problem in your preferred programming language.',
          followUp: ['How would you test this function?', 'What about edge cases?'],
          difficulty: 'medium',
          category: 'Programming',
          expectedDuration: 15
        },
        {
          id: 'fallback_code_2',
          type: 'coding',
          question: 'Implement a simple algorithm to find the maximum element in an array.',
          followUp: ['What is the time complexity?', 'How would you optimize it?'],
          difficulty: 'easy',
          category: 'Algorithms',
          expectedDuration: 10
        },
        {
          id: 'fallback_code_3',
          type: 'coding',
          question: 'Write a function to reverse a string without using built-in methods.',
          followUp: ['How would you handle Unicode characters?', 'What about memory efficiency?'],
          difficulty: 'medium',
          category: 'String Manipulation',
          expectedDuration: 15
        }
      ],
      general: [
        {
          id: 'fallback_gen_1',
          type: 'general',
          question: 'Why are you interested in this position and our company?',
          followUp: ['What are your career goals?', 'How do you handle feedback?'],
          difficulty: 'easy',
          category: 'Motivation',
          expectedDuration: 3
        },
        {
          id: 'fallback_gen_2',
          type: 'general',
          question: 'What are your biggest strengths and how do they apply to this role?',
          followUp: ['Can you give an example?', 'What about areas for improvement?'],
          difficulty: 'easy',
          category: 'Self Assessment',
          expectedDuration: 4
        },
        {
          id: 'fallback_gen_3',
          type: 'general',
          question: 'Where do you see yourself in 5 years and how does this position fit into that vision?',
          followUp: ['What skills do you want to develop?', 'What type of projects interest you most?'],
          difficulty: 'easy',
          category: 'Career Goals',
          expectedDuration: 4
        }
      ]
    }

    // Return questions, mixing types if needed to reach the count
    let questions: InterviewQuestion[] = []
    
    // First, get questions of the requested type
    if (fallbacks[type]) {
      questions.push(...fallbacks[type].slice(0, count))
    }
    
    // If we still need more questions, mix from other types
    if (questions.length < count) {
      const allTypes: QuestionType[] = ['technical', 'behavioral', 'general']
      for (const otherType of allTypes) {
        if (otherType !== type && questions.length < count) {
          const remainingNeeded = count - questions.length
          questions.push(...fallbacks[otherType].slice(0, remainingNeeded))
        }
      }
    }
    
    return questions.slice(0, count)
  }
}

export const geminiService = new GeminiInterviewService()
export default geminiService