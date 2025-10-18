/**
 * Question Generator Service
 * Uses Gemini AI to generate interview questions for the question bank
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export interface QuestionGenerationParams {
  category: string
  subcategory?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  questionType: 'multiple_choice' | 'open_ended' | 'coding' | 'system_design' | 'behavioral'
  count: number
  experienceLevel?: string
  specificTopic?: string
  customPrompt?: string
  temperature?: number
}

export interface GeneratedQuestion {
  question_text: string
  question_type: string
  category_id?: string
  subcategory?: string
  difficulty_level: string
  experience_level?: string
  estimated_time_minutes: number
  sample_answer: string
  answer_guidelines: string
  evaluation_criteria: any
  key_points: string[]
  common_mistakes: string[]
  hints: string[]
  follow_up_questions: string[]
  related_topics: string[]
  resources?: any
  code_snippet?: string
  code_language?: string
  tags: string[]
  keywords: string[]
}

export class QuestionGeneratorService {
  private model: any

  constructor() {
    if (genAI) {
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    }
  }

  /**
   * Generate interview questions using Gemini
   */
  async generateQuestions(params: QuestionGenerationParams): Promise<GeneratedQuestion[]> {
    if (!this.model) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = this.buildPrompt(params)
    
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the JSON response
      const questions = this.parseGeneratedQuestions(text, params)
      
      // Save to database
      await this.saveQuestions(questions)
      
      return questions
    } catch (error) {
      console.error('Error generating questions:', error)
      throw new Error('Failed to generate questions')
    }
  }

  /**
   * Build the prompt for Gemini
   */
  private buildPrompt(params: QuestionGenerationParams): string {
    const basePrompt = `Generate ${params.count} interview questions for the following criteria:

Category: ${params.category}
${params.subcategory ? `Subcategory: ${params.subcategory}` : ''}
Difficulty Level: ${params.difficulty}
Question Type: ${params.questionType}
${params.experienceLevel ? `Experience Level: ${params.experienceLevel}` : ''}
${params.specificTopic ? `Specific Topic: ${params.specificTopic}` : ''}

For each question, provide a comprehensive JSON response with the following structure:
{
  "questions": [
    {
      "question_text": "The actual question text",
      "sample_answer": "A detailed sample answer",
      "answer_guidelines": "Guidelines for evaluating the answer",
      "evaluation_criteria": {
        "technical_accuracy": "What to look for",
        "clarity": "Communication expectations",
        "completeness": "Coverage requirements",
        "best_practices": "Industry standards to follow"
      },
      "key_points": ["Key point 1", "Key point 2", "Key point 3"],
      "common_mistakes": ["Common mistake 1", "Common mistake 2"],
      "hints": ["Hint 1", "Hint 2"],
      "follow_up_questions": ["Follow-up 1", "Follow-up 2"],
      "related_topics": ["Topic 1", "Topic 2"],
      "estimated_time_minutes": 5,
      "tags": ["tag1", "tag2", "tag3"],
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}

${this.getTypeSpecificInstructions(params.questionType)}

${params.customPrompt ? `Additional Instructions: ${params.customPrompt}` : ''}

Ensure the questions are:
1. Relevant to real-world scenarios
2. Appropriately challenging for the ${params.difficulty} level
3. Clear and unambiguous
4. Valuable for interview preparation
5. Diverse in topics covered

Return ONLY valid JSON, no additional text or markdown.`

    return basePrompt
  }

  /**
   * Get type-specific instructions
   */
  private getTypeSpecificInstructions(type: string): string {
    switch (type) {
      case 'coding':
        return `For coding questions:
- Include a code snippet if relevant
- Specify the programming language
- Include test cases in the sample answer
- Focus on algorithmic thinking and optimization`

      case 'system_design':
        return `For system design questions:
- Focus on scalability, reliability, and performance
- Include architectural diagrams description
- Cover trade-offs and design decisions
- Mention relevant technologies and patterns`

      case 'behavioral':
        return `For behavioral questions:
- Use the STAR method in sample answers
- Focus on soft skills and leadership
- Include situational scenarios
- Emphasize problem-solving and teamwork`

      case 'multiple_choice':
        return `For multiple choice questions:
- Include 4 options in the evaluation_criteria.options field
- Mark the correct answer in evaluation_criteria.correct_answer
- Ensure distractors are plausible but clearly wrong
- Explain why each option is correct or incorrect`

      default:
        return ''
    }
  }

  /**
   * Parse generated questions from Gemini response
   */
  private parseGeneratedQuestions(text: string, params: QuestionGenerationParams): GeneratedQuestion[] {
    try {
      // Clean the response text
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleanedText)
      
      const questions = parsed.questions || [parsed]
      
      return questions.map((q: any) => ({
        question_text: q.question_text,
        question_type: params.questionType,
        difficulty_level: params.difficulty,
        experience_level: params.experienceLevel,
        estimated_time_minutes: q.estimated_time_minutes || 5,
        sample_answer: q.sample_answer,
        answer_guidelines: q.answer_guidelines,
        evaluation_criteria: q.evaluation_criteria,
        key_points: q.key_points || [],
        common_mistakes: q.common_mistakes || [],
        hints: q.hints || [],
        follow_up_questions: q.follow_up_questions || [],
        related_topics: q.related_topics || [],
        resources: q.resources,
        code_snippet: q.code_snippet,
        code_language: q.code_language,
        tags: q.tags || [],
        keywords: q.keywords || [],
        subcategory: params.subcategory,
        generated_by: 'gemini',
        generation_model: 'gemini-pro',
        generation_temperature: params.temperature || 0.7
      }))
    } catch (error) {
      console.error('Error parsing generated questions:', error)
      throw new Error('Failed to parse generated questions')
    }
  }

  /**
   * Save questions to database
   */
  private async saveQuestions(questions: GeneratedQuestion[]): Promise<void> {
    try {
      // Get category ID
      const categoryId = await this.getCategoryId(questions[0].subcategory || 'technical')
      
      const questionsToInsert = questions.map(q => ({
        ...q,
        category_id: categoryId,
        is_active: true,
        is_reviewed: false
      }))

      const { error } = await supabase
        .from('question_bank')
        .insert(questionsToInsert)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error saving questions:', error)
      throw new Error('Failed to save questions to database')
    }
  }

  /**
   * Get category ID by slug or name
   */
  private async getCategoryId(categoryName: string): Promise<string | null> {
    const { data } = await supabase
      .from('question_categories')
      .select('id')
      .or(`name.ilike.%${categoryName}%,slug.eq.${categoryName.toLowerCase().replace(/\s+/g, '-')}`)
      .single()

    return data?.id || null
  }

  /**
   * Generate questions for specific topics
   */
  async generateTopicQuestions(topic: string, count: number = 5): Promise<GeneratedQuestion[]> {
    const prompt = `Generate ${count} interview questions about ${topic}.

For each question, provide:
1. A clear, specific question
2. A comprehensive sample answer
3. Key points to cover
4. Common mistakes to avoid
5. Follow-up questions

Focus on practical, real-world scenarios that test understanding and experience.

Return the response in this JSON format:
{
  "questions": [
    {
      "question_text": "...",
      "sample_answer": "...",
      "key_points": [...],
      "common_mistakes": [...],
      "follow_up_questions": [...],
      "difficulty_level": "medium",
      "estimated_time_minutes": 5,
      "tags": [...],
      "keywords": [...]
    }
  ]
}

Return ONLY valid JSON.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseGeneratedQuestions(text, {
        category: 'technical',
        difficulty: 'medium',
        questionType: 'open_ended',
        count
      })
    } catch (error) {
      console.error('Error generating topic questions:', error)
      throw new Error('Failed to generate topic questions')
    }
  }

  /**
   * Generate behavioral questions based on competencies
   */
  async generateBehavioralQuestions(competencies: string[], count: number = 5): Promise<GeneratedQuestion[]> {
    const prompt = `Generate ${count} behavioral interview questions focusing on these competencies: ${competencies.join(', ')}.

Use the STAR method (Situation, Task, Action, Result) in sample answers.

For each question:
1. Create a "Tell me about a time..." scenario
2. Provide a detailed STAR-format sample answer
3. Include evaluation criteria for each STAR component
4. List key behaviors to look for

Return in JSON format:
{
  "questions": [
    {
      "question_text": "...",
      "sample_answer": "Situation: ... Task: ... Action: ... Result: ...",
      "evaluation_criteria": {
        "situation": "...",
        "task": "...",
        "action": "...",
        "result": "..."
      },
      "key_points": [...],
      "follow_up_questions": [...],
      "tags": [...],
      "difficulty_level": "medium",
      "question_type": "behavioral"
    }
  ]
}

Return ONLY valid JSON.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseGeneratedQuestions(text, {
        category: 'behavioral',
        difficulty: 'medium',
        questionType: 'behavioral',
        count
      })
    } catch (error) {
      console.error('Error generating behavioral questions:', error)
      throw new Error('Failed to generate behavioral questions')
    }
  }

  /**
   * Generate coding challenge questions
   */
  async generateCodingQuestions(
    language: string,
    topics: string[],
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 3
  ): Promise<GeneratedQuestion[]> {
    const prompt = `Generate ${count} coding interview questions for ${language} covering these topics: ${topics.join(', ')}.

Difficulty: ${difficulty}

For each question provide:
1. Clear problem statement
2. Input/output examples
3. Constraints
4. Complete solution code in ${language}
5. Time and space complexity analysis
6. Alternative approaches
7. Test cases

Return in JSON format:
{
  "questions": [
    {
      "question_text": "Problem statement...",
      "code_snippet": "// Solution code...",
      "code_language": "${language}",
      "sample_answer": "Detailed explanation...",
      "evaluation_criteria": {
        "correctness": "...",
        "efficiency": "Time: O(...), Space: O(...)",
        "code_quality": "...",
        "edge_cases": "..."
      },
      "hints": [...],
      "test_cases": [...],
      "difficulty_level": "${difficulty}",
      "estimated_time_minutes": 20,
      "tags": [...],
      "question_type": "coding"
    }
  ]
}

Return ONLY valid JSON.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseGeneratedQuestions(text, {
        category: 'technical',
        difficulty,
        questionType: 'coding',
        count
      })
    } catch (error) {
      console.error('Error generating coding questions:', error)
      throw new Error('Failed to generate coding questions')
    }
  }
}

export const questionGenerator = new QuestionGeneratorService()
