'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
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

// Remove hardcoded data - will fetch from Supabase

export default function PracticePage() {
  const router = useRouter()
  const { supabase, user, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])

  // Load user and questions from Supabase
  useEffect(() => {
    if (!authLoading && user) {
      loadData()
    } else if (!authLoading && !user) {
      router.push('/auth/supabase-signin?redirect=/practice')
    }
  }, [authLoading, user])
  
  const loadData = async () => {
    try {
      setLoading(true)
      
      // User is already available from context
      if (!user) {
        console.log('No user in loadData')
        return
      }
      
      // Fetch questions from Supabase
      const { data: questionsData, error: questionsError } = await supabase
        .from('practice_questions')
        .select('*')
        .order('popularity', { ascending: false })
      
      if (questionsError) {
        console.error('Error fetching questions:', questionsError)
        // If table doesn't exist, create sample data
        if (questionsError.code === '42P01') {
          await createSampleQuestions()
        }
      } else if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData)
        setFilteredQuestions(questionsData)
        
        // Generate categories from questions
        const uniqueCategories = Array.from(new Set(questionsData.map(q => q.category)))
        const categoriesWithCount = [
          { name: 'All Categories', count: questionsData.length, icon: BookOpen },
          ...uniqueCategories.map(cat => ({
            name: cat,
            count: questionsData.filter(q => q.category === cat).length,
            icon: getCategoryIcon(cat)
          }))
        ]
        setCategories(categoriesWithCount)
      } else {
        // No questions found, create sample data
        await createSampleQuestions()
      }
      
      // Fetch user attempts with error handling
      const { data: attempts, error: attemptsError } = await supabase
        .from('user_question_attempts')
        .select('question_id, score')
        .eq('user_id', user.id)
      
      if (attemptsError && attemptsError.code !== '42P01') {
        console.error('Error fetching attempts:', attemptsError)
      }
      
      if (attempts) {
        const questionsWithAttempts = questionsData?.map(q => {
          const attempt = attempts.find(a => a.question_id === q.id)
          return {
            ...q,
            hasAttempted: !!attempt,
            lastScore: attempt?.score
          }
        }) || []
        setQuestions(questionsWithAttempts)
        setFilteredQuestions(questionsWithAttempts)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const createSampleQuestions = async () => {
    try {
      // Only create sample questions in development or if explicitly needed
      const sampleQuestions = [
      {
        title: 'Two Sum Problem',
        description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
        difficulty: 'easy',
        category: 'Arrays',
        timeEstimate: 15,
        popularity: 95,
        successRate: 87,
        tags: ['Hash Table', 'Array']
      },
      {
        title: 'Tell Me About Yourself',
        description: 'A common behavioral interview question that requires a structured and compelling personal introduction.',
        difficulty: 'medium',
        category: 'Behavioral',
        timeEstimate: 5,
        popularity: 98,
        successRate: 73,
        tags: ['Self Introduction', 'Personal Branding']
      },
      {
        title: 'Design a URL Shortener',
        description: 'Design a web service that shortens URLs. Consider scalability, reliability, and performance.',
        difficulty: 'hard',
        category: 'System Design',
        timeEstimate: 45,
        popularity: 89,
        successRate: 56,
        tags: ['Distributed Systems', 'Database Design', 'Caching']
      }
    ]
    
      const { data, error } = await supabase
        .from('practice_questions')
        .insert(sampleQuestions)
        .select()
      
      if (!error && data) {
        setQuestions(data)
        setFilteredQuestions(data)
      }
    } catch (error) {
      console.error('Error creating sample questions:', error)
    }
  }
  
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'Arrays': Target,
      'Trees': Brain,
      'Dynamic Programming': Zap,
      'System Design': Target,
      'Behavioral': Users
    }
    return iconMap[category] || BookOpen
  }
  
  useEffect(() => {
    let filtered = questions

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
  }, [searchQuery, selectedCategory, selectedDifficulty, questions])

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

  const completedQuestions = questions.filter((q: Question) => q.hasAttempted).length
  const averageScore = questions
    .filter((q: Question) => q.hasAttempted && q.lastScore)
    .reduce((acc: number, q: Question) => acc + (q.lastScore || 0), 0) / (completedQuestions || 1)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Practice Questions</h1>
        <p className="text-muted-foreground">
          Sharpen your interview skills with our comprehensive collection of practice questions.
        </p>
      </div>
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Attempted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedQuestions}/{questions.length}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((completedQuestions / questions.length) * 100)}% completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{completedQuestions > 0 ? Math.round(averageScore) : 0}%</p>
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
                      <p className="text-3xl font-bold text-gray-900">{question.lastScore}%</p>
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
  )
}