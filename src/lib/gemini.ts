import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
}

class GeminiInterviewService {
  private model: any

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
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
      return {
        questionId: question.id,
        question: question.question,
        userResponse,
        score: 5,
        feedback: "Unable to analyze response at this time. Please try again.",
        strengths: ["Response provided"],
        improvements: ["Could not analyze - please ensure your response is clear and detailed"],
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
        }
      ]
    }

    return fallbacks[type]?.slice(0, count) || fallbacks.general.slice(0, count)
  }
}

export const geminiService = new GeminiInterviewService()
export default geminiService