'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Calendar, Trophy, TrendingUp, Snowflake, Target, Award, ChevronRight, Lock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns'

interface StreakData {
  current: number
  longest: number
  totalSessions: number
  lastActiveDate: string | null
  status: 'active' | 'at_risk' | 'broken' | 'inactive'
  frozen: boolean
  freezeUsedDate: string | null
}

interface SessionLog {
  session_date: string
  session_count: number
  completed: boolean
}

interface Achievement {
  achievement_type: string
  achievement_name: string
  achievement_description: string
  earned_date: string
  streak_milestone: number
}

export default function StreakWidget() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [sessions, setSessions] = useState<SessionLog[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [nextMilestone, setNextMilestone] = useState<number | null>(null)
  const [streakBonus, setStreakBonus] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)
  const [animateFlame, setAnimateFlame] = useState(false)

  useEffect(() => {
    fetchStreakData()
  }, [])

  useEffect(() => {
    // Animate flame when streak increases
    if (streakData?.current && streakData.current > 0) {
      setAnimateFlame(true)
      const timer = setTimeout(() => setAnimateFlame(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [streakData?.current])

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/streaks')
      const data = await response.json()

      if (response.ok) {
        setStreakData(data.streak)
        setSessions(data.sessions)
        setAchievements(data.achievements)
        setNextMilestone(data.nextMilestone)
        setStreakBonus(data.streakBonus)
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFreezeStreak = async () => {
    try {
      const response = await fetch('/api/streaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'freeze' })
      })

      if (response.ok) {
        await fetchStreakData()
      }
    } catch (error) {
      console.error('Failed to freeze streak:', error)
    }
  }

  const getFlameColor = (streak: number) => {
    if (streak >= 30) return 'text-blue-500' // Blue flame for 30+ days
    if (streak >= 14) return 'text-purple-500' // Purple flame for 14+ days
    if (streak >= 7) return 'text-orange-500' // Orange flame for 7+ days
    if (streak >= 3) return 'text-yellow-500' // Yellow flame for 3+ days
    return 'text-red-500' // Red flame for 1-2 days
  }

  const getStreakMessage = (status: string, streak: number) => {
    switch (status) {
      case 'active':
        return `Great job! ${streak} day streak`
      case 'at_risk':
        return 'Practice today to maintain your streak!'
      case 'broken':
        return 'Streak lost. Start a new one today!'
      default:
        return 'Start your streak today!'
    }
  }

  const renderCalendar = () => {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const sessionDates = sessions.map(s => new Date(s.session_date))

    return (
      <div className="grid grid-cols-7 gap-1 p-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day: string) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1">
            {day}
          </div>
        ))}
        {days.map(day => {
          const hasSession = sessionDates.some(d => isSameDay(d, day))
          const isCurrentDay = isToday(day)
          const isFuture = !isBefore(day, today) && !isCurrentDay

          return (
            <TooltipProvider key={day.toISOString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all",
                      hasSession && "bg-green-500 text-white",
                      !hasSession && !isFuture && "bg-gray-100 dark:bg-gray-800",
                      isCurrentDay && !hasSession && "ring-2 ring-blue-500",
                      isFuture && "opacity-30"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(day, 'MMM d, yyyy')}</p>
                  {hasSession && <p className="text-green-400">Completed</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  const milestones = [3, 7, 14, 30, 60, 100]
  const earnedMilestones = achievements.map(a => a.streak_milestone)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Streak Card */}
      <Card className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5" />
        
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <span>Daily Streak</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={animateFlame ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Flame className={cn(
                  "w-16 h-16 transition-colors",
                  getFlameColor(streakData?.current || 0)
                )} />
                {streakData?.frozen && (
                  <Snowflake className="absolute -top-2 -right-2 w-6 h-6 text-blue-400" />
                )}
              </motion.div>
              
              <div>
                <div className="text-4xl font-bold">
                  {streakData?.current || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getStreakMessage(streakData?.status || 'inactive', streakData?.current || 0)}
                </p>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Longest: <span className="font-bold">{streakData?.longest || 0} days</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: <span className="font-bold">{streakData?.totalSessions || 0} sessions</span>
              </div>
            </div>
          </div>

          {/* Streak Bonus */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Performance Bonus</span>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                +{(streakBonus * 100).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={Math.min(streakBonus * 200, 100)} className="h-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Max bonus: 50% at 10+ days
            </p>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Next Milestone</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {nextMilestone - (streakData?.current || 0)} days to go
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400">
                {nextMilestone} days
              </Badge>
            </div>
          )}

          {/* Freeze Streak Option */}
          {streakData?.status === 'at_risk' && !streakData?.frozen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={handleFreezeStreak}
              >
                <Snowflake className="w-4 h-4 mr-2" />
                Freeze Streak (1 use per month)
              </Button>
            </motion.div>
          )}

          {/* Calendar View */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {renderCalendar()}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Streak Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {milestones.map(milestone => {
              const isEarned = earnedMilestones.includes(milestone)
              const isNext = milestone === nextMilestone
              
              return (
                <motion.div
                  key={milestone}
                  whileHover={isEarned ? { scale: 1.05 } : {}}
                  className={cn(
                    "relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all",
                    isEarned && "bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg",
                    !isEarned && isNext && "bg-gray-100 dark:bg-gray-800 ring-2 ring-blue-500",
                    !isEarned && !isNext && "bg-gray-100 dark:bg-gray-800 opacity-50"
                  )}
                >
                  {isEarned ? (
                    <CheckCircle className="w-6 h-6 mb-1" />
                  ) : (
                    <Lock className="w-6 h-6 mb-1" />
                  )}
                  <span className="text-xs font-bold">{milestone}</span>
                  <span className="text-xs">days</span>
                  
                  {isNext && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Badge className="bg-blue-500 text-white text-xs">
                        Next
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
