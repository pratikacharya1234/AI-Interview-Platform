'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  Calendar,
  ArrowRight,
  Play,
  BarChart3,
  Users,
  BookOpen,
  Video,
  MessageSquare,
  Zap,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalInterviews: number
  averageScore: number
  weeklyProgress: number
  currentStreak: number
  completionRate: number
  totalPracticeTime: number
}

interface UpcomingInterview {
  id: string
  title: string
  type: string
  date: string
  time: string
  difficulty: string
}

interface RecentActivity {
  id: string
  type: string
  title: string
  timestamp: string
  score?: number
  status: string
}

export default function ModernDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 24,
    averageScore: 78,
    weeklyProgress: 12,
    currentStreak: 5,
    completionRate: 85,
    totalPracticeTime: 1240
  })
  
  const [upcomingInterviews] = useState<UpcomingInterview[]>([
    {
      id: '1',
      title: 'System Design Interview',
      type: 'Technical',
      date: 'Tomorrow',
      time: '3:00 PM',
      difficulty: 'Hard'
    },
    {
      id: '2',
      title: 'Behavioral Interview',
      type: 'Behavioral',
      date: 'Friday',
      time: '2:00 PM',
      difficulty: 'Medium'
    }
  ])
  
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'interview',
      title: 'Frontend Technical Interview',
      timestamp: '2 hours ago',
      score: 85,
      status: 'completed'
    },
    {
      id: '2',
      type: 'practice',
      title: 'Data Structures Practice',
      timestamp: '5 hours ago',
      score: 92,
      status: 'completed'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Unlocked: Interview Master Badge',
      timestamp: 'Yesterday',
      status: 'new'
    }
  ])
  
  const quickActions = [
    {
      title: 'Start Interview',
      description: 'Begin a new interview session',
      icon: Video,
      href: '/interview',
      color: 'bg-blue-500'
    },
    {
      title: 'Practice Questions',
      description: 'Browse question bank',
      icon: BookOpen,
      href: '/practice',
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Mock Interview',
      description: 'Take a mock interview',
      icon: Users,
      href: '/mock',
      color: 'bg-orange-500'
    }
  ]
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'hard':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return Video
      case 'practice':
        return BookOpen
      case 'achievement':
        return Award
      default:
        return MessageSquare
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session?.user?.name || 'User'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You're on a {stats.currentStreak} day streak. Keep it up!
          </p>
        </div>
        <Link
          href="/interview"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="h-5 w-5" />
          Start Interview
        </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {stats.weeklyProgress}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalInterviews}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Interviews
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.averageScore}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Score
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Day Streak
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatTime(stats.totalPracticeTime)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Practice Time
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className={cn("inline-flex p-3 rounded-lg mb-4", action.color)}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {action.description}
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                Get Started
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Interviews */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Interviews
              </h2>
              <Link
                href="/interview/history"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {interview.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{interview.date}</span>
                        <span>{interview.time}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs", getDifficultyColor(interview.difficulty))}>
                          {interview.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/interview/${interview.id}`}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No upcoming interviews scheduled
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </span>
                      {activity.score && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Score: {activity.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
