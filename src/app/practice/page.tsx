'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/navigation/breadcrumbs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Brain
} from 'lucide-react'

interface Question {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  timeEstimate: number
  popularity: number
  successRate: number
  tags: string[]
  hasAttempted: boolean
  lastScore?: number
}

const practiceQuestions: Question[] = [
  {
    id: '1',
    title: 'Two Sum Problem',
    description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    difficulty: 'easy',
    category: 'Arrays',
    timeEstimate: 15,
    popularity: 95,
    successRate: 87,
    tags: ['Hash Table', 'Array'],
    hasAttempted: true,
    lastScore: 92
  },
  {
    id: '2',
    title: 'Tell Me About Yourself',
    description: 'A common behavioral interview question that requires a structured and compelling personal introduction.',
    difficulty: 'medium',
    category: 'Behavioral',
    timeEstimate: 5,
    popularity: 98,
    successRate: 73,
    tags: ['Self Introduction', 'Personal Branding'],
    hasAttempted: true,
    lastScore: 78
  },
  {
    id: '3',
    title: 'Design a URL Shortener',
    description: 'Design a web service that shortens URLs like bit.ly. Consider scalability, reliability, and performance.',
    difficulty: 'hard',
    category: 'System Design',
    timeEstimate: 45,
    popularity: 89,
    successRate: 56,
    tags: ['Distributed Systems', 'Database Design', 'Caching'],
    hasAttempted: false
  },
  {
    id: '4',
    title: 'Binary Tree Traversal',
    description: 'Implement different methods to traverse a binary tree (inorder, preorder, postorder).',
    difficulty: 'medium',
    category: 'Trees',
    timeEstimate: 25,
    popularity: 91,
    successRate: 72,
    tags: ['Binary Tree', 'Recursion', 'DFS'],
    hasAttempted: false
  },
  {
    id: '5',
    title: 'Handling Conflict at Work',
    description: 'Describe a time when you had a disagreement with a colleague and how you resolved it.',
    difficulty: 'medium',
    category: 'Behavioral',
    timeEstimate: 8,
    popularity: 86,
    successRate: 69,
    tags: ['Conflict Resolution', 'Communication', 'Leadership'],
    hasAttempted: false
  },
  {
    id: '6',
    title: 'Maximum Subarray Sum',
    description: 'Find the contiguous subarray with the largest sum using Kadanes algorithm.',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    timeEstimate: 20,
    popularity: 88,
    successRate: 64,
    tags: ['Dynamic Programming', 'Array'],
    hasAttempted: false
  }
]

const categories = [
  { name: 'All Categories', count: practiceQuestions.length, icon: BookOpen },
  { name: 'Arrays', count: practiceQuestions.filter(q => q.category === 'Arrays').length, icon: Target },
  { name: 'Trees', count: practiceQuestions.filter(q => q.category === 'Trees').length, icon: Brain },
  { name: 'Dynamic Programming', count: practiceQuestions.filter(q => q.category === 'Dynamic Programming').length, icon: Zap },
  { name: 'System Design', count: practiceQuestions.filter(q => q.category === 'System Design').length, icon: Target },
  { name: 'Behavioral', count: practiceQuestions.filter(q => q.category === 'Behavioral').length, icon: Users }
]

export default function PracticePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [filteredQuestions, setFilteredQuestions] = useState(practiceQuestions)

  useEffect(() => {
    let filtered = practiceQuestions

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty)
    }

    setFilteredQuestions(filtered)
  }, [searchQuery, selectedCategory, selectedDifficulty])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const startPractice = (questionId: string) => {
    router.push(`/practice/${questionId}`)
  }

  const attemptedQuestions = practiceQuestions.filter(q => q.hasAttempted).length
  const averageScore = practiceQuestions
    .filter(q => q.lastScore)
    .reduce((acc, q) => acc + (q.lastScore || 0), 0) / practiceQuestions.filter(q => q.lastScore).length || 0

  return (
    <AppLayout>
      <PageHeader 
        title="Practice Questions"
        description="Sharpen your interview skills with our comprehensive collection of practice questions."
      />

      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Attempted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attemptedQuestions}/{practiceQuestions.length}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((attemptedQuestions / practiceQuestions.length) * 100)}% completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Practice Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">
                Keep it up!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Practiced</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Browse questions by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "primary" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-center">
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.count} questions</p>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions, tags, or topics..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{question.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">{question.category}</Badge>
                      {question.hasAttempted && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Attempted
                        </Badge>
                      )}
                    </div>
                  </div>
                  {question.lastScore && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{question.lastScore}%</p>
                      <p className="text-xs text-muted-foreground">Last score</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{question.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {question.timeEstimate} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {question.popularity}% popularity
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {question.successRate}% success
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => startPractice(question.id)}
                  className="w-full"
                  variant={question.hasAttempted ? "outline" : "primary"}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {question.hasAttempted ? 'Practice Again' : 'Start Practice'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse different categories.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All Categories')
                  setSelectedDifficulty('all')
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}