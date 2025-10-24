'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Medal, 
  Star, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  CheckCircle,
  Lock,
  Zap,
  Clock,
  BarChart3
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  category: 'interview' | 'performance' | 'consistency' | 'special'
  icon: any
  isUnlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const achievements: Achievement[] = [
  {
    id: 'first-interview',
    title: 'First Steps',
    description: 'Complete your first AI interview',
    category: 'interview',
    icon: Target,
    isUnlocked: true,
    unlockedAt: '2024-01-15',
    progress: 1,
    maxProgress: 1,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'interview-streak-5',
    title: 'Consistent Performer',
    description: 'Complete interviews 5 days in a row',
    category: 'consistency',
    icon: Calendar,
    isUnlocked: true,
    unlockedAt: '2024-01-20',
    progress: 5,
    maxProgress: 5,
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'high-score',
    title: 'Top Performer',
    description: 'Achieve a score of 90% or higher',
    category: 'performance',
    icon: Trophy,
    isUnlocked: false,
    progress: 87,
    maxProgress: 90,
    points: 300,
    rarity: 'epic'
  },
  {
    id: 'interview-master',
    title: 'Interview Master',
    description: 'Complete 100 interviews',
    category: 'interview',
    icon: Medal,
    isUnlocked: false,
    progress: 23,
    maxProgress: 100,
    points: 1000,
    rarity: 'legendary'
  },
  {
    id: 'quick-thinker',
    title: 'Quick Thinker',
    description: 'Answer 10 questions in under 2 minutes each',
    category: 'performance',
    icon: Zap,
    isUnlocked: false,
    progress: 6,
    maxProgress: 10,
    points: 150,
    rarity: 'rare'
  }
]

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100'
    case 'rare': return 'text-blue-600 bg-blue-100'
    case 'epic': return 'text-purple-600 bg-purple-100'
    case 'legendary': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export default function AchievementsPage() {
  const { user } = useSupabase()
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0)

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'All Achievements', count: totalAchievements },
    { id: 'interview', label: 'Interview', count: achievements.filter(a => a.category === 'interview').length },
    { id: 'performance', label: 'Performance', count: achievements.filter(a => a.category === 'performance').length },
    { id: 'consistency', label: 'Consistency', count: achievements.filter(a => a.category === 'consistency').length },
    { id: 'special', label: 'Special', count: achievements.filter(a => a.category === 'special').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock achievements as you improve your interview skills.
        </p>
      </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +125 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedAchievements}/{totalAchievements}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((unlockedAchievements / totalAchievements) * 100)}% completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rank</CardTitle>
              <Medal className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Silver</div>
              <p className="text-xs text-muted-foreground">
                Next: Gold (2,500 pts)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.label} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => {
                const Icon = achievement.icon
                const progressPercentage = (achievement.progress / achievement.maxProgress) * 100
                
                return (
                  <Card 
                    key={achievement.id}
                    className={`relative transition-all hover:shadow-lg ${
                      achievement.isUnlocked 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.isUnlocked 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {achievement.isUnlocked ? (
                              <Icon className="h-5 w-5" />
                            ) : (
                              <Lock className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{achievement.title}</CardTitle>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {achievement.isUnlocked && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription>{achievement.description}</CardDescription>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <span className="text-xs text-muted-foreground">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest achievement unlocks and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.filter(a => a.isUnlocked).slice(0, 3).map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Earned {achievement.points} points
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
    </div>
  )
}