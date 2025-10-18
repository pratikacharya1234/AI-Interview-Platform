'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Code, 
  Users, 
  Layout,
  Brain,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock,
  Target,
  AlertCircle,
  RefreshCw,
  Database,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle
} from 'lucide-react'
import QuestionCard from './QuestionCard'

// Dynamic imports for client-only components
const Dialog = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.Dialog),
  { ssr: false }
)
const DialogContent = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.DialogContent),
  { ssr: false }
)
const DialogHeader = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.DialogHeader),
  { ssr: false }
)
const DialogTitle = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.DialogTitle),
  { ssr: false }
)
const DialogDescription = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.DialogDescription),
  { ssr: false }
)

const QuestionGenerator = dynamic(() => import('./QuestionGenerator'), { ssr: false })
const QuestionDetail = dynamic(() => import('./QuestionDetail'), { ssr: false })

// Types matching the production schema
interface Question {
  id: string
  question_text: string
  question_type: 'coding' | 'behavioral' | 'system_design' | 'technical' | 'open_ended'
  category_id: string | null
  difficulty_level: 'easy' | 'medium' | 'hard' | 'expert'
  estimated_time_minutes: number
  points: number
  description?: string
  sample_answer?: string
  hints?: string[]
  solution_approach?: string
  tags?: string[]
  skills_tested?: string[]
  times_asked: number
  times_answered: number
  average_score?: number
  success_rate?: number
  is_active: boolean
  is_premium: boolean
  is_reviewed: boolean
  created_at: string
  updated_at: string
  // Joined data
  question_categories?: {
    id: string
    name: string
    slug: string
    icon?: string
    color?: string
    description?: string
  }
  // Client-side flag
  is_attempted?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string | null
  display_order: number
  is_active: boolean
  question_count: number
  created_at: string
  updated_at: string
}

interface QuestionFilters {
  category: string
  difficulty: string
  type: string
  search: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function QuestionBank() {
  const router = useRouter()
  
  // State management
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState<QuestionFilters>({
    category: 'all',
    difficulty: 'all',
    type: 'all',
    search: ''
  })
  
  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  })
  
  // UI state
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch data when filters or pagination changes
  useEffect(() => {
    if (mounted) {
      fetchQuestions()
    }
  }, [mounted, filters, pagination.page])

  // Fetch categories once on mount
  useEffect(() => {
    if (mounted) {
      fetchCategories()
    }
  }, [mounted])

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/questions/categories')
      const data = await response.json()
      
      if (data.success && data.categories) {
        setCategories(data.categories)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }, [])

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/questions?${params}`)
      const data = await response.json()
      
      if (data.questions) {
        setQuestions(data.questions)
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }))
        }
      } else {
        setQuestions([])
        setError('No questions available at the moment.')
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Unable to load questions. Please check your connection and try again.')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchQuestions()
    setIsRefreshing(false)
  }, [fetchQuestions])

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof QuestionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Handle question generation
  const handleGenerateQuestions = useCallback(async (params: any) => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh questions list
        await fetchQuestions()
        setShowGenerator(false)
        // Show success message (replace alert with toast in production)
        console.log(`Successfully generated ${data.count} questions!`)
      } else {
        const error = await response.json()
        console.error(`Failed to generate questions: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [fetchQuestions])

  // Memoized values to prevent re-renders
  const stats = useMemo(() => {
    const attemptedCount = questions.filter(q => q.is_attempted).length
    const avgScore = questions.length > 0
      ? Math.round(
          questions.reduce((sum, q) => sum + (q.average_score || 0), 0) /
          questions.filter(q => q.average_score).length
        ) || 0
      : 0
    
    return {
      total: questions.length,
      attempted: attemptedCount,
      avgScore
    }
  }, [questions])

  // Reset all filters
  const handleReset = useCallback(() => {
    setFilters({
      category: 'all',
      difficulty: 'all',
      type: 'all',
      search: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // Don't render dynamic content until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Question Bank
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and practice with AI-generated interview questions
          </p>
        </div>
        <Button
          onClick={() => setShowGenerator(true)}
          className="inline-flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate Questions
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Filter className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attempted</p>
                <p className="text-2xl font-bold">{stats.attempted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.question_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="open_ended">Open Ended</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="system_design">System Design</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchQuestions()}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Grid */}
      {!error && loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !error && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={{
                ...question,
                tags: question.tags || [],
                average_score: question.average_score || 0,
                is_attempted: question.is_attempted || false
              }}
              onClick={() => setSelectedQuestion(question)}
            />
          ))}
        </div>
      ) : !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Questions Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or generate new questions
            </p>
            <Button onClick={() => setShowGenerator(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Questions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Question Generator Dialog - Only render on client */}
      {mounted && showGenerator && (
        <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Interview Questions</DialogTitle>
              <DialogDescription>
                Use AI to generate custom interview questions for your preparation
              </DialogDescription>
            </DialogHeader>
            <QuestionGenerator
              categories={categories}
              onGenerate={handleGenerateQuestions}
              onClose={() => setShowGenerator(false)}
              isGenerating={isGenerating}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Question Detail Dialog - Only render on client */}
      {mounted && selectedQuestion && (
        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <QuestionDetail
              question={{
                ...selectedQuestion,
                tags: selectedQuestion.tags || [],
                question_categories: selectedQuestion.question_categories ? {
                  name: selectedQuestion.question_categories.name,
                  color: selectedQuestion.question_categories.color || 'gray'
                } : undefined
              }}
              onClose={() => setSelectedQuestion(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
