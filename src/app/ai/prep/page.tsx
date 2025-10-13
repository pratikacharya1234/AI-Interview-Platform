'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  Calendar, 
  CheckCircle,
  Clock,
  Brain,
  Star,
  TrendingUp,
  BookOpen,
  Play,
  RefreshCw,
  Zap,
  Award,
  AlertCircle,
  ChevronRight
} from 'lucide-react'

interface PrepPlan {
  id: string
  title: string
  targetRole: string
  targetCompany: string
  interviewDate: string
  daysRemaining: number
  overallProgress: number
  categories: {
    technical: { progress: number; tasks: number; completed: number }
    behavioral: { progress: number; tasks: number; completed: number }
    systemDesign: { progress: number; tasks: number; completed: number }
    companySpecific: { progress: number; tasks: number; completed: number }
  }
  dailyGoals: string[]
  weakAreas: string[]
  strengths: string[]
  aiRecommendations: string[]
}

interface StudySession {
  id: string
  title: string
  category: string
  difficulty: string
  estimatedTime: number
  completed: boolean
  priority: 'High' | 'Medium' | 'Low'
  description: string
}

const currentPlan: PrepPlan = {
  id: '1',
  title: 'Senior Software Engineer Preparation',
  targetRole: 'Senior Software Engineer',
  targetCompany: 'Google',
  interviewDate: '2024-10-20T09:00:00Z',
  daysRemaining: 9,
  overallProgress: 68,
  categories: {
    technical: { progress: 75, tasks: 12, completed: 9 },
    behavioral: { progress: 60, tasks: 8, completed: 5 },
    systemDesign: { progress: 45, tasks: 6, completed: 3 },
    companySpecific: { progress: 80, tasks: 5, completed: 4 }
  },
  dailyGoals: [
    'Complete 2 medium-difficulty coding problems',
    'Practice 1 behavioral story using STAR method',
    'Review Google engineering principles',
    'Mock interview session (30 minutes)'
  ],
  weakAreas: [
    'System design scalability concepts',
    'Behavioral story structure and delivery',
    'Time complexity analysis explanation'
  ],
  strengths: [
    'Algorithm problem solving',
    'Code implementation quality',
    'Technical knowledge depth'
  ],
  aiRecommendations: [
    'Focus on distributed systems concepts for remaining system design prep',
    'Practice explaining algorithms step-by-step to improve communication',
    'Prepare 3 more quantified impact stories for behavioral questions',
    'Review Googles leadership principles and prepare specific examples'
  ]
}

const studySessions: StudySession[] = [
  {
    id: '1',
    title: 'Binary Tree Algorithms',
    category: 'Technical',
    difficulty: 'Medium',
    estimatedTime: 45,
    completed: false,
    priority: 'High',
    description: 'Practice tree traversal, BST operations, and path algorithms'
  },
  {
    id: '2',
    title: 'Leadership Stories Practice',
    category: 'Behavioral',
    difficulty: 'Medium',
    estimatedTime: 30,
    completed: false,
    priority: 'High',
    description: 'Develop and practice 2 leadership examples using STAR method'
  },
  {
    id: '3',
    title: 'Distributed Cache Design',
    category: 'System Design',
    difficulty: 'Hard',
    estimatedTime: 60,
    completed: false,
    priority: 'High',
    description: 'Design a distributed caching system like Redis or Memcached'
  },
  {
    id: '4',
    title: 'Google Culture Deep Dive',
    category: 'Company Specific',
    difficulty: 'Easy',
    estimatedTime: 20,
    completed: true,
    priority: 'Medium',
    description: 'Study Google values, recent projects, and engineering culture'
  },
  {
    id: '5',
    title: 'Dynamic Programming Mastery',
    category: 'Technical',
    difficulty: 'Hard',
    estimatedTime: 90,
    completed: false,
    priority: 'Medium',
    description: 'Advanced DP patterns: knapsack, LIS, palindromes, intervals'
  },
  {
    id: '6',
    title: 'Conflict Resolution Stories',
    category: 'Behavioral',
    difficulty: 'Medium',
    estimatedTime: 25,
    completed: true,
    priority: 'Low',
    description: 'Prepare examples of handling team conflicts and disagreements'
  }
]

export default function PersonalizedPrepPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [completedTasks, setCompletedTasks] = useState<string[]>(['4', '6'])

  const filteredSessions = selectedCategory === 'all' 
    ? studySessions 
    : studySessions.filter(session => 
        session.category.toLowerCase().replace(' ', '') === selectedCategory
      )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  return <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-600" />
              Personalized Prep Plan
              <Badge className="bg-purple-100 text-purple-800">AI-Optimized</Badge>
            </h1>
            <p className="text-muted-foreground">
              Customized study plan based on your goals, timeline, and performance data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Plan
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Start Session
            </Button>
          </div>
        </div>

        {/* Interview Countdown */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{currentPlan.targetRole} at {currentPlan.targetCompany}</h3>
                <p className="text-muted-foreground">
                  Interview Date: {formatDate(currentPlan.interviewDate)}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{currentPlan.daysRemaining}</div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span className="font-medium">{currentPlan.overallProgress}% Complete</span>
              </div>
              <Progress value={currentPlan.overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Progress by Category */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(currentPlan.categories).map(([category, data]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {category === 'systemDesign' ? 'System Design' : 
                   category === 'companySpecific' ? 'Company Specific' : category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{data.progress}%</span>
                    <span className="text-sm text-muted-foreground">
                      {data.completed}/{data.tasks}
                    </span>
                  </div>
                  <Progress value={data.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today&apos;s Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Goals
              </CardTitle>
              <CardDescription>
                Your personalized daily objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentPlan.dailyGoals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{goal}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                  {currentPlan.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Star className="h-3 w-3 text-green-500" />
                      {strength}
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-sm text-orange-700 dark:text-orange-400 mb-2">Focus Areas</h4>
                  {currentPlan.weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Jump into focused practice sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between gap-2">
                <span>Practice Coding</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span>Behavioral Mock</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span>System Design</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between gap-2">
                <span>Company Research</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Study Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Study Sessions
            </CardTitle>
            <CardDescription>
              AI-curated sessions optimized for your interview timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                <TabsTrigger value="systemdesign">System Design</TabsTrigger>
                <TabsTrigger value="companyspecific">Company</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="space-y-4 mt-6">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{session.title}</h4>
                            <Badge className={getPriorityColor(session.priority)}>
                              {session.priority}
                            </Badge>
                            <Badge className={getDifficultyColor(session.difficulty)}>
                              {session.difficulty}
                            </Badge>
                            {completedTasks.includes(session.id) && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {session.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.estimatedTime} min
                            </span>
                            <span className="capitalize">{session.category}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {completedTasks.includes(session.id) ? (
                            <Button 
                              variant="outline" 
                              onClick={() => toggleTaskComplete(session.id)}
                              className="gap-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Redo
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => toggleTaskComplete(session.id)}
                              className="gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Strategic advice based on your timeline and performance patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPlan.aiRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border">
                  <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-900 dark:text-purple-100">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
}