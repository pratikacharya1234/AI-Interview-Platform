'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
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
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Bookmark,
  Share2,
  Eye,
  MessageSquare,
  XCircle
} from 'lucide-react'
import QuestionCard from './QuestionCard'

// Dynamically import components that use Dialog to prevent SSR issues
const Dialog = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.Dialog),
  { ssr: false }
)
const DialogContent = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.DialogContent),
  { ssr: false }
)
const DialogDescription = dynamic(
  () => import('@/components/ui/dialog').then(mod => mod.DialogDescription),
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

const QuestionGenerator = dynamic(() => import('./QuestionGenerator'), { ssr: false })
const QuestionDetail = dynamic(() => import('./QuestionDetail'), { ssr: false })

interface Question {
  id: string
  question_text: string
  question_type: string
  category_id: string
  difficulty_level: string
  estimated_time_minutes: number
  sample_answer: string
  tags: string[]
  is_attempted: boolean
  times_asked: number
  average_score: number
  question_categories: {
    id: string
    name: string
    slug: string
    icon: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  question_count: number
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchCategories()
      fetchQuestions()
    }
  }, [mounted, selectedCategory, selectedDifficulty, selectedType, searchQuery, currentPage])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/questions/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        throw new Error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }, [])

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        throw new Error('Failed to fetch questions')
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load questions. Please try again later.')
      setQuestions([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedCategory, selectedDifficulty, selectedType, searchQuery])

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

  const handleReset = useCallback(() => {
    setSelectedCategory('all')
    setSelectedDifficulty('all')
    setSelectedType('all')
    setSearchQuery('')
    setCurrentPage(1)
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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
            <Select value={selectedType} onValueChange={setSelectedType}>
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
              question={question}
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
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
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
              isGenerating={isGenerating}
              onClose={() => setShowGenerator(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Question Detail Dialog - Only render on client */}
      {mounted && selectedQuestion && (
        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <QuestionDetail
              question={selectedQuestion}
              onClose={() => setSelectedQuestion(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
