/**
 * AI Features Service
 * Handles all database operations for AI features (Coach, Voice, Feedback, Prep)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// TYPES
// ============================================================================

export interface CoachingSession {
  id: string
  user_email: string
  topic: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  completed_steps: number
  total_steps: number
  status: 'not-started' | 'in-progress' | 'completed'
  ai_insights: string[]
  recommended_actions: string[]
  last_activity: string | null
  created_at: string
}

export interface CoachingMessage {
  id: string
  session_id: string
  role: 'user' | 'ai'
  content: string
  message_type: 'text' | 'suggestion' | 'feedback'
  timestamp: string
}

export interface VoiceAnalysisSession {
  id: string
  user_email: string
  session_name: string
  duration: number
  overall_score: number
  recording_url?: string
  created_at: string
}

export interface VoiceMetrics {
  confidence: number
  clarity: number
  pace: number
  volume: number
  filler_words: number
  pause_frequency: number
  tonal_variation: number
  articulation: number
}

export interface VoiceAnalysis extends VoiceAnalysisSession {
  metrics: VoiceMetrics
  insights: string[]
  recommendations: string[]
}

export interface FeedbackSession {
  id: string
  user_email: string
  session_name: string
  interview_date: string
  duration: number
  overall_score: number
  categories: {
    technical: number
    communication: number
    problem_solving: number
    cultural: number
  }
  ai_insights: string[]
  improvements: string[]
  strengths: string[]
  next_steps: string[]
}

export interface PrepPlan {
  id: string
  user_email: string
  title: string
  target_role: string
  target_company: string
  interview_date: string
  days_remaining: number
  overall_progress: number
  status: 'active' | 'completed' | 'archived'
  categories: {
    technical: { progress: number; tasks: number; completed: number }
    behavioral: { progress: number; tasks: number; completed: number }
    system_design: { progress: number; tasks: number; completed: number }
    company_specific: { progress: number; tasks: number; completed: number }
  }
  daily_goals: string[]
  weak_areas: string[]
  strengths: string[]
  ai_recommendations: string[]
}

export interface StudySession {
  id: string
  plan_id: string
  title: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimated_time: number
  completed: boolean
  priority: 'High' | 'Medium' | 'Low'
  description: string
  completed_at?: string
}

// ============================================================================
// AI COACHING SERVICE
// ============================================================================

export const coachingService = {
  /**
   * Get all coaching sessions for a user
   */
  async getSessions(userEmail: string): Promise<CoachingSession[]> {
    const { data, error } = await supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch coaching sessions: ${error.message}`)
    return data || []
  },

  /**
   * Get a specific coaching session with messages
   */
  async getSession(sessionId: string): Promise<CoachingSession & { messages: CoachingMessage[] }> {
    const { data: session, error: sessionError } = await supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw new Error(`Failed to fetch session: ${sessionError.message}`)

    const { data: messages, error: messagesError } = await supabase
      .from('ai_coaching_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (messagesError) throw new Error(`Failed to fetch messages: ${messagesError.message}`)

    return { ...session, messages: messages || [] }
  },

  /**
   * Create a new coaching session
   */
  async createSession(session: Omit<CoachingSession, 'id' | 'created_at'>): Promise<CoachingSession> {
    const { data, error } = await supabase
      .from('ai_coaching_sessions')
      .insert([session])
      .select()
      .single()

    if (error) throw new Error(`Failed to create session: ${error.message}`)
    return data
  },

  /**
   * Add a message to a coaching session
   */
  async addMessage(message: Omit<CoachingMessage, 'id' | 'timestamp'>): Promise<CoachingMessage> {
    const { data, error } = await supabase
      .from('ai_coaching_messages')
      .insert([{ ...message, timestamp: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw new Error(`Failed to add message: ${error.message}`)
    return data
  },

  /**
   * Update coaching session
   */
  async updateSession(sessionId: string, updates: Partial<CoachingSession>): Promise<CoachingSession> {
    const { data, error } = await supabase
      .from('ai_coaching_sessions')
      .update({ ...updates, last_activity: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update session: ${error.message}`)
    return data
  }
}

// ============================================================================
// VOICE ANALYSIS SERVICE
// ============================================================================

export const voiceService = {
  /**
   * Get all voice analysis sessions for a user
   */
  async getSessions(userEmail: string): Promise<VoiceAnalysis[]> {
    const { data: sessions, error: sessionsError } = await supabase
      .from('voice_analysis_sessions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (sessionsError) throw new Error(`Failed to fetch voice sessions: ${sessionsError.message}`)

    // Fetch metrics and insights for each session
    const sessionsWithDetails = await Promise.all(
      (sessions || []).map(async (session) => {
        const [metricsResult, insightsResult] = await Promise.all([
          supabase.from('voice_metrics').select('*').eq('session_id', session.id).single(),
          supabase.from('voice_insights').select('*').eq('session_id', session.id)
        ])

        return {
          ...session,
          metrics: metricsResult.data || {},
          insights: insightsResult.data?.filter((i: any) => i.insight_type === 'insight').map((i: any) => i.content) || [],
          recommendations: insightsResult.data?.filter((i: any) => i.insight_type === 'recommendation').map((i: any) => i.content) || []
        }
      })
    )

    return sessionsWithDetails
  },

  /**
   * Create a new voice analysis session
   */
  async createSession(
    session: Omit<VoiceAnalysisSession, 'id' | 'created_at'>,
    metrics: VoiceMetrics,
    insights: string[],
    recommendations: string[]
  ): Promise<VoiceAnalysis> {
    // Create session
    const { data: newSession, error: sessionError } = await supabase
      .from('voice_analysis_sessions')
      .insert([session])
      .select()
      .single()

    if (sessionError) throw new Error(`Failed to create voice session: ${sessionError.message}`)

    // Create metrics
    const { error: metricsError } = await supabase
      .from('voice_metrics')
      .insert([{ session_id: newSession.id, ...metrics }])

    if (metricsError) throw new Error(`Failed to create voice metrics: ${metricsError.message}`)

    // Create insights
    const insightRecords = [
      ...insights.map(content => ({ session_id: newSession.id, insight_type: 'insight', content })),
      ...recommendations.map(content => ({ session_id: newSession.id, insight_type: 'recommendation', content }))
    ]

    if (insightRecords.length > 0) {
      const { error: insightsError } = await supabase
        .from('voice_insights')
        .insert(insightRecords)

      if (insightsError) throw new Error(`Failed to create voice insights: ${insightsError.message}`)
    }

    return { ...newSession, metrics, insights, recommendations }
  }
}

// ============================================================================
// FEEDBACK SERVICE
// ============================================================================

export const feedbackService = {
  /**
   * Get all feedback sessions for a user
   */
  async getSessions(userEmail: string): Promise<FeedbackSession[]> {
    const { data: sessions, error: sessionsError } = await supabase
      .from('feedback_sessions')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })

    if (sessionsError) throw new Error(`Failed to fetch feedback sessions: ${sessionsError.message}`)

    // Fetch categories and items for each session
    const sessionsWithDetails = await Promise.all(
      (sessions || []).map(async (session) => {
        const [categoriesResult, itemsResult] = await Promise.all([
          supabase.from('feedback_categories').select('*').eq('session_id', session.id).single(),
          supabase.from('feedback_items').select('*').eq('session_id', session.id)
        ])

        const items = itemsResult.data || []
        
        return {
          ...session,
          categories: categoriesResult.data || { technical: 0, communication: 0, problem_solving: 0, cultural: 0 },
          ai_insights: items.filter((i: any) => i.item_type === 'ai_insight').map((i: any) => i.content),
          improvements: items.filter((i: any) => i.item_type === 'improvement').map((i: any) => i.content),
          strengths: items.filter((i: any) => i.item_type === 'strength').map((i: any) => i.content),
          next_steps: items.filter((i: any) => i.item_type === 'next_step').map((i: any) => i.content)
        }
      })
    )

    return sessionsWithDetails
  },

  /**
   * Create a new feedback session
   */
  async createSession(session: Omit<FeedbackSession, 'id' | 'created_at'>): Promise<FeedbackSession> {
    // Create session
    const { data: newSession, error: sessionError } = await supabase
      .from('feedback_sessions')
      .insert([{
        user_email: session.user_email,
        session_name: session.session_name,
        interview_date: session.interview_date,
        duration: session.duration,
        overall_score: session.overall_score
      }])
      .select()
      .single()

    if (sessionError) throw new Error(`Failed to create feedback session: ${sessionError.message}`)

    // Create categories
    const { error: categoriesError } = await supabase
      .from('feedback_categories')
      .insert([{ session_id: newSession.id, ...session.categories }])

    if (categoriesError) throw new Error(`Failed to create feedback categories: ${categoriesError.message}`)

    // Create feedback items
    const items = [
      ...session.ai_insights.map(content => ({ session_id: newSession.id, item_type: 'ai_insight', content })),
      ...session.improvements.map(content => ({ session_id: newSession.id, item_type: 'improvement', content })),
      ...session.strengths.map(content => ({ session_id: newSession.id, item_type: 'strength', content })),
      ...session.next_steps.map(content => ({ session_id: newSession.id, item_type: 'next_step', content }))
    ]

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('feedback_items')
        .insert(items)

      if (itemsError) throw new Error(`Failed to create feedback items: ${itemsError.message}`)
    }

    return { ...newSession, ...session }
  }
}

// ============================================================================
// PREP PLAN SERVICE
// ============================================================================

export const prepService = {
  /**
   * Get active prep plan for a user
   */
  async getActivePlan(userEmail: string): Promise<PrepPlan | null> {
    const { data: plan, error: planError } = await supabase
      .from('prep_plans')
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (planError) {
      if (planError.code === 'PGRST116') return null // No rows found
      throw new Error(`Failed to fetch prep plan: ${planError.message}`)
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('prep_categories')
      .select('*')
      .eq('plan_id', plan.id)

    if (categoriesError) throw new Error(`Failed to fetch categories: ${categoriesError.message}`)

    // Fetch goals and insights
    const [goalsResult, insightsResult] = await Promise.all([
      supabase.from('prep_goals').select('*').eq('plan_id', plan.id).eq('goal_type', 'daily'),
      supabase.from('prep_insights').select('*').eq('plan_id', plan.id)
    ])

    const insights = insightsResult.data || []

    // Transform categories into the expected format
    const categoriesMap: any = {
      technical: { progress: 0, tasks: 0, completed: 0 },
      behavioral: { progress: 0, tasks: 0, completed: 0 },
      system_design: { progress: 0, tasks: 0, completed: 0 },
      company_specific: { progress: 0, tasks: 0, completed: 0 }
    }

    categories?.forEach((cat: any) => {
      categoriesMap[cat.category] = {
        progress: cat.progress,
        tasks: cat.tasks_total,
        completed: cat.tasks_completed
      }
    })

    return {
      ...plan,
      categories: categoriesMap,
      daily_goals: goalsResult.data?.map((g: any) => g.content) || [],
      weak_areas: insights.filter((i: any) => i.insight_type === 'weakness').map((i: any) => i.content),
      strengths: insights.filter((i: any) => i.insight_type === 'strength').map((i: any) => i.content),
      ai_recommendations: insights.filter((i: any) => i.insight_type === 'recommendation').map((i: any) => i.content)
    }
  },

  /**
   * Get study sessions for a prep plan
   */
  async getStudySessions(planId: string): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('plan_id', planId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch study sessions: ${error.message}`)
    return data || []
  },

  /**
   * Create a new prep plan
   */
  async createPlan(plan: Omit<PrepPlan, 'id' | 'created_at' | 'updated_at'>): Promise<PrepPlan> {
    // Create plan
    const { data: newPlan, error: planError } = await supabase
      .from('prep_plans')
      .insert([{
        user_email: plan.user_email,
        title: plan.title,
        target_role: plan.target_role,
        target_company: plan.target_company,
        interview_date: plan.interview_date,
        overall_progress: plan.overall_progress,
        status: plan.status
      }])
      .select()
      .single()

    if (planError) throw new Error(`Failed to create prep plan: ${planError.message}`)

    // Create categories
    const categoryRecords = Object.entries(plan.categories).map(([category, data]) => ({
      plan_id: newPlan.id,
      category,
      progress: data.progress,
      tasks_total: data.tasks,
      tasks_completed: data.completed
    }))

    const { error: categoriesError } = await supabase
      .from('prep_categories')
      .insert(categoryRecords)

    if (categoriesError) throw new Error(`Failed to create prep categories: ${categoriesError.message}`)

    return { ...newPlan, ...plan }
  },

  /**
   * Update study session completion
   */
  async updateStudySession(sessionId: string, completed: boolean): Promise<void> {
    const { error } = await supabase
      .from('study_sessions')
      .update({ 
        completed, 
        completed_at: completed ? new Date().toISOString() : null 
      })
      .eq('id', sessionId)

    if (error) throw new Error(`Failed to update study session: ${error.message}`)
  }
}

// ============================================================================
// METRICS SERVICE
// ============================================================================

export const metricsService = {
  /**
   * Get or create AI features metrics for a user
   */
  async getMetrics(userEmail: string) {
    const { data, error } = await supabase
      .from('ai_features_metrics')
      .select('*')
      .eq('user_email', userEmail)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch metrics: ${error.message}`)
    }

    // If no metrics exist, create default
    if (!data) {
      const { data: newMetrics, error: createError } = await supabase
        .from('ai_features_metrics')
        .insert([{
          user_email: userEmail,
          coaching_sessions_completed: 0,
          voice_sessions_completed: 0,
          feedback_sessions_completed: 0,
          prep_plans_active: 0,
          average_score: 0,
          improvement_rate: 0,
          last_activity: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) throw new Error(`Failed to create metrics: ${createError.message}`)
      return newMetrics
    }

    return data
  },

  /**
   * Update metrics (usually called after completing a session)
   */
  async updateMetrics(userEmail: string): Promise<void> {
    // Call the database function to recalculate metrics
    const { error } = await supabase.rpc('update_ai_features_metrics', {
      user_email_param: userEmail
    })

    if (error) throw new Error(`Failed to update metrics: ${error.message}`)
  }
}
