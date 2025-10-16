import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

class GamificationService {
  async getUserProgress(userId: string): Promise<UserProgress> {
    const { data: user, error } = await supabase
      .from('users')
      .select('total_xp, current_level, streak_days')
      .eq('id', userId)
      .single()

    if (error) throw new Error(`Failed to fetch user progress: ${error.message}`)

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

    const { data: rankData } = await supabase
      .rpc('get_user_rank', { p_user_id: userId })

    return {
      user_id: userId,
      total_xp: user.total_xp,
      current_level: user.current_level,
      xp_to_next_level: xpForNextLevel - user.total_xp,
      xp_progress_percentage: Math.round(progressPercentage),
      streak_days: user.streak_days,
      total_interviews: interviews?.length || 0,
      achievements_earned: achievements?.length || 0,
      rank: rankData || 0
    }
  }

  calculateXPForLevel(level: number): number {
    return (level * level * 100) + (level * 50)
  }

  calculateXPReward(sessionData: {
    duration_seconds: number
    difficulty: string
    overall_score: number
    interview_type: string
    completion_status: string
  }): number {
    let baseXP = 100

    const difficultyMultiplier = {
      'easy': 1.0,
      'medium': 1.5,
      'hard': 2.0
    }[sessionData.difficulty] || 1.0

    const scoreBonus = Math.floor((sessionData.overall_score / 100) * 100)

    const durationBonus = Math.min(50, Math.floor(sessionData.duration_seconds / 60))

    const typeBonus = {
      'technical': 50,
      'system-design': 75,
      'behavioral': 40,
      'coding': 60
    }[sessionData.interview_type] || 30

    const completionBonus = sessionData.completion_status === 'completed' ? 50 : 0

    const totalXP = Math.floor(
      (baseXP + typeBonus + durationBonus + completionBonus + scoreBonus) * difficultyMultiplier
    )

    return totalXP
  }

  async awardXP(userId: string, xpAmount: number, source: string): Promise<UserProgress> {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('total_xp, current_level')
      .eq('id', userId)
      .single()

    if (fetchError) throw new Error(`Failed to fetch user: ${fetchError.message}`)

    const newTotalXP = user.total_xp + xpAmount
    let newLevel = user.current_level

    while (newTotalXP >= this.calculateXPForLevel(newLevel + 1)) {
      newLevel++
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        total_xp: newTotalXP,
        current_level: newLevel
      })
      .eq('id', userId)

    if (updateError) throw new Error(`Failed to update XP: ${updateError.message}`)

    if (newLevel > user.current_level) {
      await this.checkLevelUpAchievements(userId, newLevel)
    }

    return this.getUserProgress(userId)
  }

  async checkAndAwardAchievements(userId: string, context: Record<string, any>): Promise<UserAchievement[]> {
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)

    if (!allAchievements) return []

    const { data: earnedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || [])
    const newAchievements: UserAchievement[] = []

    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue

      if (await this.checkAchievementCriteria(userId, achievement, context)) {
        const { data: newAchievement, error } = await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            achievement_id: achievement.id,
            progress: context
          }])
          .select('*, achievement:achievements(*)')
          .single()

        if (!error && newAchievement) {
          await this.awardXP(userId, achievement.xp_reward, `achievement:${achievement.name}`)
          newAchievements.push(newAchievement)
        }
      }
    }

    return newAchievements
  }

  private async checkAchievementCriteria(
    userId: string,
    achievement: Achievement,
    context: Record<string, any>
  ): Promise<boolean> {
    const criteria = achievement.criteria

    if (criteria.interviews_completed) {
      const { count } = await supabase
        .from('interview_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')

      if ((count || 0) < criteria.interviews_completed) return false
    }

    if (criteria.streak_days) {
      const { data: user } = await supabase
        .from('users')
        .select('streak_days')
        .eq('id', userId)
        .single()

      if (!user || user.streak_days < criteria.streak_days) return false
    }

    if (criteria.perfect_scores) {
      const { count } = await supabase
        .from('interview_evaluations')
        .select('id', { count: 'exact', head: true })
        .eq('overall_score', 100)
        .in('session_id', 
          supabase.from('interview_sessions').select('id').eq('user_id', userId)
        )

      if ((count || 0) < criteria.perfect_scores) return false
    }

    if (criteria.algorithm_questions) {
      const { count } = await supabase
        .from('interview_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('interview_type', 'technical')
        .eq('status', 'completed')

      if ((count || 0) < criteria.algorithm_questions) return false
    }

    if (criteria.system_design_interviews) {
      const { count } = await supabase
        .from('interview_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('interview_type', 'system-design')
        .eq('status', 'completed')

      if ((count || 0) < criteria.system_design_interviews) return false
    }

    if (criteria.high_communication_scores) {
      const { count } = await supabase
        .from('interview_evaluations')
        .select('id', { count: 'exact', head: true })
        .gte('communication_score', 90)
        .in('session_id',
          supabase.from('interview_sessions').select('id').eq('user_id', userId)
        )

      if ((count || 0) < criteria.high_communication_scores) return false
    }

    if (criteria.score_improvement) {
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('id, interview_type, interview_evaluations(overall_score)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10)

      if (sessions && sessions.length >= 2) {
        const typeGroups: Record<string, number[]> = {}
        sessions.forEach(s => {
          const score = (s as any).interview_evaluations?.overall_score
          if (score) {
            if (!typeGroups[s.interview_type]) typeGroups[s.interview_type] = []
            typeGroups[s.interview_type].push(score)
          }
        })

        let hasImprovement = false
        Object.values(typeGroups).forEach(scores => {
          if (scores.length >= 2) {
            const improvement = scores[0] - scores[scores.length - 1]
            if (improvement >= criteria.score_improvement) hasImprovement = true
          }
        })

        if (!hasImprovement) return false
      } else {
        return false
      }
    }

    return true
  }

  private async checkLevelUpAchievements(userId: string, newLevel: number): Promise<void> {
    const levelMilestones = [5, 10, 25, 50, 100]
    
    if (levelMilestones.includes(newLevel)) {
      const achievementName = `Level ${newLevel} Reached`
      
      const { data: achievement } = await supabase
        .from('achievements')
        .select('id, xp_reward')
        .eq('name', achievementName)
        .single()

      if (achievement) {
        await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            achievement_id: achievement.id,
            progress: { level: newLevel }
          }])
      }
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch achievements: ${error.message}`)
    return data || []
  }

  async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    const { data: earned } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const earnedIds = earned?.map(a => a.achievement_id) || []

    const { data: available, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(${earnedIds.join(',') || 'null'})`)
      .order('xp_reward', { ascending: true })

    if (error) throw new Error(`Failed to fetch available achievements: ${error.message}`)
    return available || []
  }

  async getLeaderboard(
    category: string = 'overall',
    timePeriod: string = 'all-time',
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('users')
      .select('id, name, email, total_xp')
      .order('total_xp', { ascending: false })
      .limit(limit)

    const { data: users, error } = await query

    if (error) throw new Error(`Failed to fetch leaderboard: ${error.message}`)
    if (!users) return []

    return users.map((user, index) => ({
      user_id: user.id,
      user_name: user.name || 'Anonymous',
      user_email: user.email,
      score: user.total_xp,
      rank: index + 1,
      metadata: {}
    }))
  }

  async updateLeaderboard(userId: string, category: string, timePeriod: string): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single()

    if (!user) return

    await supabase
      .from('leaderboard')
      .upsert({
        user_id: userId,
        category,
        time_period: timePeriod,
        score: user.total_xp,
        metadata: {}
      }, {
        onConflict: 'user_id,category,time_period'
      })
  }

  async getUserRank(userId: string): Promise<number> {
    const { data: user } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single()

    if (!user) return 0

    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gt('total_xp', user.total_xp)

    return (count || 0) + 1
  }

  async getStreakInfo(userId: string): Promise<{
    current_streak: number
    longest_streak: number
    last_active: string
    streak_status: string
  }> {
    const { data: user } = await supabase
      .from('users')
      .select('streak_days, last_active_date')
      .eq('id', userId)
      .single()

    if (!user) {
      return {
        current_streak: 0,
        longest_streak: 0,
        last_active: '',
        streak_status: 'inactive'
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const lastActive = user.last_active_date

    let streakStatus = 'active'
    if (!lastActive) {
      streakStatus = 'inactive'
    } else if (lastActive < today) {
      const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff > 1) streakStatus = 'broken'
      else if (daysDiff === 1) streakStatus = 'at-risk'
    }

    return {
      current_streak: user.streak_days,
      longest_streak: user.streak_days,
      last_active: lastActive || '',
      streak_status: streakStatus
    }
  }

  getRarityColor(rarity: string): string {
    const colors = {
      'common': '#9CA3AF',
      'uncommon': '#10B981',
      'rare': '#3B82F6',
      'epic': '#A855F7',
      'legendary': '#F59E0B'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  getRarityLabel(rarity: string): string {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1)
  }
}

export const gamificationService = new GamificationService()
