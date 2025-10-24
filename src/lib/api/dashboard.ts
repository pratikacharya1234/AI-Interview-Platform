import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalInterviews: number
  averageScore: number
  weeklyProgress: number
  currentStreak: number
  completionRate: number
  totalPracticeTime: number
}

export interface RecentActivity {
  id: string
  type: 'interview' | 'practice' | 'challenge' | 'achievement'
  title: string
  timestamp: string
  score?: number
  status: 'completed' | 'in_progress' | 'failed'
  metadata?: Record<string, any>
}

export interface UpcomingChallenge {
  id: string
  title: string
  type: string
  startDate: string
  endDate: string
  difficulty: 'easy' | 'medium' | 'hard'
  participantCount: number
  isRegistered: boolean
}

export class DashboardService {
  private supabase = createClient()

  async getStats(userId: string): Promise<DashboardStats> {
    try {
      // Get total interviews
      const { count: totalInterviews } = await this.supabase
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get average score from interview responses
      const { data: responses } = await this.supabase
        .from('interview_responses')
        .select('score')
        .eq('user_id', userId)
        .not('score', 'is', null)

      const averageScore = responses && responses.length > 0
        ? responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length
        : 0

      // Get weekly progress (interviews in last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { count: weeklyProgress } = await this.supabase
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', weekAgo.toISOString())

      // Get current streak
      const { data: streakData } = await this.supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single()

      // Get completion rate
      const { count: completedInterviews } = await this.supabase
        .from('interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')

      const completionRate = totalInterviews && totalInterviews > 0
        ? (completedInterviews || 0) / totalInterviews * 100
        : 0

      // Get total practice time (sum of session durations)
      const { data: sessions } = await this.supabase
        .from('interview_sessions')
        .select('started_at, completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)

      const totalPracticeTime = sessions?.reduce((total, session) => {
        const start = new Date(session.started_at).getTime()
        const end = new Date(session.completed_at).getTime()
        return total + (end - start)
      }, 0) || 0

      return {
        totalInterviews: totalInterviews || 0,
        averageScore: Math.round(averageScore),
        weeklyProgress: weeklyProgress || 0,
        currentStreak: streakData?.current_streak || 0,
        completionRate: Math.round(completionRate),
        totalPracticeTime: Math.round(totalPracticeTime / (1000 * 60)) // Convert to minutes
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  async getRecentActivities(userId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data: sessions } = await this.supabase
        .from('interview_sessions')
        .select('id, type, position, status, started_at, completed_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)

      const { data: responses } = await this.supabase
        .from('interview_responses')
        .select('session_id, score')
        .eq('user_id', userId)
        .in('session_id', sessions?.map(s => s.id) || [])

      const activities: RecentActivity[] = (sessions || []).map(session => {
        const response = responses?.find(r => r.session_id === session.id)
        return {
          id: session.id,
          type: 'interview',
          title: `${session.type} Interview - ${session.position}`,
          timestamp: session.started_at,
          score: response?.score,
          status: session.status as RecentActivity['status'],
          metadata: {
            type: session.type,
            position: session.position
          }
        }
      })

      return activities
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      throw error
    }
  }

  async getUpcomingChallenges(userId: string, limit: number = 5): Promise<UpcomingChallenge[]> {
    try {
      // This would typically fetch from a challenges table
      // For now, returning empty array as challenges aren't in the provided schema
      return []
    } catch (error) {
      console.error('Error fetching upcoming challenges:', error)
      throw error
    }
  }

  async updateStreak(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: existingStreak } = await this.supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!existingStreak) {
        await this.supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today
          })
      } else {
        const lastActivity = new Date(existingStreak.last_activity_date)
        const todayDate = new Date(today)
        const daysDiff = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) {
          // Already updated today
          return
        } else if (daysDiff === 1) {
          // Consecutive day
          const newStreak = existingStreak.current_streak + 1
          await this.supabase
            .from('user_streaks')
            .update({
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, existingStreak.longest_streak),
              last_activity_date: today
            })
            .eq('user_id', userId)
        } else {
          // Streak broken
          await this.supabase
            .from('user_streaks')
            .update({
              current_streak: 1,
              last_activity_date: today
            })
            .eq('user_id', userId)
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error)
      throw error
    }
  }
}

export const dashboardService = new DashboardService()
