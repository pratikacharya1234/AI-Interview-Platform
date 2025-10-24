'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { questionService, Question, QuestionFilters, QuestionSort } from '@/lib/api/questions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Trophy,
  Target,
  Code,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const TYPES = ['multiple_choice', 'coding', 'text'] as const
const PAGE_SIZES = [10, 20, 50, 100]

export default function QuestionsList() {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtering and search
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [sort, setSort] = useState<QuestionSort>({ field: 'createdAt', order: 'desc' })

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Bulk selection
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set())

  // Topics and tags for filters
  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch questions
  useEffect(() => {
    if (!authLoading) {
      loadQuestions()
    }
  }, [debouncedSearch, filters, sort, page, pageSize, authLoading])

  // Load topics and tags
  useEffect(() => {
    loadTopicsAndTags()
  }, [])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const filterParams: QuestionFilters = {
        ...filters,
        search: debouncedSearch || undefined
      }

      const result = await questionService.getQuestions(
        filterParams,
        sort,
        page,
        pageSize,
        user?.id
      )

      setQuestions(result.questions)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } catch (err) {
      console.error('Error loading questions:', err)
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const loadTopicsAndTags = async () => {
    try {
      const [topics, tags] = await Promise.all([
        questionService.getTopics(),
        questionService.getTags()
      ])
      setAvailableTopics(topics)
      setAvailableTags(tags)
    } catch (err) {
      console.error('Error loading topics/tags:', err)
    }
  }

  const toggleDifficultyFilter = (difficulty: typeof DIFFICULTIES[number]) => {
    setFilters(prev => {
      const currentDifficulties = prev.difficulty || []
      const newDifficulties = currentDifficulties.includes(difficulty)
        ? currentDifficulties.filter(d => d !== difficulty)
        : [...currentDifficulties, difficulty]
      return { ...prev, difficulty: newDifficulties.length > 0 ? newDifficulties : undefined }
    })
    setPage(1)
  }

  const toggleTypeFilter = (type: typeof TYPES[number]) => {
    setFilters(prev => {
      const currentTypes = prev.type || []
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type]
      return { ...prev, type: newTypes.length > 0 ? newTypes : undefined }
    })
    setPage(1)
  }

  const toggleStatusFilter = (status: 'not_attempted' | 'attempted' | 'solved') => {
    setFilters(prev => {
      const currentStatuses = prev.status || []
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status]
      return { ...prev, status: newStatuses.length > 0 ? newStatuses : undefined }
    })
    setPage(1)
  }

  const toggleTopicFilter = (topic: string) => {
    setFilters(prev => {
      const currentTopics = prev.topic || []
      const newTopics = currentTopics.includes(topic)
        ? currentTopics.filter(t => t !== topic)
        : [...currentTopics, topic]
      return { ...prev, topic: newTopics.length > 0 ? newTopics : undefined }
    })
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
    setPage(1)
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id)))
    }
  }

  const startPracticeMode = () => {
    if (selectedQuestions.size === 0) return
    const questionIds = Array.from(selectedQuestions).join(',')
    router.push(`/practice/session?questions=${questionIds}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'hard': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'attempted': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default: return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding': return <Code className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (authLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
        <p className="text-gray-600">
          Practice coding problems and interview questions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search questions by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-4">
          {/* Difficulty Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map(difficulty => (
                <Button
                  key={difficulty}
                  variant={filters.difficulty?.includes(difficulty) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleDifficultyFilter(difficulty)}
                  className="capitalize"
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <p className="text-sm font-medium mb-2">Type</p>
            <div className="flex gap-2">
              {TYPES.map(type => (
                <Button
                  key={type}
                  variant={filters.type?.includes(type) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleTypeFilter(type)}
                  className="capitalize"
                >
                  {type.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          {user && (
            <div>
              <p className="text-sm font-medium mb-2">Status</p>
              <div className="flex gap-2">
                {(['not_attempted', 'attempted', 'solved'] as const).map(status => (
                  <Button
                    key={status}
                    variant={filters.status?.includes(status) ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatusFilter(status)}
                    className="capitalize"
                  >
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Topic Filter */}
        {availableTopics.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Topics</p>
            <div className="flex flex-wrap gap-2">
              {availableTopics.slice(0, 10).map(topic => (
                <Button
                  key={topic}
                  variant={filters.topic?.includes(topic) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleTopicFilter(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sort and Page Size */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Select
              value={`${sort.field}-${sort.order}`}
              onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSort({ field: field as QuestionSort['field'], order: order as 'asc' | 'desc' })
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="difficulty-asc">Easiest First</SelectItem>
                <SelectItem value="difficulty-desc">Hardest First</SelectItem>
                <SelectItem value="successRate-asc">Lowest Success Rate</SelectItem>
                <SelectItem value="successRate-desc">Highest Success Rate</SelectItem>
                <SelectItem value="attemptCount-desc">Most Attempted</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {Object.keys(filters).length > 0 && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.size > 0 && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {selectedQuestions.size} question{selectedQuestions.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={startPracticeMode}>
                  Start Practice Mode
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedQuestions(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No questions found matching your filters
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 px-4">
            <Checkbox
              checked={selectedQuestions.size === questions.length && questions.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>

          {/* Question Cards */}
          {questions.map(question => (
            <Card
              key={question.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                selectedQuestions.has(question.id) && "ring-2 ring-blue-500"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => toggleQuestionSelection(question.id)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Question Content */}
                  <div
                    className="flex-1"
                    onClick={() => router.push(`/questions/${question.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(question.userStatus || 'not_attempted')}
                        <h3 className="font-semibold text-lg">{question.title}</h3>
                      </div>
                      <Badge className={cn("border", getDifficultyColor(question.difficulty))}>
                        {question.difficulty}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {question.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(question.type)}
                        <span className="capitalize">{question.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{question.points} points</span>
                      </div>
                      {question.timeLimit && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{question.timeLimit} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{question.successRate?.toFixed(0)}% success rate</span>
                      </div>
                      <div className="text-gray-400">
                        {question.attemptCount} attempts
                      </div>
                    </div>

                    {question.tags && question.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {question.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {question.userScore !== undefined && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Your best score: </span>
                        <span className="font-medium text-blue-600">{question.userScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && questions.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} questions
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
