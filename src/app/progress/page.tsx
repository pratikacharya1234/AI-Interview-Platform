'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Award, Star, Zap, Loader2 } from 'lucide-react'

interface UserProgress {
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

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/gamification?action=progress')
      if (response.ok) {
        const data = await response.json()
        setProgress(data)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Beginner'
    if (level < 10) return 'Intermediate'
    if (level < 20) return 'Advanced'
    if (level < 50) return 'Expert'
    return 'Master'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          XP & Progress
        </h1>
        <p className="text-muted-foreground">
          Track your experience points and level progression
        </p>
      </div>

      {progress && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-1">
                  {progress.current_level}
                </div>
                <Badge variant="secondary">{getLevelTitle(progress.current_level)}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Total XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {progress.total_xp.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Experience Points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {progress.achievements_earned}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Global Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  #{progress.rank}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Worldwide</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
              <CardDescription>
                {progress.xp_to_next_level.toLocaleString()} XP needed to reach Level {progress.current_level + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Level {progress.current_level}</span>
                  <span className="font-semibold">{progress.xp_progress_percentage}%</span>
                  <span className="text-muted-foreground">Level {progress.current_level + 1}</span>
                </div>
                <Progress value={progress.xp_progress_percentage} className="h-4" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Interviews</span>
                    <span className="text-2xl font-bold">{progress.total_interviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Streak</span>
                    <span className="text-2xl font-bold">{progress.streak_days} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Level {progress.current_level + 1}</span>
                    <Badge variant="outline">{progress.xp_to_next_level} XP</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Level {progress.current_level + 5}</span>
                    <Badge variant="outline">Future Goal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Level {Math.ceil(progress.current_level / 10) * 10}</span>
                    <Badge variant="outline">Major Milestone</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
