import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface PerformanceMetrics {
  metric_date: string
  interviews_completed: number
  average_score: number
  time_spent_minutes: number
  questions_answered: number
  accuracy_rate: number
  improvement_rate: number
  weak_areas: string[]
  strong_areas: string[]
}

export interface AnalyticsSummary {
  total_interviews: number
  total_time_minutes: number
  average_score: number
  improvement_trend: number
  completion_rate: number
  strongest_areas: string[]
  weakest_areas: string[]
  recent_performance: PerformanceMetrics[]
}

export interface SkillBreakdown {
  skill_name: string
  current_score: number
  previous_score: number
  change: number
  trend: 'improving' | 'declining' | 'stable'
  practice_count: number
}

class AnalyticsService {
  async getUserAnalytics(userId: string, days: number = 30): Promise<AnalyticsSummary> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('*, interview_evaluations(*)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (!sessions || sessions.length === 0) {
      return this.getEmptyAnalytics()
    }

    const totalInterviews = sessions.length
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60

    const scores = sessions
      .map(s => (s as any).interview_evaluations?.overall_score)
      .filter(Boolean)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

    const completionRate = (sessions.filter(s => s.status === 'completed').length / totalInterviews) * 100

    const firstHalf = scores.slice(Math.ceil(scores.length / 2))
    const secondHalf = scores.slice(0, Math.ceil(scores.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const improvementTrend = ((secondAvg - firstAvg) / firstAvg) * 100

    const { data: metrics } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })
      .limit(30)

    const weakAreas = this.aggregateAreas(metrics || [], 'weak_areas')
    const strongAreas = this.aggregateAreas(metrics || [], 'strong_areas')

    return {
      total_interviews: totalInterviews,
      total_time_minutes: Math.round(totalTime),
      average_score: Math.round(avgScore),
      improvement_trend: Math.round(improvementTrend),
      completion_rate: Math.round(completionRate),
      strongest_areas: strongAreas.slice(0, 5),
      weakest_areas: weakAreas.slice(0, 5),
      recent_performance: metrics || []
    }
  }

  private getEmptyAnalytics(): AnalyticsSummary {
    return {
      total_interviews: 0,
      total_time_minutes: 0,
      average_score: 0,
      improvement_trend: 0,
      completion_rate: 0,
      strongest_areas: [],
      weakest_areas: [],
      recent_performance: []
    }
  }

  private aggregateAreas(metrics: any[], field: string): string[] {
    const areaCount: Record<string, number> = {}
    
    metrics.forEach(metric => {
      const areas = metric[field] || []
      areas.forEach((area: string) => {
        areaCount[area] = (areaCount[area] || 0) + 1
      })
    })

    return Object.entries(areaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([area]) => area)
  }

  async getSkillBreakdown(userId: string): Promise<SkillBreakdown[]> {
    const { data: assessments } = await supabase
      .from('skill_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('proficiency_score', { ascending: false })

    if (!assessments) return []

    return assessments.map(assessment => {
      const history = assessment.assessment_history || []
      const currentScore = assessment.proficiency_score
      const previousScore = history.length > 1 ? history[history.length - 2].score : currentScore
      const change = currentScore - previousScore

      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      if (change > 5) trend = 'improving'
      else if (change < -5) trend = 'declining'

      return {
        skill_name: assessment.skill_name,
        current_score: currentScore,
        previous_score: previousScore,
        change: Math.round(change),
        trend,
        practice_count: history.length
      }
    })
  }

  async getInterviewTypePerformance(userId: string): Promise<Record<string, any>> {
    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('interview_type, interview_evaluations(overall_score)')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!sessions) return {}

    const typePerformance: Record<string, any> = {}

    sessions.forEach(session => {
      const type = session.interview_type
      const score = (session as any).interview_evaluations?.overall_score

      if (score) {
        if (!typePerformance[type]) {
          typePerformance[type] = { scores: [], count: 0, total: 0 }
        }
        typePerformance[type].scores.push(score)
        typePerformance[type].count++
        typePerformance[type].total += score
      }
    })

    Object.keys(typePerformance).forEach(type => {
      const data = typePerformance[type]
      typePerformance[type] = {
        average_score: Math.round(data.total / data.count),
        total_interviews: data.count,
        highest_score: Math.max(...data.scores),
        lowest_score: Math.min(...data.scores),
        trend: this.calculateTrend(data.scores)
      }
    })

    return typePerformance
  }

  private calculateTrend(scores: number[]): string {
    if (scores.length < 2) return 'insufficient-data'
    
    const recentAvg = scores.slice(0, Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(scores.length / 2)
    const olderAvg = scores.slice(Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(scores.length / 2)
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (change > 10) return 'improving'
    if (change < -10) return 'declining'
    return 'stable'
  }

  async recordDailyMetrics(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    const { data: todaySessions } = await supabase
      .from('interview_sessions')
      .select('*, interview_evaluations(*)')
      .eq('user_id', userId)
      .gte('created_at', today)
      .eq('status', 'completed')

    if (!todaySessions || todaySessions.length === 0) return

    const scores = todaySessions
      .map(s => (s as any).interview_evaluations?.overall_score)
      .filter(Boolean)

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const timeSpent = todaySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60

    const { data: evaluations } = await supabase
      .from('interview_evaluations')
      .select('weaknesses, strengths')
      .in('session_id', todaySessions.map(s => s.id))

    const weakAreas = this.aggregateAreas(evaluations || [], 'weaknesses')
    const strongAreas = this.aggregateAreas(evaluations || [], 'strengths')

    await supabase
      .from('performance_metrics')
      .upsert({
        user_id: userId,
        metric_date: today,
        interviews_completed: todaySessions.length,
        average_score: Math.round(avgScore),
        time_spent_minutes: Math.round(timeSpent),
        questions_answered: todaySessions.reduce((sum, s) => sum + (s.questions?.length || 0), 0),
        accuracy_rate: Math.round(avgScore),
        weak_areas: weakAreas.slice(0, 5),
        strong_areas: strongAreas.slice(0, 5)
      }, {
        onConflict: 'user_id,metric_date'
      })
  }

  async getProgressOverTime(userId: string, days: number = 90): Promise<any[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: metrics } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: true })

    return metrics || []
  }

  async getComparisonWithPeers(userId: string): Promise<{
    user_rank: number
    user_score: number
    peer_average: number
    percentile: number
  }> {
    const { data: user } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single()

    if (!user) {
      return { user_rank: 0, user_score: 0, peer_average: 0, percentile: 0 }
    }

    const { count: higherCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gt('total_xp', user.total_xp)

    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    const { data: allUsers } = await supabase
      .from('users')
      .select('total_xp')

    const peerAverage = allUsers
      ? allUsers.reduce((sum, u) => sum + u.total_xp, 0) / allUsers.length
      : 0

    const percentile = totalUsers ? ((totalUsers - (higherCount || 0)) / totalUsers) * 100 : 0

    return {
      user_rank: (higherCount || 0) + 1,
      user_score: user.total_xp,
      peer_average: Math.round(peerAverage),
      percentile: Math.round(percentile)
    }
  }

  async generateInsights(userId: string): Promise<string[]> {
    const analytics = await this.getUserAnalytics(userId)
    const skillBreakdown = await this.getSkillBreakdown(userId)
    const insights: string[] = []

    if (analytics.improvement_trend > 15) {
      insights.push('Excellent progress! Your scores have improved by ' + Math.round(analytics.improvement_trend) + '% recently.')
    } else if (analytics.improvement_trend < -10) {
      insights.push('Your recent performance shows a decline. Consider taking a break or focusing on fundamentals.')
    }

    if (analytics.completion_rate < 70) {
      insights.push('Try to complete more interviews. Your completion rate is ' + Math.round(analytics.completion_rate) + '%.')
    }

    const improvingSkills = skillBreakdown.filter(s => s.trend === 'improving')
    if (improvingSkills.length > 0) {
      insights.push(`You're making great progress in ${improvingSkills[0].skill_name}!`)
    }

    const decliningSkills = skillBreakdown.filter(s => s.trend === 'declining')
    if (decliningSkills.length > 0) {
      insights.push(`Consider practicing ${decliningSkills[0].skill_name} more frequently.`)
    }

    if (analytics.weakest_areas.length > 0) {
      insights.push(`Focus on improving: ${analytics.weakest_areas.slice(0, 2).join(', ')}`)
    }

    if (analytics.total_interviews < 5) {
      insights.push('Complete more interviews to get better insights and personalized recommendations.')
    }

    return insights
  }
}

export const analyticsService = new AnalyticsService()
