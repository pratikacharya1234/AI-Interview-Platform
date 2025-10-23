import { createClient } from './client'
import { createClient as createServerClient } from './server'
import { cookies } from 'next/headers'

// Types for database tables
export interface Profile {
  id: string // UUID from auth.users
  email: string
  name?: string
  full_name?: string
  username?: string
  avatar_url?: string
  bio?: string
  experience_level?: string
  target_role?: string
  tech_stack?: string[]
  total_interviews?: number
  completed_interviews?: number
  average_score?: number
  total_xp?: number
  level?: number
  streak_days?: number
  last_activity_date?: string
  onboarding_completed?: boolean
  preferences?: any
  created_at: string
  updated_at: string
}

export interface InterviewSession {
  id: string // UUID
  user_id: string // UUID from auth.users
  interview_type: 'behavioral' | 'technical' | 'video' | 'text' | 'voice' | 'conversational'
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  duration_minutes?: number
  ai_accuracy_score?: number
  communication_score?: number
  technical_score?: number
  overall_score?: number
  feedback?: any
  feedback_id?: string
  metadata?: any
  questions?: any
  answers?: any
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface UserScore {
  id: string
  user_id: string
  ai_accuracy_score: number
  communication_score: number
  completion_rate: number
  performance_score: number
  total_interviews: number
  successful_interviews: number
  last_activity_timestamp: string
  country_code?: string
}

export interface UserStreak {
  id: string
  user_id: string
  last_active_date: string
  streak_count: number
  longest_streak: number
  total_sessions: number
  streak_frozen: boolean
  freeze_used_date?: string
}

// Database service class
export class DatabaseService {
  private client: any
  
  constructor(isServer: boolean = false) {
    if (isServer) {
      // Server-side client will be created with cookies
      this.client = null
    } else {
      // Browser client
      this.client = createClient()
    }
  }
  
  // Initialize server client with cookies
  async initServerClient() {
    const cookieStore = await cookies()
    this.client = await createServerClient(cookieStore)
  }
  
  // Get or create user profile
  async getOrCreateProfile(userId: string, email?: string) {
    try {
      // First try to get existing profile
      const { data: profile, error: fetchError } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profile) return { data: profile, error: null }
      
      // If no profile exists, create one
      if (fetchError?.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await this.client
          .from('profiles')
          .insert({
            id: userId,
            email: email || 'user@example.com'
          })
          .select()
          .single()
        
        return { data: newProfile, error: createError }
      }
      
      return { data: null, error: fetchError }
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error)
      return { data: null, error }
    }
  }
  
  // Create interview session
  async createInterviewSession(sessionData: Partial<InterviewSession>) {
    try {
      const { data, error } = await this.client
        .from('interview_sessions')
        .insert(sessionData)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error creating interview session:', error)
      return { data: null, error }
    }
  }
  
  // Update interview session
  async updateInterviewSession(sessionId: string, updates: Partial<InterviewSession>) {
    try {
      const { data, error } = await this.client
        .from('interview_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error updating interview session:', error)
      return { data: null, error }
    }
  }
  
  // Get user's interview sessions
  async getUserSessions(userId: string, limit: number = 10) {
    try {
      const { data, error } = await this.client
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      return { data: null, error }
    }
  }
  
  // Get user scores
  async getUserScores(userId: string) {
    try {
      const { data, error } = await this.client
        .from('user_scores')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching user scores:', error)
      return { data: null, error }
    }
  }
  
  // Update user scores
  async updateUserScores(userId: string, scores: Partial<UserScore>) {
    try {
      const { data, error } = await this.client
        .from('user_scores')
        .upsert({
          user_id: userId,
          ...scores,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error updating user scores:', error)
      return { data: null, error }
    }
  }
  
  // Get user streak
  async getUserStreak(userId: string) {
    try {
      const { data, error } = await this.client
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching user streak:', error)
      return { data: null, error }
    }
  }
  
  // Log session for streak tracking
  async logSession(userId: string, sessionData: any) {
    try {
      const { data, error } = await this.client
        .from('session_logs')
        .upsert({
          user_id: userId,
          session_date: new Date().toISOString().split('T')[0],
          ...sessionData
        })
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error logging session:', error)
      return { data: null, error }
    }
  }
  
  // Get leaderboard
  async getLeaderboard(limit: number = 20, offset: number = 0) {
    try {
      const { data, error } = await this.client
        .from('leaderboard_cache')
        .select(`
          *,
          profiles!inner(
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('cache_date', new Date().toISOString().split('T')[0])
        .order('global_rank', { ascending: true })
        .range(offset, offset + limit - 1)
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return { data: null, error }
    }
  }
  
  // Get questions by category
  async getQuestions(category?: string, difficulty?: string) {
    try {
      let query = this.client
        .from('questions')
        .select('*')
        .eq('is_active', true)
      
      if (category) {
        query = query.eq('category', category)
      }
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }
      
      const { data, error } = await query.limit(10)
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching questions:', error)
      return { data: null, error }
    }
  }
  
  // Save practice history
  async savePracticeHistory(practiceData: any) {
    try {
      const { data, error } = await this.client
        .from('practice_history')
        .insert(practiceData)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error saving practice history:', error)
      return { data: null, error }
    }
  }
  
  // Get user's practice history
  async getUserPracticeHistory(userId: string, limit: number = 20) {
    try {
      const { data, error } = await this.client
        .from('practice_history')
        .select(`
          *,
          questions(
            question_text,
            category,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching practice history:', error)
      return { data: null, error }
    }
  }
  
  // Get user subscription
  async getUserSubscription(userId: string) {
    try {
      const { data, error } = await this.client
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      return { data, error }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return { data: null, error }
    }
  }
  
  // Check if tables exist (for initialization)
  async checkTablesExist() {
    try {
      const { data, error } = await this.client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['profiles', 'interview_sessions', 'user_scores', 'user_streaks'])
      
      if (error) {
        console.error('Error checking tables:', error)
        return false
      }
      
      const tableNames = data?.map((t: any) => t.table_name) || []
      const requiredTables = ['profiles', 'interview_sessions', 'user_scores', 'user_streaks']
      
      return requiredTables.every(table => tableNames.includes(table))
    } catch (error) {
      console.error('Error in checkTablesExist:', error)
      return false
    }
  }
}

// Export singleton instances
export const clientDb = new DatabaseService(false)
export const serverDb = new DatabaseService(true)
