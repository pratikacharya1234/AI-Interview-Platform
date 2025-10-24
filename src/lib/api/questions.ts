import { createClient } from '@/lib/supabase/client'

export interface Question {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  type: 'multiple_choice' | 'coding' | 'text'
  points: number
  timeLimit?: number
  testCases?: TestCase[]
  hints?: string[]
  solution?: string
  tags: string[]
  successRate?: number
  attemptCount?: number
  userStatus?: 'not_attempted' | 'attempted' | 'solved'
  userScore?: number
  createdAt: string
}

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
  points: number
}

export interface QuestionAttempt {
  id: string
  questionId: string
  userId: string
  answer: string
  code?: string
  language?: string
  score: number
  isPassed: boolean
  timeSpent: number
  createdAt: string
  testResults?: TestResult[]
}

export interface TestResult {
  testCaseId: string
  passed: boolean
  actualOutput: string
  executionTime: number
  memoryUsed: number
}

export interface QuestionFilters {
  difficulty?: ('easy' | 'medium' | 'hard')[]
  topic?: string[]
  type?: ('multiple_choice' | 'coding' | 'text')[]
  status?: ('not_attempted' | 'attempted' | 'solved')[]
  search?: string
  tags?: string[]
}

export interface QuestionSort {
  field: 'difficulty' | 'successRate' | 'attemptCount' | 'createdAt' | 'title'
  order: 'asc' | 'desc'
}

export class QuestionService {
  private supabase = createClient()

  async getQuestions(
    filters: QuestionFilters = {},
    sort: QuestionSort = { field: 'createdAt', order: 'desc' },
    page: number = 1,
    pageSize: number = 20,
    userId?: string
  ): Promise<{ questions: Question[]; total: number; hasMore: boolean }> {
    try {
      let query = this.supabase
        .from('question_bank')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.difficulty && filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty)
      }

      if (filters.topic && filters.topic.length > 0) {
        query = query.in('topic', filters.topic)
      }

      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      // Apply sorting
      const sortField = sort.field === 'successRate' ? 'success_rate' :
                       sort.field === 'attemptCount' ? 'attempt_count' :
                       sort.field === 'createdAt' ? 'created_at' : sort.field
      query = query.order(sortField, { ascending: sort.order === 'asc' })

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data: questions, error, count } = await query

      if (error) throw error

      // Get user attempts if userId provided
      let userAttempts: any[] = []
      if (userId && questions) {
        const { data: attempts } = await this.supabase
          .from('user_question_attempts')
          .select('question_id, score, is_correct, created_at')
          .eq('user_id', userId)
          .in('question_id', questions.map(q => q.id))

        userAttempts = attempts || []
      }

      const enrichedQuestions: Question[] = (questions || []).map(q => {
        const userAttempt = userAttempts.find(a => a.question_id === q.id)
        return {
          id: q.id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          topic: q.topic,
          type: q.type,
          points: q.points,
          timeLimit: q.time_limit,
          tags: q.tags || [],
          successRate: q.success_rate,
          attemptCount: q.attempt_count,
          userStatus: userAttempt
            ? (userAttempt.is_correct ? 'solved' : 'attempted')
            : 'not_attempted',
          userScore: userAttempt?.score,
          createdAt: q.created_at
        }
      })

      return {
        questions: enrichedQuestions,
        total: count || 0,
        hasMore: (count || 0) > page * pageSize
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      throw error
    }
  }

  async getQuestionById(questionId: string, userId?: string): Promise<Question | null> {
    try {
      const { data: question, error } = await this.supabase
        .from('question_bank')
        .select('*')
        .eq('id', questionId)
        .single()

      if (error) throw error
      if (!question) return null

      // Get test cases
      const { data: testCases } = await this.supabase
        .from('question_test_cases')
        .select('*')
        .eq('question_id', questionId)

      // Get hints
      const { data: hints } = await this.supabase
        .from('question_hints')
        .select('*')
        .eq('question_id', questionId)
        .order('order_index')

      // Get user attempts if userId provided
      let userAttempt = null
      if (userId) {
        const { data: attempts } = await this.supabase
          .from('user_question_attempts')
          .select('*')
          .eq('user_id', userId)
          .eq('question_id', questionId)
          .order('created_at', { ascending: false })
          .limit(1)

        userAttempt = attempts?.[0]
      }

      return {
        id: question.id,
        title: question.title,
        description: question.description,
        difficulty: question.difficulty,
        topic: question.topic,
        type: question.type,
        points: question.points,
        timeLimit: question.time_limit,
        testCases: testCases?.map(tc => ({
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expected_output,
          isHidden: tc.is_hidden,
          points: tc.points
        })),
        hints: hints?.map(h => h.hint_text),
        solution: question.solution,
        tags: question.tags || [],
        successRate: question.success_rate,
        attemptCount: question.attempt_count,
        userStatus: userAttempt
          ? (userAttempt.is_correct ? 'solved' : 'attempted')
          : 'not_attempted',
        userScore: userAttempt?.score,
        createdAt: question.created_at
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      throw error
    }
  }

  async submitAnswer(
    questionId: string,
    userId: string,
    answer: string,
    code?: string,
    language?: string,
    timeSpent?: number
  ): Promise<QuestionAttempt> {
    try {
      const question = await this.getQuestionById(questionId)
      if (!question) throw new Error('Question not found')

      let score = 0
      let isPassed = false
      let testResults: TestResult[] = []

      if (question.type === 'multiple_choice') {
        // Simple answer comparison for multiple choice
        isPassed = answer.toLowerCase().trim() === (question.solution || '').toLowerCase().trim()
        score = isPassed ? question.points : 0
      } else if (question.type === 'coding' && code && language) {
        // Execute code against test cases
        const executionResult = await this.executeCode(questionId, code, language)
        testResults = executionResult.testResults
        isPassed = executionResult.allPassed
        score = executionResult.score
      } else {
        // Text answer - would need manual grading or AI grading
        score = 0
        isPassed = false
      }

      // Save attempt
      const { data: attempt, error } = await this.supabase
        .from('user_question_attempts')
        .insert({
          question_id: questionId,
          user_id: userId,
          answer,
          code,
          language,
          score,
          is_correct: isPassed,
          time_spent: timeSpent || 0,
          test_results: testResults
        })
        .select()
        .single()

      if (error) throw error

      // Update question statistics
      await this.updateQuestionStats(questionId, isPassed)

      return {
        id: attempt.id,
        questionId: attempt.question_id,
        userId: attempt.user_id,
        answer: attempt.answer,
        code: attempt.code,
        language: attempt.language,
        score: attempt.score,
        isPassed: attempt.is_correct,
        timeSpent: attempt.time_spent,
        createdAt: attempt.created_at,
        testResults
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      throw error
    }
  }

  private async executeCode(
    questionId: string,
    code: string,
    language: string
  ): Promise<{ testResults: TestResult[]; allPassed: boolean; score: number }> {
    try {
      // Get test cases
      const { data: testCases } = await this.supabase
        .from('question_test_cases')
        .select('*')
        .eq('question_id', questionId)

      if (!testCases || testCases.length === 0) {
        return { testResults: [], allPassed: false, score: 0 }
      }

      // Call code execution API
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: testCases.map(tc => ({
            id: tc.id,
            input: tc.input,
            expectedOutput: tc.expected_output,
            points: tc.points
          }))
        })
      })

      if (!response.ok) throw new Error('Code execution failed')

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error executing code:', error)
      return { testResults: [], allPassed: false, score: 0 }
    }
  }

  private async updateQuestionStats(questionId: string, isPassed: boolean): Promise<void> {
    try {
      const { data: question } = await this.supabase
        .from('question_bank')
        .select('attempt_count, success_count')
        .eq('id', questionId)
        .single()

      if (!question) return

      const newAttemptCount = (question.attempt_count || 0) + 1
      const newSuccessCount = (question.success_count || 0) + (isPassed ? 1 : 0)
      const newSuccessRate = (newSuccessCount / newAttemptCount) * 100

      await this.supabase
        .from('question_bank')
        .update({
          attempt_count: newAttemptCount,
          success_count: newSuccessCount,
          success_rate: newSuccessRate
        })
        .eq('id', questionId)
    } catch (error) {
      console.error('Error updating question stats:', error)
    }
  }

  async getTopics(): Promise<string[]> {
    try {
      const { data } = await this.supabase
        .from('question_bank')
        .select('topic')

      const topics = [...new Set(data?.map(d => d.topic).filter(Boolean))]
      return topics.sort()
    } catch (error) {
      console.error('Error fetching topics:', error)
      return []
    }
  }

  async getTags(): Promise<string[]> {
    try {
      const { data } = await this.supabase
        .from('question_bank')
        .select('tags')

      const allTags = data?.flatMap(d => d.tags || []) || []
      const uniqueTags = [...new Set(allTags)]
      return uniqueTags.sort()
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    }
  }

  async getUserAttempts(
    userId: string,
    questionId?: string
  ): Promise<QuestionAttempt[]> {
    try {
      let query = this.supabase
        .from('user_question_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (questionId) {
        query = query.eq('question_id', questionId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(attempt => ({
        id: attempt.id,
        questionId: attempt.question_id,
        userId: attempt.user_id,
        answer: attempt.answer,
        code: attempt.code,
        language: attempt.language,
        score: attempt.score,
        isPassed: attempt.is_correct,
        timeSpent: attempt.time_spent,
        createdAt: attempt.created_at,
        testResults: attempt.test_results
      }))
    } catch (error) {
      console.error('Error fetching user attempts:', error)
      return []
    }
  }
}

export const questionService = new QuestionService()
