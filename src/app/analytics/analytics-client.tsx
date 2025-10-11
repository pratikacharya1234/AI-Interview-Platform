'use client'

import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client' // Removed for NextAuth migration
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsEmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard } from '@/components/ui/animations'
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Clock, 
  Target, 
  BarChart3,
  Calendar,
  User,
  Brain,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface AnalyticsData {
  overallScore: number
  totalInterviews: number
  totalTime: number
  strongAreas: string[]
  improvementAreas: string[]
  recentTrends: {
    period: string
    score: number
    change: number
  }[]
  skillBreakdown: {
    skill: string
    score: number
    progress: number
    interviews: number
  }[]
  performanceHistory: {
    date: string
    score: number
    type: string
  }[]
}

export default function AnalyticsClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        // Get current user
        // Temporarily disabled for NextAuth migration
        // const supabase = createClient()
        // const { data: { user } } = await supabase.auth.getUser()
        const user = { id: 'temp-user' }
        if (!user) {
          throw new Error('User not authenticated')
        }

        // Fetch real analytics data from voice interviews
        const { VoiceInterviewService } = await import('@/lib/services/voice-interview')
        const interviews = await VoiceInterviewService.getUserInterviews(user.id, 50)
        
        if (interviews.length === 0) {
          // No interviews yet - show empty state
          setAnalytics(null)
          setIsLoading(false)
          return
        }

        // Calculate real analytics from interview data
        const completedInterviews = interviews.filter(i => i.status === 'completed')
        const totalInterviews = completedInterviews.length
        const overallScore = totalInterviews > 0 
          ? completedInterviews.reduce((sum, i) => sum + i.overall_score, 0) / totalInterviews 
          : 0

        // Calculate total time from all interviews
        const totalTime = completedInterviews.reduce((sum, interview) => {
          const duration = interview.completed_at && interview.started_at 
            ? (new Date(interview.completed_at).getTime() - new Date(interview.started_at).getTime()) / (1000 * 60)
            : 0
          return sum + duration
        }, 0)

        // Group by question types for skill breakdown
        const skillCounts: Record<string, { total: number, score: number, count: number }> = {}
        completedInterviews.forEach(interview => {
          interview.question_types.forEach(type => {
            if (!skillCounts[type]) {
              skillCounts[type] = { total: 0, score: 0, count: 0 }
            }
            skillCounts[type].score += interview.overall_score
            skillCounts[type].count += 1
          })
        })

        const skillBreakdown = Object.entries(skillCounts).map(([skill, data]) => ({
          skill: skill.charAt(0).toUpperCase() + skill.slice(1).replace('-', ' '),
          score: data.count > 0 ? data.score / data.count : 0,
          progress: 0, // Would need historical data to calculate
          interviews: data.count
        }))

        // Performance history from recent interviews
        const performanceHistory = completedInterviews
          .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
          .slice(0, 10)
          .map(interview => ({
            date: interview.started_at.split('T')[0],
            score: interview.overall_score,
            type: interview.question_types[0] || 'General'
          }))

        setAnalytics({
          overallScore,
          totalInterviews,
          totalTime: Math.round(totalTime),
          strongAreas: skillBreakdown
            .filter(s => s.score > 7.5)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(s => s.skill),
          improvementAreas: skillBreakdown
            .filter(s => s.score < 7.0)
            .sort((a, b) => a.score - b.score)
            .slice(0, 3)
            .map(s => s.skill),
          recentTrends: [], // Would need more complex calculation
          skillBreakdown,
          performanceHistory
        })
      } catch (error) {
        console.error('Failed to load analytics:', error)
        // Fallback to empty state
        setAnalytics({
          overallScore: 0,
          totalInterviews: 0,
          totalTime: 0,
          strongAreas: [],
          improvementAreas: [],
          recentTrends: [],
          skillBreakdown: [],
          performanceHistory: []
        })
      }
      setIsLoading(false)
    }

    loadAnalytics()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-silver/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AnalyticsEmptyState />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-obsidian dark:text-pearl mb-2">
          Performance Analytics
        </h1>
        <p className="text-silver">
          Track your interview performance and identify areas for improvement
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${timeRange === range
                  ? 'bg-prism-teal text-white'
                  : 'bg-silver/10 text-graphite dark:text-silver hover:bg-silver/20'
                }
              `}
            >
              {range === '7d' && 'Last 7 days'}
              {range === '30d' && 'Last 30 days'}
              {range === '90d' && 'Last 90 days'}
              {range === 'all' && 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <AnimatedCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-silver">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-obsidian dark:text-pearl">
                {analytics.overallScore}/10
              </div>
              <Badge 
                variant={analytics.overallScore >= 8 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {analytics.overallScore >= 8 ? 'Excellent' : analytics.overallScore >= 6 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-silver">Total Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-prism-teal" />
              <div className="text-2xl font-bold text-obsidian dark:text-pearl">
                {analytics.totalInterviews}
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-silver">Total Practice Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-lavender-mist" />
              <div className="text-2xl font-bold text-obsidian dark:text-pearl">
                {Math.round(analytics.totalTime / 60)}h
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-silver">Avg. Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-jade-success" />
              <div className="text-2xl font-bold text-obsidian dark:text-pearl">
                {Math.round(analytics.totalTime / analytics.totalInterviews)}m
              </div>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <AnimatedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-prism-teal" />
              Performance Trends
            </CardTitle>
            <CardDescription>Your score progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-silver/5 rounded-lg">
                  <div>
                    <div className="font-medium text-obsidian dark:text-pearl">{trend.period}</div>
                    <div className="text-sm text-silver">Score: {trend.score}/10</div>
                  </div>
                  <div className={`flex items-center gap-1 ${trend.change >= 0 ? 'text-jade-success' : 'text-rose-alert'}`}>
                    {trend.change >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(trend.change).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Skill Breakdown */}
        <AnimatedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-lavender-mist" />
              Skill Breakdown
            </CardTitle>
            <CardDescription>Performance by technical areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.skillBreakdown.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-obsidian dark:text-pearl">{skill.skill}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-silver">{skill.score}/10</span>
                      <div className={`flex items-center gap-1 text-xs ${
                        skill.progress >= 0 ? 'text-jade-success' : 'text-rose-alert'
                      }`}>
                        {skill.progress >= 0 ? '+' : ''}{skill.progress}%
                      </div>
                    </div>
                  </div>
                  <Progress value={skill.score * 10} variant="ai-prism" />
                  <div className="text-xs text-silver">
                    {skill.interviews} interview{skill.interviews !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Strengths & Areas for Improvement */}
        <AnimatedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-jade-success" />
              Strengths
            </CardTitle>
            <CardDescription>Areas where you excel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.strongAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-jade-success/10 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-jade-success" />
                  <span className="text-sm text-obsidian dark:text-pearl">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-rose-alert" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>Focus areas for growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-rose-alert/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-rose-alert" />
                  <span className="text-sm text-obsidian dark:text-pearl">{area}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Recent Performance History */}
      <AnimatedCard className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-prism-teal" />
            Recent Interview History
          </CardTitle>
          <CardDescription>Your last 5 interview sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.performanceHistory.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-silver/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{session.type}</Badge>
                  <div>
                    <div className="font-medium text-obsidian dark:text-pearl">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-silver">Interview Session</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-obsidian dark:text-pearl">
                    {session.score}/10
                  </div>
                  <div className={`text-xs ${
                    session.score >= 8 ? 'text-jade-success' : 
                    session.score >= 6 ? 'text-prism-teal' : 'text-rose-alert'
                  }`}>
                    {session.score >= 8 ? 'Excellent' : 
                     session.score >= 6 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  )
}