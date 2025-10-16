'use client'

import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client' // Disabled for NextAuth migration
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Interview {
  id: string
  user_id?: string
  title?: string
  type: string
  difficulty?: string
  status: string
  duration_minutes: number
  questions: any[]
  ai_analysis: any
  performance_score?: number
  feedback?: string
  improvement_areas?: string[]
  strengths?: string[]
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at?: string
}
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
// import { Card } from '@/components/ui/animations'
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Award,
  Brain,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface PerformanceData {
  overall_score: number
  trend: 'up' | 'down' | 'stable'
  skills: SkillPerformance[]
  recent_sessions: SessionSummary[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

interface SkillPerformance {
  name: string
  score: number
  improvement: number
  category: string
  sessions_count: number
}

interface SessionSummary {
  id: string
  date: string
  score: number
  type: string
  duration: number
  improvement: number
}

export default function PerformanceClient() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')
  const [skillFilter, setSkillFilter] = useState('all')

  useEffect(() => {
    loadPerformanceData()
  }, [timeRange])

  const loadPerformanceData = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/analytics?action=summary&timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data')
      }

      const data = await response.json()

      if (!data || !data.total_interviews || data.total_interviews === 0) {
        setPerformanceData({
          overall_score: 0,
          trend: 'stable',
          skills: [],
          recent_sessions: [],
          strengths: [],
          weaknesses: [],
          recommendations: ['Complete your first interview to see performance analytics']
        })
        setIsLoading(false)
        return
      }

      // Use data from analytics API
      setPerformanceData({
        overall_score: data.average_score || 0,
        trend: data.trend || 'stable',
        skills: data.skill_breakdown || [],
        recent_sessions: data.recent_interviews || [],
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        recommendations: data.recommendations || ['Continue practicing to improve your interview skills']
      })
    } catch (error) {
      console.error('Error loading performance data:', error)
      setPerformanceData({
        overall_score: 0,
        trend: 'stable',
        skills: [],
        recent_sessions: [],
        strengths: [],
        weaknesses: [],
        recommendations: ['Unable to load performance data. Please try again.']
      })
    }
    
    setIsLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-jade-success'
    if (score >= 8) return 'text-prism-teal'
    if (score >= 7) return 'text-amber-500'
    if (score >= 6) return 'text-orange-500'
    return 'text-rose-alert'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 9) return 'bg-jade-success'
    if (score >= 8) return 'bg-prism-teal'
    if (score >= 7) return 'bg-amber-500'
    if (score >= 6) return 'bg-orange-500'
    return 'bg-rose-alert'
  }

  const getTrendIcon = (improvement: number) => {
    if (improvement > 0) return <ArrowUp className="w-4 h-4 text-jade-success" />
    if (improvement < 0) return <ArrowDown className="w-4 h-4 text-rose-alert" />
    return null
  }

  const filteredSkills = performanceData?.skills.filter(skill => {
    if (skillFilter === 'all') return true
    return skill.category.toLowerCase() === skillFilter.toLowerCase()
  }) || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-silver/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!performanceData) {
    return <div>No performance data available</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-obsidian dark:text-pearl mb-2">
          Performance Analytics
        </h1>
        <p className="text-silver">
          Track your progress and identify areas for improvement
        </p>
      </div>

      {/* Overall Performance Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(performanceData.overall_score)}`}>
              {performanceData.overall_score}/10
            </div>
            <div className="text-sm text-silver mb-2">Overall Score</div>
            <div className="flex items-center justify-center gap-1">
              {performanceData.trend === 'up' && (
                <>
                  <TrendingUp className="w-4 h-4 text-jade-success" />
                  <span className="text-jade-success text-sm">Improving</span>
                </>
              )}
              {performanceData.trend === 'down' && (
                <>
                  <TrendingDown className="w-4 h-4 text-rose-alert" />
                  <span className="text-rose-alert text-sm">Needs Focus</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-prism-teal mb-1">
              {performanceData.skills.length}
            </div>
            <div className="text-sm text-silver">Skills Tracked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-jade-success mb-1">
              {performanceData.recent_sessions.length}
            </div>
            <div className="text-sm text-silver">Recent Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-lavender-mist mb-1">
              +{Math.round(performanceData.skills.reduce((acc, skill) => acc + skill.improvement, 0) / performanceData.skills.length)}%
            </div>
            <div className="text-sm text-silver">Avg Improvement</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadPerformanceData()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
            
            <div className="flex gap-2">
              {['7days', '30days', '90days', '1year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-colors
                    ${timeRange === period
                      ? 'bg-prism-teal text-white'
                      : 'bg-silver/10 text-graphite dark:text-silver hover:bg-silver/20'
                    }
                  `}
                >
                  {period === '7days' && 'Last 7 Days'}
                  {period === '30days' && 'Last 30 Days'}  
                  {period === '90days' && 'Last 90 Days'}
                  {period === '1year' && 'Last Year'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Skills Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-prism-teal" />
                Skills Performance
              </CardTitle>
              <div className="flex gap-2">
                {['all', 'technical', 'behavioral'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSkillFilter(filter)}
                    className={`
                      px-2 py-1 rounded text-xs font-medium transition-colors
                      ${skillFilter === filter
                        ? 'bg-prism-teal text-white'
                        : 'bg-silver/10 text-graphite dark:text-silver hover:bg-silver/20'
                      }
                    `}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredSkills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-obsidian dark:text-pearl">{skill.name}</div>
                    <div className="text-sm text-silver">{skill.sessions_count} sessions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(skill.improvement)}
                    <span className={`font-semibold ${getScoreColor(skill.score)}`}>
                      {skill.score}/10
                    </span>
                  </div>
                </div>
                <Progress 
                  value={skill.score * 10} 
                  variant="ai-prism" 
                  className="h-2"
                />
                {skill.improvement !== 0 && (
                  <div className={`text-xs ${skill.improvement > 0 ? 'text-jade-success' : 'text-rose-alert'}`}>
                    {skill.improvement > 0 ? '+' : ''}{skill.improvement}% from last period
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-prism-teal" />
              Recent Session Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceData.recent_sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-silver/5 rounded-lg">
                <div>
                  <div className="font-medium text-obsidian dark:text-pearl">{session.type}</div>
                  <div className="text-sm text-silver flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.date).toLocaleDateString()}
                    <Clock className="w-3 h-3 ml-2" />
                    {session.duration}m
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getScoreColor(session.score)}`}>
                    {session.score}/10
                  </div>
                  {session.improvement !== 0 && (
                    <div className={`text-xs flex items-center gap-1 ${session.improvement > 0 ? 'text-jade-success' : 'text-rose-alert'}`}>
                      {getTrendIcon(session.improvement)}
                      {Math.abs(session.improvement)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jade-success">
              <CheckCircle2 className="w-5 h-5" />
              Strengths
            </CardTitle>
            <CardDescription>
              Areas where you excel and should continue to leverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-jade-success/5 border border-jade-success/20 rounded-lg">
                  <Star className="w-4 h-4 text-jade-success mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-obsidian dark:text-pearl">{strength}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>
              Focus areas that could benefit from additional practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-obsidian dark:text-pearl">{weakness}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-prism-teal" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered suggestions to help you improve your interview performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {performanceData.recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 border border-prism-teal/20 rounded-lg bg-prism-teal/5">
                <div className="text-sm text-obsidian dark:text-pearl mb-3">{recommendation}</div>
                <Button size="sm" variant="outline">
                  Start Practice
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}