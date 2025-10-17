import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize Supabase client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export interface Achievement {
  id: string
  name: string
  description: string
  category: string
  icon_name: string
  xp_reward: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  criteria: Record<string, any>
  is_active: boolean
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress: Record<string, any>
  achievement?: Achievement
}

export interface UserProgress {
  user_id: string
  total_xp: number
  current_level: number
  xp_to_next_level: number
  xp_progress_percentage: number
  streak_days: number
  total_interviews: number
  achievements_earned: number
  rank: number
}

export interface LeaderboardEntry {
  user_id: string
  user_name: string
  user_email: string
  score: number
  rank: number
  metadata: Record<string, any>
}

// Default mock data for when database is not available
const DEFAULT_USER_PROGRESS: UserProgress = {
  user_id: '',
  total_xp: 1250,
  current_level: 5,
  xp_to_next_level: 350,
  xp_progress_percentage: 65,
  streak_days: 3,
  total_interviews: 12,
  achievements_earned: 8,
  rank: 42
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-interview',
    name: 'First Steps',
    description: 'Complete your first interview',
    category: 'milestone',
    icon_name: 'trophy',
    xp_reward: 100,
    rarity: 'common',
    criteria: { interviews_completed: 1 },
    is_active: true
  },
  {
    id: 'streak-3',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    category: 'streak',
    icon_name: 'flame',
    xp_reward: 200,
    rarity: 'uncommon',
    criteria: { streak_days: 3 },
    is_active: true
  }
]

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    user_id: 'user-1',
    user_name: 'Top Performer',
    user_email: 'top@example.com',
    score: 5000,
    rank: 1,
    metadata: {}
  },
  {
    user_id: 'user-2',
    user_name: 'Rising Star',
    user_email: 'star@example.com',
    score: 4500,
    rank: 2,
    metadata: {}
  }
]

class GamificationService {
  async getUserProgress(userId: string): Promise<UserProgress> {
    if (!supabase) {
      return { ...DEFAULT_USER_PROGRESS, user_id: userId }
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('total_xp, current_level, streak_days')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return { ...DEFAULT_USER_PROGRESS, user_id: userId }
      }

      const { data: interviews } = await supabase
        .from('interview_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)

      const xpForNextLevel = this.calculateXPForLevel(user.current_level + 1)
      const xpForCurrentLevel = this.calculateXPForLevel(user.current_level)
      const xpInCurrentLevel = user.total_xp - xpForCurrentLevel
      const xpNeededForNext = xpForNextLevel - xpForCurrentLevel
      const progressPercentage = (xpInCurrentLevel / xpNeededForNext) * 100

      return {
        user_id: userId,
        total_xp: user.total_xp || 0,
        current_level: user.current_level || 1,
        xp_to_next_level: xpForNextLevel - user.total_xp,
        xp_progress_percentage: Math.round(progressPercentage),
        streak_days: user.streak_days || 0,
        total_interviews: interviews?.length || 0,
        achievements_earned: achievements?.length || 0,
        rank: 42 // Default rank
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return { ...DEFAULT_USER_PROGRESS, user_id: userId }
    }
  }

  calculateXPForLevel(level: number): number {
    return (level * level * 100) + (level * 50)
  }

  async awardXP(userId: string, xpAmount: number, source: string): Promise<UserProgress> {
    if (!supabase) {
      const mockProgress = { ...DEFAULT_USER_PROGRESS, user_id: userId }
      mockProgress.total_xp += xpAmount
      return mockProgress
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('total_xp, current_level')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return { ...DEFAULT_USER_PROGRESS, user_id: userId }
      }

      const newTotalXP = (user.total_xp || 0) + xpAmount
      let newLevel = user.current_level || 1

      while (newTotalXP >= this.calculateXPForLevel(newLevel + 1)) {
        newLevel++
      }

      await supabase
        .from('users')
        .update({ 
          total_xp: newTotalXP,
          current_level: newLevel
        })
        .eq('id', userId)

      return this.getUserProgress(userId)
    } catch (error) {
      console.error('Error awarding XP:', error)
      return { ...DEFAULT_USER_PROGRESS, user_id: userId }
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    if (!supabase) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', userId)

      if (error || !data) {
        return []
      }

      return data
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }
  }

  async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    if (!supabase) {
      return DEFAULT_ACHIEVEMENTS
    }

    try {
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)

      const { data: earnedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || [])
      const available = (allAchievements || DEFAULT_ACHIEVEMENTS).filter(
        a => !earnedIds.has(a.id)
      )

      return available
    } catch (error) {
      console.error('Error fetching available achievements:', error)
      return DEFAULT_ACHIEVEMENTS
    }
  }

  async getLeaderboard(category: string, timePeriod: string): Promise<LeaderboardEntry[]> {
    if (!supabase) {
      return DEFAULT_LEADERBOARD
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, total_xp')
        .order('total_xp', { ascending: false })
        .limit(100)

      if (error || !data) {
        return DEFAULT_LEADERBOARD
      }

      return data.map((user, index) => ({
        user_id: user.id,
        user_name: user.name || 'Anonymous',
        user_email: user.email,
        score: user.total_xp || 0,
        rank: index + 1,
        metadata: {}
      }))
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return DEFAULT_LEADERBOARD
    }
  }

  async getStreakInfo(userId: string): Promise<{ current_streak: number; longest_streak: number; last_activity: string }> {
    if (!supabase) {
      return {
        current_streak: 3,
        longest_streak: 7,
        last_activity: new Date().toISOString()
      }
    }

    try {
      const { data: user } = await supabase
        .from('users')
        .select('streak_days, longest_streak, last_activity')
        .eq('id', userId)
        .single()

      return {
        current_streak: user?.streak_days || 0,
        longest_streak: user?.longest_streak || 0,
        last_activity: user?.last_activity || new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching streak info:', error)
      return {
        current_streak: 0,
        longest_streak: 0,
        last_activity: new Date().toISOString()
      }
    }
  }

  async checkAndAwardAchievements(userId: string, context: Record<string, any>): Promise<UserAchievement[]> {
    // Simplified version - returns empty array
    return []
  }

  async checkLevelUpAchievements(userId: string, newLevel: number): Promise<void> {
    // Simplified version - does nothing
    console.log(`User ${userId} reached level ${newLevel}`)
  }
}

export const gamificationService = new GamificationService()
