'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Calendar, TrendingUp, Loader2, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface StreakInfo {
  current_streak: number
  longest_streak: number
  last_active: string
  streak_status: string
}

export default function StreakPage() {
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreakInfo()
  }, [])

  const fetchStreakInfo = async () => {
    try {
      const response = await fetch('/api/gamification?action=streak')
      if (response.ok) {
        const data = await response.json()
        setStreakInfo(data)
      }
    } catch (error) {
      console.error('Error fetching streak info:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStreakColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'at-risk': return 'text-yellow-500'
      case 'broken': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStreakBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Active</Badge>
      case 'at-risk': return <Badge className="bg-yellow-500">At Risk</Badge>
      case 'broken': return <Badge variant="destructive">Broken</Badge>
      default: return <Badge variant="secondary">Inactive</Badge>
    }
  }

  const getStreakMessage = (status: string) => {
    switch (status) {
      case 'active': return 'Great job! Keep your streak alive by completing an interview today.'
      case 'at-risk': return 'Your streak is at risk! Complete an interview today to maintain it.'
      case 'broken': return 'Your streak was broken. Start a new one by completing an interview today.'
      default: return 'Start your streak by completing your first interview!'
    }
  }

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        active: i < (streakInfo?.current_streak || 0)
      })
    }
    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Flame className={`h-8 w-8 ${getStreakColor(streakInfo?.streak_status || '')}`} />
          Daily Streak
        </h1>
        <p className="text-muted-foreground">
          Maintain your momentum by completing interviews daily
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Streak</span>
              {streakInfo && getStreakBadge(streakInfo.streak_status)}
            </CardTitle>
            <CardDescription>Consecutive days with activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {streakInfo?.current_streak || 0}
              </div>
              <p className="text-muted-foreground">days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Longest Streak
            </CardTitle>
            <CardDescription>Your personal best</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-muted-foreground mb-2">
                {streakInfo?.longest_streak || 0}
              </div>
              <p className="text-muted-foreground">days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Last 7 Days
          </CardTitle>
          <CardDescription>Your activity this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {getLast7Days().map((day, index) => (
              <div key={index} className="flex-1 text-center">
                <div className={`h-16 rounded-lg flex items-center justify-center mb-2 ${
                  day.active ? 'bg-primary' : 'bg-muted'
                }`}>
                  {day.active && <CheckCircle2 className="h-6 w-6 text-primary-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streak Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {streakInfo && getStreakMessage(streakInfo.streak_status)}
          </p>
          {streakInfo && streakInfo.last_active && (
            <p className="text-sm text-muted-foreground">
              Last active: {new Date(streakInfo.last_active).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
